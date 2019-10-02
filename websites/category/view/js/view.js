var app = angular.module('viewApp', ['treeControl'])

appConfiguration(app)
.controller('viewCtrl', viewCtrl)

function viewCtrl($scope, $http, user, locals) 
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
    // 关联文档列表
    $scope.docOpts = {'str':'', 'page':1, 'pageSize':13, 'isRelate':true};
    $scope.docPages= [];
    $scope.doclist = [];
    
    $scope.$watch("user", categoryRefresh, true);
    $scope.$watch('docOpts', docRelate, true);

    function categoryRefresh() {
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

    $scope.categoryToggle = (node, expanded)=>{
        var ids = $scope.listExpand.map(node => { return node.id; });
        locals.setObject('/category/expaned/'+$scope.user.username, ids);
    }

    $scope.categorySelect = (node, sel)=>{ 
        $scope.nodeSelected = sel ? node : null;
        if (sel) {
            docRelate();
        } else {
            $scope.doclist  = [];
        }
    }

    function docRelate() {
        if (!$scope.nodeSelected) return ;

        $http
        .get('/document/category/'+$scope.nodeSelected.id, {params: $scope.docOpts})
        .then((res)=>{
            if (errorCheck(res)) return ;            
            var ret = res.data.message;
            $scope.doclist = ret.doclist;

            $scope.docOpts['page'] = ret.page;
            $scope.docPages= initPage(ret.page, $scope.docOpts.pageSize, ret.total, 5);
        })
    }

}