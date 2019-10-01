var app = angular.module('indexApp', ['treeControl', 'angular-clipboard'])

appConfiguration(app)
.controller('indexCtrl', indexCtrl);

function indexCtrl($scope, $http) {
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 文件
    $scope.file = null;
    $scope.opts = {'page':1, 'pageSize':24, 'name':'', 'desc':'', 'tag':'', 'ext':'', 
        'createget':'', 'createlet':'', 'sizeget':'', 'sizelet':'', 'order':'4'};
    $scope.pages    = [];
    $scope.filelist = [];

    $scope.$watch('opts', get, true);
    $scope.$watch('file', (file)=>{
        if (!file) return;
        
        $http
        .get('/file/detail/'+file.id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            $scope.detail = res.data.message;
        })
    }, true)

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
            $scope.pages = initPage(ret.page, $scope.opts.pageSize, ret.total, 5);

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
        toastr.info('Copy Success!');
    }

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
