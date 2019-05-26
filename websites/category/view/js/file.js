var app = angular.module('fileApp', ['treeControl'])

appConfiguration(app)
.controller('fileCtrl', fileCtrl)

function fileCtrl($scope, $http, user, locals) 
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
    // 关联文档列表
    $scope.relOpts = {'str':'', 'page':1, 'pageSize':12, 'isRelate':true};
    $scope.relPages= [];
    $scope.rellist = [];
    // 未关联文档列表
    $scope.resOpts = {'str':'', 'page':1, 'pageSize':12};
    $scope.resPages= [];
    $scope.reslist = [];

    $scope.$watch("user", refresh, true);
    $scope.$watch('relOpts', relate, true);
    $scope.$watch('resOpts', unrelate, true);

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
                var ids = locals.getObject('/category/file/expaned/'+$scope.user.username);
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

        if (sel) {
            relate();
            unrelate();
        } else {
            $scope.rellist = [];
            $scope.reslist = [];
        }        
    }

    function relate() {
        if (!$scope.nodeSelected) return ; 

        $http
        .get('/file/category/'+$scope.nodeSelected.id, {params: $scope.relOpts})
        .then((res)=>{
            if (errorCheck(res)) return ;            
            var ret = res.data.message;
            $scope.rellist = ret.filelist;

            $scope.relOpts['page'] = ret.page;
            $scope.relPages= initPage(ret.page, $scope.relOpts.pageSize, ret.total, 5);
        })
    }

    function unrelate() {   
        if (!$scope.nodeSelected) return ;

        $http
        .get('/file/category/'+$scope.nodeSelected.id, {params: $scope.resOpts})
        .then((res)=>{
            if (errorCheck(res)) return ;            
            var ret = res.data.message;
            $scope.reslist = ret.filelist;

            $scope.resOpts['page'] = ret.page;
            $scope.resPages= initPage(ret.page, $scope.relOpts.pageSize, ret.total, 5);
        })
    }

    $scope.attach = ()=>{
        // 获取选中的目录
        var categoryid = $scope.nodeSelected ? $scope.nodeSelected.id : 0;
        if (!categoryid) return toastr.warning('请先选择一个目录！');
        // 获取选中的文件
        var fileids = [];
        $(".fileres")
        .find("input[type='checkbox']:checked")
        .map((idx, item)=>{ fileids.push($(item).val()); })
        if (!fileids.length) return toastr.warning('请选择一个或多个文件！');

        $http
        .post('/file/category/'+categoryid, {'fileids':fileids})
        .then((res)=>{
            if (errorCheck(res)) return ;
            relate();
            unrelate();
        })
    }

    $scope.dettach = ()=>{
        // 获取选中的目录
        var categoryid = $scope.nodeSelected ? $scope.nodeSelected.id : 0;
        // 获取选中的文件
        var fileids = [];
        $(".filerel")
        .find("input[type='checkbox']:checked")
        .map((idx, item)=>{ fileids.push($(item).val()); })
        if (!fileids.length) return toastr.warning('请选择一个或多个文件！');

        $http
        .delete('/file/category/'+categoryid, {params:{'fileids':fileids}})
        .then((res)=>{
            if (errorCheck(res)) return ;
            relate();
            unrelate();
        })
    }
}