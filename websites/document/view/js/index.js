var app = angular.module('indexApp', ['treeControl'])

appConfiguration(app)
.controller('indexCtrl', indexCtrl);


function indexCtrl($scope, $http, user) {
    $scope.user = user;
    $scope.doc  = null;
    $scope.detail = null;
    $scope.opts = {'page':1, 'pageSize':24, 'content':'', 'tag':'', 'order':'1'};
    $scope.total = 0;
    $scope.pagelist = [];
    $scope.doclist  = [];
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
            $scope['total']     = ret.total;
            $scope.opts['page'] = ret.page;
            $scope.pagelist = genPagelist(ret.page, ret.pageMaxium);

            $scope.doclist = ret.doclist;
        })
    }

    $scope.select = (doc)=>{
        $scope.doc = doc;
        $('.sel').removeClass('sel');
        $('#'+doc.id).addClass('sel');
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
            
            toastr.info(res.data.message, '', {"positionClass": "toast-bottom-right"});
        })
    }
}