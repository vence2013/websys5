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
    $scope.predicate = "";
    $scope.comparator = false;
    // 节点编辑信息
    $scope.name = '';
    $scope.desc = '';
    $scope.nodeSel = null;

    
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
                var ids = locals.getObject('/category/edit/expaned/'+$scope.user.username);
                if (ids.length) {
                    var expand = [];                
                    $scope.listView.map((x)=>{ if (ids.indexOf(x.id)!=-1) expand.push(x); });
                    $scope.listExpand = expand;
                }
            }
        });
    }


    // 添加子节点
    $scope.create = ()=>{
        var name   = $scope.name.replace(/^\s+|\s+$/g,'');
        var desc   = $scope.desc;
        var father = $scope.nodeSel ? $scope.nodeSel.id : 0;
        if (!name) { return toastr.info('请输入有效的目录名称！'); }

        $http
        .post('/category', {'father': father, 'name': name, 'desc': desc})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.name = '';
            $scope.desc = '';
            toastr.info(res.data.message);

            refresh();            
        }); 
    }

    $scope.update = ()=>{        
        var name = $scope.nodeSel.name.replace(/^\s+|\s+$/g,'');
        var desc = $scope.nodeSel.desc;
        var id     = $scope.nodeSel.id;
        if (!name || !id || !angular.isNumber(id)) { return toastr.info('请选择有效节点并输入名称！'); }
        
        $http
        .put('/category/'+id, {'name': name, 'desc': desc})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.nodeSel = null;
            toastr.info(res.data.message);

            refresh();            
        });
    }

    $scope.delete = ()=>{
        $http
        .delete('/category/'+$scope.nodeSel.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.nodeSel = null;
            toastr.info(res.data.message);

            refresh();            
        });
    }


    $scope.select = (node, sel)=>{ 
        $scope.nodeSel = sel ? node : null; 
    }

    $scope.toggle = (node, expanded)=>{
        if (!$scope.user) return ; // 未登录用户不保存展开的节点

        var ids = $scope.listExpand.map(node => { return node.id; });
        locals.setObject('/category/edit/expaned/'+$scope.user.username, ids);
    }
}