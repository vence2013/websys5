/* 标签只提供添加和删除功能。
 */
var app = angular.module('tagApp', []);

appConfiguration(app)
.controller('tagCtrl', tagCtrl);


function tagCtrl($scope, $http, user) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    $scope.user = user;
    // 标签
    $scope.opts = {'str':'', 'page':1, 'pageSize':100, 'order': ['createdAt', 'DESC']};
    $scope.total   = 0;
    $scope.pagelist= [];
    $scope.taglist = [];

    // opts对象更改后刷新标签列表。
    $scope.$watch('opts', get, true);
    viewReset();

    function viewReset() {
        $scope.tagsel  = null;
        $scope.filelist = [];
        $scope.doclist  = [];
    }

    $scope.get = get;

    function get() {
        $http
        .get('/tag/search', {params: $scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;
            viewReset();
            var ret = res.data.message;
            $scope.taglist = ret.taglist;

            $scope['total']     = ret.total;
            $scope.opts['page'] = ret.page;
            $scope.pagelist = genPagelist(ret.page, ret.pageMaxium);
        })
    }

    $scope.add = ()=>{
        var name = $scope.opts.str.replace(/^\s+|\s+$/g,'');
        if (!name) { return toastr.info('请输入标签！'); }

        $http
        .post('/tag', {'name': name})
        .then((res)=>{
            if (errorCheck(res)) return ;  
            $scope.opts['str'] = '';          
            get();
        })      
    }

    $scope.delete = ()=>{
        $http
        .delete('/tag/'+$scope.tagsel.id)
        .then((res)=>{
            $("#deleteConfirmWnd").modal( "hide" );
            get();  // 删除操作可能没有修改opts对象， 因此需要手动刷新。
        })
    }

    $scope.select = (x)=>{
        $(".badge-danger").removeClass('badge-danger').addClass('badge-secondary');

        if (x == $scope.tagsel) {
            viewReset();
        } else {
            $("h4[id='"+x.id+"']").find('span').removeClass('badge-secondary').addClass('badge-danger');
            $scope.tagsel  = x;
            
            $http
            .get('/tag/relate/'+x.id)
            .then((res)=>{
                if (errorCheck(res)) return ;  

                var ret = res.data.message;
                $scope.filelist = ret.filelist;
                $scope.doclist  = ret.doclist;
            })
        }
    }
}