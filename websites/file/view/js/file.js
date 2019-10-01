var app = angular.module('fileApp', ['treeControl'])

appConfiguration(app)
.controller('fileCtrl', fileCtrl)

function fileCtrl($scope, $http) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 文件列表
    $scope.opts = {'str':'', 'page':1, 'pageSize':24};
    $scope.pages    = [];
    $scope.filelist = [];
    // 文件详细信息
    $scope.detail   = null;
    // 标签
    $scope.tagstr = '';
    $scope.tagres = []; // 有效标签列表。搜索结果过滤tagrel
    $scope.tagrel = []; // 文件关联的标签列表

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
            $scope.pages = initPage(ret.page, $scope.opts.pageSize, ret.total, 5);

            window.setTimeout(()=>{
                $('.image-link').magnificPopup({type:'image'});
            }, 0);
        })
    }

    $scope.select = (file)=>{
        var idx = $scope.filelist.indexOf(file);
        $('.filesel').removeClass('filesel');
        $('.filelist>div:eq('+idx+')').addClass('filesel');

        $http
        .get('/file/detail/'+file.id)
        .then((res)=>{
            if (errorCheck(res)) return ;            

            $scope.detail = res.data.message;
            $scope.tagrel = $scope.detail.tagnames;

            tagGet();          
        })
    }

    $scope.edit = async ()=>{
        var name = $scope.detail.name;
        var desc = $scope.detail.desc;

        $http
        .put('/file/'+$scope.detail.id, {'name':name, 'desc':desc, 'taglist':$scope.tagrel})
        .then((res)=>{
            if (errorCheck(res)) return ;

            get();  
            toastr.info(res.data.message);                      
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
        var query = {'str':$scope.tagstr, 'page':1, 'pageSize':50, 'order': ['createdAt', 'DESC']};
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