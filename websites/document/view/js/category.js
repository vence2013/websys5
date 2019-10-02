var app = angular.module('categoryApp', ['treeControl'])

appConfiguration(app)
.controller('categoryCtrl', categoryCtrl)

function categoryCtrl($scope, $http, user, locals) 
{
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
    $scope.treeOptions = { dirSelectable: true };
    /* 文档搜索
     * 查找某个目录关联的文档， 以及未关联文档
     */
    $scope.docOpts  = {'str':'', 'categoryid':0, 'page':1, 'pageSize':20};
    $scope.docPages = [];
    $scope.doclist  = [];
    $scope.rellist  = [];

    categoryRefresh();
    $scope.$watch('docOpts', search, true);

    function categoryRefresh() {
        $http
        .get('/category/tree/0', {})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.treeRoot = res.data.message;
            $scope.treeView = res.data.message; 

            // 获取基础数据
            var {dir, list} = treeTravel($scope.treeView, 0, $scope.expand);
            $scope.listRoot   = list; 
            $scope.listView   = list;
            // 还原展开节点
            if ($scope.user) {
                var ids = locals.getObject('/category/document/expaned/'+$scope.user.username);
                if (ids.length) {
                    var expand = [];                
                    $scope.listView.map((x)=>{ if (ids.indexOf(x.id)!=-1) expand.push(x); });
                    $scope.listExpand = expand;
                }
            }
        });
    }

    $scope.categoryToggle = (node, expanded)=>{
        var ids = $scope.listExpand.map(node => { return node.id; });
        locals.setObject('/category/document/expaned/'+$scope.user.username, ids);
    }

    $scope.categorySelect = (node, sel)=>{ 
        $scope.nodeSelected = sel ? node : null;
        if (sel) {
            search();
        } else {
            $scope.reslist = [];
        }
    }

    // 获取目录未关联的文档列表
    function search() {     
        var cid = $scope.nodeSelected ? $scope.nodeSelected.id : 0;

        $http
        .get('/document/category/'+cid, {params: $scope.docOpts})
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            
            $scope.rellist = ret.rellist;
            $scope.doclist = ret.doclist;
            $scope.docOpts['page'] = ret.page;
            $scope.docPages= initPage(ret.page, $scope.docOpts.pageSize, ret.total, 5);
        })
    }

    $scope.attach = (docid)=>{
        if (!$scope.nodeSelected) return toastr.warning('请先选择一个目录！');

        var categoryid = $scope.nodeSelected.id;
        $http
        .post('/document/category/'+categoryid, {'docid':docid})
        .then((res)=>{
            if (errorCheck(res)) return ;

            search();
        })
    }

    $scope.dettach = (docid)=>{
        // 获取选中的目录
        var categoryid = $scope.nodeSelected ? $scope.nodeSelected.id : 0;

        $http
        .delete('/document/category/'+categoryid, {params:{'docid':docid}})
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            search();
        })
    }
}