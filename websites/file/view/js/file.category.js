// 
function categoryCtrl($rootScope, $scope, $http, user, locals) {
    $scope.user = user;
    // 目录树相关的数据
    $scope.treeRoot = [];
    $scope.listRoot = [];
    $scope.treeView = [];
    $scope.listView = [];
    $scope.listExpand = [];  
    $scope.treeOptions = { nodeChildren: "children", dirSelectable: true, multiSelection: true,
        injectClasses: { ul: "a1", li: "a2", liSelected: "a7", iExpanded: "a3", iCollapsed: "a4", iLeaf: "a5", label: "a6", labelSelected: "a8" }
    };
    // 目录搜索
    $scope.predicate = '';
    $scope.comparator = false;

    $rootScope.$watch('file', (file)=>{
        if (!file) return ;

        // 获取文件所属的目录列表
        $http
        .get('/file/category/'+file.id)
        .then((res)=>{            
            if (errorCheck(res)) return ;

            // 更新文件所属的目录列表
            var ids = res.data.message;
            $scope.nodeSelected = getByIds(ids);
        }); 
    }, true)

    $scope.$watch('user', (user)=>{
        if (user && user.username) {
            refresh();
        } else {
            $scope.treeRoot = [];
            $scope.listRoot = [];
            $scope.treeView = [];
            $scope.listView = [];
            $scope.listExpand = []; 
        }
    }, true)

    function getByIds(ids) {
        var nodelist = [];

        for (var i=0; i<$scope.listView.length; i++) {
            if (!ids || (ids.indexOf($scope.listView[i].id)==-1)) continue;
            nodelist.push($scope.listView[i]);
        }
        return nodelist;
    }

    $scope.refresh = refresh;
    function refresh () {        
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
            var ids = locals.getObject('websys.file.category.expaned');
            if (ids.length) {
                var expand = [];                
                $scope.listView.map((x)=>{ if (ids.indexOf(x.id)!=-1) expand.push(x); });
                $scope.listExpand = expand;
            }
        });
    }

    // 点击节点的回调函数
    $scope.select = (node, sel)=>{
        if (!$rootScope.file) {
            $scope.nodeSelected = [];
            return toastr.info("请选择要编辑的文件！", '', {"positionClass": "toast-bottom-right"}); 
        }

        if (sel) { // 关联目录和文件
            $http
            .post('/file/category/'+$rootScope.file.id, {'categoryid': node.id})
            .then((res)=>{
                if (errorCheck(res)) return ;
                // 更新文件所属的目录列表
                var ids = res.data.message;
                $scope.nodeSelected = getByIds(ids);
            }); 
        } else {  // 取消关联
            $http
            .delete('/file/category/'+$rootScope.file.id, {params: {'categoryid': node.id}})
            .then((res)=>{
                if (errorCheck(res)) return ;
                // 更新文件所属的目录列表
                var ids = res.data.message;
                $scope.nodeSelected = getByIds(ids);
            });
        }

        $rootScope.detailRefresh($rootScope.file.id);
    }

    // 节点展开切换的回调函数
    $scope.toggle = ()=>{
        var ids = $scope.listExpand.map(node => { return node.id; });
        locals.setObject('websys.file.category.expaned', ids);
    }
}