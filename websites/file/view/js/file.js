var app = angular.module('fileApp', ['treeControl'])

appConfiguration(app)
.controller('fileCtrl', fileCtrl)

function fileCtrl($scope, $http, user) {
    $scope.user = user;
    // 文件列表
    $scope.opts = {'str':'', 'page':1, 'pageSize':24, 'order': ['createdAt', 'DESC']};
    $scope.total   = 0;
    $scope.pagelist = [];
    $scope.filelist = [];
    // 文件详细信息
    $scope.detail   = null;
    $scope.groupRead  = false;
    $scope.otherRead  = false;
    // 目录树相关的数据
    $scope.treeRoot = [];
    $scope.listRoot = [];
    $scope.treeView = [];
    $scope.listView = [];
    $scope.listExpand = []; 
    $scope.nodeSelected = [];
    $scope.treeOptions = { multiSelection: true };
    // 标签
    $scope.tagstr = '';
    $scope.tagres = []; // 有效标签列表。搜索结果过滤tagrel
    $scope.tagrel = []; // 文件关联的标签列表

    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    }; 

    $scope.$watch('opts', get, true);
    $scope.$watch('tagstr', tagGet);


    $scope.get = get;
    
    function get() {
        tagGet();

        $http
        .get('/file/last', {'params': $scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;

            $scope.detail   = null;
            $scope.tagrel   = [];
            $scope.filelist = ret.filelist.map((x)=>{
                var image = ['jpg', 'jpeg', 'png', 'gif'];
                var video = ['mp4', 'avi', 'mkv', 'rmvb'];
                // 判断多媒体文件
                var ext = x.ext.toLowerCase();
                if (image.indexOf(ext)!=-1) { x['media'] = 'image'; }
                else if (video.indexOf(ext)!=-1) { x['media'] = 'video'; }
                return x;
            });
            $scope['total']     = ret.total;
            $scope.opts['page'] = ret.page;
            $scope.pagelist = genPagelist(ret.page, ret.pageMaxium);

            window.setTimeout(()=>{
                $('.image-link').magnificPopup({type:'image'});
            }, 0);
        })
    }


    function categoryRefresh (categoryids) {       
        $http
        .get('/category/tree/0', {})
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            $scope.treeRoot = res.data.message;
            $scope.treeView = res.data.message; 

            // 获取基础数据
            var {dir, list} = treeTravel($scope.treeView, 0, 20);
            var {dir2, list2} = treeSearch(list, categoryids);  
            $scope.listExpand = dir2;
            var sel = [];
            list.map((x)=>{ if (categoryids.indexOf(x.id)!=-1) sel.push(x); });
            $scope.nodeSelected = sel;
            $scope.predicate = (node)=>{ return (list2.indexOf(node.id)!=-1); };
        });
    }

    $scope.focus = (file)=>{
        var idx = $scope.filelist.indexOf(file);
        $('.filesel').removeClass('filesel');
        $('.filelist>div:eq('+idx+')').addClass('filesel');

        $http
        .get('/file/detail/'+file.id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            $scope.detail = res.data.message;
            $scope.tagrel = $scope.detail.tagnames;            
            $scope.groupRead  = ($scope.detail.private.indexOf('GR1')!=-1) ? true : false;
            $scope.otherRead  = ($scope.detail.private.indexOf('OR1')!=-1) ? true : false;

            if ($scope.user && $scope.user.username) { categoryRefresh($scope.detail.categoryids); }
        })
    }

    /* 组用户读取权限和其他用户读取权限具有包含关系
     * 1. 其他用户可读取时， 组用户一定可读取
     * 2. 组用户可读取时， 其他用户选择是否可读取
     */
    $scope.otherReadCheck = ()=>{
        if (!$scope.otherRead) $scope.groupRead = true;
    }
    $scope.groupReadCheck = ()=>{
        if ($scope.groupRead) $scope.otherRead = false;
    }

    $scope.edit = async ()=>{
        var private = '';
        var name = $scope.detail.name;
        var desc = $scope.detail.desc;
        private += $scope.groupRead  ? 'GR1' : 'GR0';
        private += $scope.otherRead  ? 'OR1' : 'OR0';

        $http
        .put('/file/'+$scope.detail.id, {'name':name, 'desc':desc, 'private': private, 'taglist':$scope.tagrel})
        .then((res)=>{
            if (errorCheck(res)) return ;
            toastr.info(res.data.message);
            get();            
        });
    }

    $scope.delete = ()=>{
        $http
        .delete('/file/'+$scope.detail.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            get();
        }); 
    }


    function tagGet() {
        var query = {'str':$scope.tagstr, 'page':1, 'pageSize':100, 'order': ['createdAt', 'DESC']};
        $http
        .get('/tag/search', {params: query})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.tagres = [];
            for (var i=0; (i<ret.taglist.length) && ($scope.tagres.length<6); i++) {
                var name = ret.taglist[i].name;
                if ($scope.tagrel.indexOf(name)==-1) $scope.tagres.push(name);
            }
        })
    }

    $scope.tagSelect = (x)=>{
        if (!$scope.detail) { return toastr.warning('请选择需要编辑的文件'); }
        $scope.tagrel.push(x);
        tagGet();
    }

    $scope.tagUnselect = (x)=>{
        var idx = $scope.tagrel.indexOf(x);
        if (idx!=-1) $scope.tagrel.splice(idx, 1);
        tagGet();
    }


    var Player = null;

    // 播放视频文件
    $scope.play = (videosrc)=>{
        // 销毁当前的播放器
        if ($('#video-box').css('display')=='block') { Player.dispose(); }

        $('#video-box')
        .append('<video id="player" class="video-js" controls autoplay preload="auto" >'+
            '<source src="'+videosrc+'" type="video/mp4">'+
            '</video>')
        .css('display', 'block')

        Player = videojs('player', {width:400, height:200});
        // 关闭按钮
        var CloseButton = videojs.getComponent('CloseButton');  //获取关闭按钮的组件
        videojs.registerComponent('CloseButton', CloseButton);  //注册该组件
        Player.addChild('CloseButton');                         //添加关闭按钮到播放器
        Player.getChild('CloseButton').on('close', function() { //监听关闭事件
            this.player().dispose();                            //释放播放器所占资源
            $('#video-box')
            .css('display', 'block')
        });
    }
}