var app = angular.module('indexApp', ['treeControl', 'angular-clipboard'])

appConfiguration(app)
.controller('indexCtrl', indexCtrl);

function indexCtrl($scope, $http, user) {
    $scope.user = user;
    $scope.file = null;
    $scope.opts = {'page':1, 'pageSize':24, 'name':'', 'desc':'', 'tag':'', 'ext':'', 
        'createget':'', 'createlet':'', 'sizeget':'', 'sizelet':'', 'order':'4'};
    $scope.total = 0;
    $scope.pagelist = [];
    $scope.filelist = [];
    // 目录树相关的数据
    $scope.treeRoot = [];
    $scope.listRoot = [];
    $scope.treeView = [];
    $scope.listView = [];
    $scope.listExpand = []; 
    $scope.nodeSelected = [];
    // 目录搜索
    $scope.predicate  = '';
    $scope.comparator = true;
    $scope.treeOptions = { multiSelection: true };

    $scope.$watch('opts', get, true);
    $scope.$watch('file', (file)=>{
        if (!file) return;
        
        $http
        .get('/file/detail/'+file.id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            $scope.detail = res.data.message;
            if ($scope.detail.categoryids) categoryRefresh($scope.detail.categoryids);
        })
    }, true)

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

    var queryPrevious;

    function get() {
        var query = angular.copy($scope.opts);
        var createget = $scope.opts.createget;
        var createlet = $scope.opts.createlet;
        query['createget'] = (/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(createget)) ? createget : '';
        query['createlet'] = (/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(createlet)) ? createlet : '';
        if (angular.equals(query, queryPrevious)) return;
        queryPrevious = query;

        $http
        .get('/file/search', {params: query})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            if (ret.filelist && ret.filelist.length) {
                $scope.filelist = ret.filelist.map((x)=>{
                    var image = ['jpg', 'jpeg', 'png', 'gif'];
                    var video = ['mp4', 'avi', 'mkv', 'rmvb'];
                    // 判断多媒体文件
                    var ext = x.ext.toLowerCase();
                    if (image.indexOf(ext)!=-1) { x['media'] = 'image'; }
                    else if (video.indexOf(ext)!=-1) { x['media'] = 'video'; }
                    return x;
                });
            } else {
                $scope.filelist = [];
            }

            $scope['total']     = ret.total;
            $scope.opts['page'] = ret.page;
            $scope.pagelist = genPagelist(ret.page, ret.pageMaxium);

            window.setTimeout(()=>{
                $('.image-link').magnificPopup({type:'image'});
            }, 0);            
        })
    }

    $scope.focus = (file)=>{
        $scope.file = file;
        $scope.copyText = file.location;

        var idx = $scope.filelist.indexOf(file);
        $('.filesel').removeClass('filesel');
        $('.filelist>div:eq('+idx+')').addClass('filesel');
    }

    $scope.copySuccess = ()=>{
        toastr.info('Copy Success!', '', {"positionClass": "toast-bottom-right"});
    }

    // 播放视频文件
    $scope.play = (videosrc)=>{
        $('#video-box')
        .css('display', 'block')
        .append('<video id="player" class="video-js"></video>');
        var player = videojs('player', { controls: true, width:400, height:200, autoplay:true,
            sources: [videosrc]
        });
        var CloseButton = videojs.getComponent('CloseButton'); //获取关闭按钮的组件
        videojs.registerComponent('CloseButton', CloseButton); //注册该组件
        player.addChild('CloseButton');                        //添加关闭按钮到播放器
        player.getChild('CloseButton').on('close', function() {//监听关闭事件
            this.player().dispose();                           //释放播放器所占资源
            $('#video-box')
            .css('display', 'block')
        });
    }
}
