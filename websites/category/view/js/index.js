var app = angular.module('indexApp', ['treeControl'])

appConfiguration(app)
.controller('indexCtrl', indexCtrl)

function indexCtrl($scope, $http, user, locals) 
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
    $scope.treeOptions = {dirSelectable: true};
    // 节点编辑信息
    $scope.nodeSel = null;
    // 文件及关联文档
    $scope.filerel = [];
    $scope.docrel = [];
    
    $scope.$watch("user", refresh, true)

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
                var ids = locals.getObject('/category/expaned/'+$scope.user.username);
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
        locals.setObject('/category/file/expaned/'+$scope.user.username, ids);
    }

    $scope.select = (node, sel)=>{ 
        $scope.nodeSelected = sel ? node : null;

        var query = {'page':1, 'pageSize':0, 'str':''};
        var categoryid = sel ? node.id : 0;
        $http
        .get('/file/category/'+categoryid, {params: query})
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.filerel = ret.filerel;
        })

        $http
        .get('/document/category/'+categoryid, {params: query})
        .then((res)=>{
            if (errorCheck(res)) return ;
           
            var ret = res.data.message;
            $scope.docrel = ret.docrel;
        })
    }
}