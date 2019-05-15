var app = angular.module('indexApp', ['treeControl'])

appConfiguration(app)
.controller('indexCtrl', indexCtrl)

function indexCtrl($scope, $http, user, locals) 
{
    $scope.user = user;
    // 目录树相关的数据
    $scope.treeRoot = [];
    $scope.listRoot = [];
    $scope.treeView = [];
    $scope.listView = [];
    $scope.listExpand = [];  
    $scope.treeOptions = { nodeChildren: "children", dirSelectable: true, 
        injectClasses: { ul: "a1", li: "a2", liSelected: "a7", iExpanded: "a3", iCollapsed: "a4", iLeaf: "a5", label: "a6", labelSelected: "a8" }
    };
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
                var ids = locals.getObject('/category/expaned/'+$scope.user.username);
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
        if (!name) { return toastr.info('请输入有效的目录名称！', '', {"positionClass": "toast-bottom-right"}); }

        $http
        .post('/category', {'father': father, 'name': name, 'desc': desc})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.name = '';
            $scope.desc = '';
            toastr.info(res.data.message, '', {"positionClass": "toast-bottom-right"});

            refresh();            
        }); 
    }

    $scope.update = ()=>{        
        var name = $scope.nodeSel.name.replace(/^\s+|\s+$/g,'');
        var desc = $scope.nodeSel.desc;
        var id     = $scope.nodeSel.id;
        if (!name || !id || !angular.isNumber(id)) { return toastr.info('请选择有效节点并输入名称！', '', {"positionClass": "toast-bottom-right"}); }
        
        $http
        .put('/category/'+id, {'name': name, 'desc': desc})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.nodeSel = null;
            toastr.info(res.data.message, '', {"positionClass": "toast-bottom-right"});

            refresh();            
        });
    }

    $scope.delete = ()=>{
        $http
        .delete('/category/'+$scope.nodeSel.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.nodeSel = null;
            toastr.info(res.data.message, '', {"positionClass": "toast-bottom-right"});

            refresh();            
        });
    }


    $scope.select = (node, sel)=>{ 
        $scope.nodeSel = sel ? node : null; 
    }

    $scope.toggle = (node, expanded)=>{
        if (!$scope.user) return ; // 未登录用户不保存展开的节点

        var ids = $scope.listExpand.map(node => { return node.id; });
        locals.setObject('/category/expaned/'+$scope.user.username, ids);
    }
}