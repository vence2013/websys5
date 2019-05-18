var app = angular.module('fileApp', ['treeControl'])

appConfiguration(app)
.controller('editCtrl', editCtrl)
.controller('tagCtrl', tagCtrl)
.controller('categoryCtrl', categoryCtrl)
.controller('fileCtrl', fileCtrl)

function fileCtrl($rootScope, $scope, $http) {
    $rootScope.file = null;
    // 本地变量
    $scope.opts = {'str':'', 'page':1, 'pageSize':24, 'order': ['createdAt', 'DESC']};
    $scope.total   = 0;
    $scope.pagelist = [];
    $scope.filelist = [];

    $scope.$watch('opts', get, true);


    $rootScope.get = get;
    
    function get() {
        $http
        .get('/file/last', {'params': $scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;

            $scope.file  = null;
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

    $scope.select = (file)=>{
        $rootScope.file = file;
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