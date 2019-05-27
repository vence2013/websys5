var app = angular.module('indexApp', ['treeControl'])

appConfiguration(app)
.controller('indexCtrl', indexCtrl);


function indexCtrl($scope, $http, user) {
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    $scope.user = user;
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
            if ($scope.detail.categoryids) categoryRefresh($scope.detail.categoryids);
            else $scope.treeView = [];
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