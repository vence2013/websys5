var app = angular
    .module('indexApp', ['treeControl'])
    .filter('getTitle', function() {
        return function(content){
            if (!content) return; 

            var regExp = /[^ ] ([^\n]+)\n/;
            return content.match(regExp)[1];
        }
    })
    .filter('getBrief', function() {
        return function(content){
            if (!content) return; 

            var regExp = /[^\n]\n([^\n]+)\n/;
            return content.match(regExp)[1];
        }
    });

appConfiguration(app)
.controller('indexCtrl', indexCtrl);

function indexCtrl($scope, $http) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 文档
    $scope.doc  = null;
    $scope.detail = null;
    $scope.opts = {'page':1, 'pageSize':24, 'content':'', 'tag':'', 'order':'1'};
    $scope.pages = [];
    $scope.doclist = [];
    $scope.taglist = [];

    var queryPrevious;
    $scope.$watch('opts', get, true);
    $scope.$watch('doc', (doc)=>{
        if (!doc) return;
        
        $http
        .get('/document/detail/'+doc.id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            $scope.detail = res.data.message;
        })
    }, true)

    function get() {
        var query = angular.copy($scope.opts);
        var createget = $scope.opts.createget;
        var createlet = $scope.opts.createlet;
        query['createget'] = (/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(createget)) ? createget : '';
        query['createlet'] = (/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(createlet)) ? createlet : '';
        if (angular.equals(query, queryPrevious)) return;
        queryPrevious = query;

        $http
        .get('/document/search', {params: query})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.doclist = ret.doclist;
            $scope.taglist = ret.taglist.slice(0, 20);

            $scope.opts['page'] = ret.page;
            $scope.pages = initPage(ret.page, $scope.opts.pageSize, ret.total, 10);            
        })
    }

    $scope.focus = (doc)=>{
        $scope.doc = doc;

        var idx = $scope.doclist.indexOf(doc);
        $('.focus').removeClass('focus');
        $('.doclist>div:eq('+idx+')').addClass('focus');
    }

    /* 需要所有搜索参数 */
    $scope.export2file = ()=>{
        var query = angular.copy($scope.opts);
        var createget = $scope.opts.createget;
        var createlet = $scope.opts.createlet;
        query['createget'] = (/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(createget)) ? createget : '';
        query['createlet'] = (/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/.test(createlet)) ? createlet : '';

        $http
        .get('/document/export', {params: query})
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            toastr.info(res.data.message);
        })
    }
}