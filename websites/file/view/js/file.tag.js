function tagCtrl($rootScope, $scope, $http) {
    $scope.opts = {'str':'', 'page':1, 'pageSize':100};
    $scope.rellist = [];
    $scope.reslist = [];

    $scope.$watch("opt", search, true);
    $rootScope.$watch("file", get, true);


    // 获取当前文件的标签
    $scope.get = get;
    function get() {
        if ($rootScope.file) {
            $http
            .get('/file/tag/'+$rootScope.file.id)
            .then((res)=>{
                if (errorCheck(res)) return ;
                $scope.rellist = res.data.message;

                search();                
            });
        } else {
            $scope.rellist = [];
        }
    }

    // 搜索标签
    function search() {
        $http
        .get('/tag/search', {'params': $scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            // 过滤掉已经关联的标签
            var taglist = res.data.message.taglist.map((x)=>{ return x.name; })
            $scope.reslist = taglist.filter((x)=>{ return $scope.rellist.indexOf(x)==-1; });
        })
    }

    // 关键标签到文件
    $scope.attach = (tagname)=>{
        if (!$rootScope.file) { return toastr.info('请选择要编辑的文件!', '', {"positionClass": "toast-bottom-right"}); }

        $http
        .post('/file/tag/'+$rootScope.file.id, {'tagname': tagname, 
            'str':$scope.opts.str, 'page': $scope.opts.page, 'pageSize': $scope.opts.pageSize})
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            
            $scope.rellist = ret.rellist;
            // 过滤掉已经关联的标签
            var taglist = ret.reslist.taglist.map((x)=>{ return x.name; })
            $scope.reslist = taglist.filter((x)=>{ return $scope.rellist.indexOf(x)==-1; });

            $rootScope.detailRefresh($rootScope.file.id);
        });
    }

    $scope.dettach = (tagname)=>{
        $http
        .delete('/file/tag/'+$rootScope.file.id, {params: {'tagname': tagname, 
            'str':$scope.opts.str, 'page': $scope.opts.page, 'pageSize': $scope.opts.pageSize}})
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            
            $scope.rellist = ret.rellist;
            // 过滤掉已经关联的标签
            var taglist = ret.reslist.taglist.map((x)=>{ return x.name; })
            $scope.reslist = taglist.filter((x)=>{ return $scope.rellist.indexOf(x)==-1; });

            $rootScope.detailRefresh($rootScope.file.id);
        });
    }
}