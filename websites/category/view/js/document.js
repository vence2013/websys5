var app = angular.module('documentApp', ['treeControl'])

appConfiguration(app)
.controller('documentCtrl', documentCtrl)

function documentCtrl($scope, $http, user, locals) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    $scope.user = user;
    // 分页数据
    $scope.opts = {'page':1, 'pageSize':16, 'str':''};
    $scope.pagelist = [];
    // 目录树相关的数据
    $scope.treeRoot = [];
    $scope.listRoot = [];
    $scope.treeView = [];
    $scope.listView = [];
    $scope.listExpand = [];  
    $scope.treeOptions = { dirSelectable: true };
    // 文件列表
    $scope.docres = [];
    $scope.docrel = [];
    
    $scope.$watch("user", refresh, true);
    $scope.$watch('opts', get, true);

    function refresh() {
        if (!$scope.user || !$scope.user.username) return;

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

    $scope.toggle = (node, expanded)=>{
        var ids = $scope.listExpand.map(node => { return node.id; });
        locals.setObject('/category/document/expaned/'+$scope.user.username, ids);
    }

    $scope.select = (node, sel)=>{ 
        $scope.nodeSelected = sel ? node : null;
        get();
    }

    // 获取目录关联的文档，以及未关联的分页文档列表
    function get() {
        var categoryid = $scope.nodeSelected ? $scope.nodeSelected.id : 0;
        $http
        .get('/document/category/'+categoryid, {params: $scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            var ret = res.data.message;
            $scope.docrel = ret.docrel;
            $scope.docres = ret.docres;
            $scope['total']     = ret.total;
            $scope.opts['page'] = ret.page;
            $scope.pagelist = genPagelist(ret.page, ret.pageMaxium);
        })
    }

    $scope.attach = ()=>{
        // 获取选中的目录
        var categoryid = $scope.nodeSelected ? $scope.nodeSelected.id : 0;
        if (!categoryid) return toastr.warning('请先选择一个目录！');
        // 获取选中的文件
        var ids = [];
        $(".docres")
        .find("input[type='checkbox']:checked")
        .map((idx, item)=>{ ids.push($(item).val()); })
        
        if (!ids.length) return toastr.warning('请选择一个或多个文档！');

        $http
        .post('/document/category/'+categoryid, {'ids':ids})
        .then((res)=>{
            if (errorCheck(res)) return ;
            get();
        })
    }

    $scope.dettach = ()=>{
        // 获取选中的目录
        var categoryid = $scope.nodeSelected ? $scope.nodeSelected.id : 0;
        // 获取选中的文件
        var ids = [];
        $(".docrel")
        .find("input[type='checkbox']:checked")
        .map((idx, item)=>{ ids.push($(item).val()); })
        if (!ids.length) return toastr.warning('请选择一个或多个文档！');

        $http
        .delete('/document/category/'+categoryid, {params:{'ids':ids}})
        .then((res)=>{
            if (errorCheck(res)) return ;
            get();
        })
    }
}