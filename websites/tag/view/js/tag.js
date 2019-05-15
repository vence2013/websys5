/* 标签只提供添加和删除功能。
 */
var app = angular.module('tagApp', []);

appConfiguration(app)
.controller('tagCtrl', tagCtrl);


function tagCtrl($scope, $http, user) {
    $scope.user = user;
    $scope.opts = {'str':'', 'page':1, 'pageSize':100, 'order': ['createdAt', 'DESC']};
    $scope.total   = 0;
    $scope.taglist = [];
    $scope.tagsel  = null;
    $scope.tagname = '';

    // opts对象更改后刷新标签列表。
    $scope.$watch('opts', get, true);


    $scope.get = get;

    function get() 
    {
        $http
        .get('/tag/search', {params: $scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.taglist = ret.taglist;

            $scope['total']     = ret.total;
            $scope.opts['page'] = ret.page;
            $scope.pagelist = genPagelist(ret.page, ret.pageMaxium);
        })
    }

    $scope.search = ()=>{
        $scope.opts['str'] = $scope.tagname;
    }


    $scope.add = ()=>{
        var tagname = $scope.tagname.replace(/^\s+|\s+$/g,'');
        if (!tagname) { return toastr.info('请输入标签！', '', {"positionClass": "toast-bottom-right"}); }

        $http
        .post('/tag', {'tagname': tagname})
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            $scope.tagname = '';
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
        $(".badge-danger").removeClass('badge-danger').addClass('badge-secondary');

        if (x == $scope.tagsel) {
            $scope.tagsel  = null;
        } else {
            $scope.tagsel  = x;
            $("h4[id='"+x.id+"']").find('span').removeClass('badge-secondary').addClass('badge-danger');
        }
    }
}