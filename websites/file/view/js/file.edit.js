function editCtrl($rootScope, $scope, $http, user) {    
    $scope.user = user;
    $scope.detail = null;
    $scope.groupRead  = false;
    $scope.otherRead  = false;
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

    $rootScope.$watch('file', (file)=>{ if (file) detailRefresh(file.id); }, true)

    $rootScope.detailRefresh = detailRefresh;
    function detailRefresh(fileid) {
        $http
        .get('/file/detail/'+fileid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            $scope.detail = res.data.message;            
            $scope.groupRead  = ($scope.detail.private.indexOf('GR1')!=-1) ? true : false;
            $scope.otherRead  = ($scope.detail.private.indexOf('OR1')!=-1) ? true : false;

            if ($scope.user && $scope.user.username) { categoryRefresh($scope.detail.categoryids); }
        })
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

    /* 组用户读取权限和其他用户读取权限具有包含关系
     * 1. 其他用户可读取时， 组用户一定可读取
     * 2. 组用户可读取时， 其他用户选择是否可读取
     */
    $scope.otherReadCheck = ()=>{
        if (!$scope.otherRead) $scope.groupRead = true;
    }
    $scope.groupReadCheck = ()=>{
        if ($scope.groupRead) $scope.otherRead = false;
    }

    $scope.edit = async ()=>{
        var name = $scope.detail.name;
        var desc = $scope.detail.desc;
        var private = '';
        private += $scope.groupRead  ? 'GR1' : 'GR0';
        private += $scope.otherRead  ? 'OR1' : 'OR0';

        $http
        .put('/file/'+$scope.detail.id, {'name':name, 'desc':desc, 'private': private})
        .then((res)=>{
            if (errorCheck(res)) return ;
            toastr.info(res.data.message, '', {"positionClass": "toast-bottom-right"});
            $rootScope.get();            
        });
    }

    $scope.delete = ()=>{
        $http
        .delete('/file/'+$scope.detail.id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            $rootScope.get();
        }); 
    }
}