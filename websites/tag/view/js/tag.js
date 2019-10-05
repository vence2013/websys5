/* 标签只提供添加和删除功能。
 */
var app = angular.module('tagApp', []);

appConfiguration(app)
.controller('tagCtrl', tagCtrl);


function tagCtrl($scope, $http) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 标签
    $scope.opts = {'str':'', 'page':1, 'pageSize':100};
    $scope.pages   = [];
    $scope.taglist = [];

    // opts对象更改后刷新标签列表。
    $scope.$watch('opts', get, true);

    $scope.get = get;

    function get() {
        $http
        .get('/tag/search', {params: $scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;           
            $scope.taglist = ret.taglist;
            // 分页
            $scope.opts['page'] = ret.page;
            $scope.pages = initPage(ret.page, $scope.opts.pageSize, ret.total, 10);
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

            $scope.tagsel  = null;
            get();  // 删除操作可能没有修改opts对象， 因此需要手动刷新。
        })
    }

    $scope.select = (x)=>{
        if (x == $scope.tagsel) {
            $scope.tagsel  = null;
            $(".badge-danger").removeClass('badge-danger').addClass('badge-secondary');            
        } else {
            $scope.tagsel  = x;
            $("h4[id='"+x.id+"']").find('span').removeClass('badge-secondary').addClass('badge-danger');            
        }
    }
}