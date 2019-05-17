var app = angular.module('docApp', ['treeControl'])

appConfiguration(app)
.controller('docCtrl', docCtrl);

function docCtrl($scope, $http, $interval, user) {
    $scope.user = user;
    // 文档属性
    $scope.groupRead  = true;
    $scope.otherRead  = true;
    // 标签相关数据
    $scope.tagstr = '';
    $scope.tagrel = [];
    $scope.tagres = [];
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

    var content = '';
    var docid   = $('#wrapper').attr('docid');

    // 初始化editor.md
    var editor = editormd("editormd", {
        path : '/node_modules/editor.md/lib/',
        width: '100%',
        height: 820,
        toolbarIcons : function() {
            return editormd.toolbarModes['simple']; // full, simple, mini
        },    
        onload : function() {
            // 获取编辑标签的内容
            if (docid!='0') { detail(); }
            else { tagGet(); }
        }    
    });    

    // 启动定时解析文章内容    
    $interval(()=>{ content = editor.getMarkdown(); }, 1000);
    categoryGet();

    $scope.tagGet = tagGet;
    function tagGet() {
        var query = $scope.opts = {'str':$scope.tagstr, 'page':1, 'pageSize':100};
        $http
        .get('/tag/search', {'params': query})
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            // 过滤掉已经关联的标签
            var tagres = res.data.message.taglist.map((x)=>{ return x.name; });
            $scope.tagres = tagres.filter((x)=>{ return $scope.tagrel.indexOf(x)==-1; });
        })
    }

    // 将选择的标签添加到关联标签列表
    $scope.tagSelect = (tagname)=>{
        $scope.tagrel.push(tagname);
        tagGet();
    }
    // 将选择的标签移除关联标签列表
    $scope.tagUnselect = (tagname)=>{
        var idx = $scope.tagrel.indexOf(tagname);
        if (idx!=-1) $scope.tagrel.spice(idx, 1);
        tagGet();
    }


    function categoryGet() {
        $http
        .get('/category/tree/0', {})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.treeRoot = res.data.message;
            $scope.treeView = res.data.message;

            // 获取基础数据
            var {dir, list} = treeTravel($scope.treeView, 0, 0);
            $scope.listRoot   = list;
            $scope.listView   = list;
        });
    }

    // 将被选中的所有父级节点都展开， 增加到现有的展开节点中
    $scope.categoryExpand = categoryExpand;
    function categoryExpand() {
        window.setTimeout(()=>{
            // 被选择节点ID
            var ids = $scope.nodeSelected.map((x)=>{ return x.id; });
            var {dir2, list2} = treeSearch($scope.listRoot, ids);
            // 已经展开节点的ID
            var ids2 = $scope.listExpand.map((x)=>{ return x.id; });
            dir2.map((x)=>{ if(ids2.indexOf(x.id)==-1) $scope.listExpand.push(x); });
        }, 0);
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

    // 文档编辑提交
    $scope.submit = ()=>{
        // 文档内容， 阅读权限；标签列表；目录节点列表
        var private = '';
        private += $scope.groupRead  ? 'GR1' : 'GR0';
        private += $scope.otherRead  ? 'OR1' : 'OR0';
        var taglist = $scope.tagrel;
        var categoryids = $scope.nodeSelected.map((x)=>{ return x.id; });

        $http
        .post('/document/'+docid, {'content':content, 'private':private, 'taglist':taglist, 'categoryids':categoryids})
        .then((res)=>{
            if (errorCheck(res)) return ;
            // 显示更新成功后，刷新该页面
            toastr.info(res.data.message, '', {"positionClass": "toast-bottom-right"});
            window.setTimeout(()=>{ location.reload(); }, 1000);
        });
    }


    // 文件详细信息，包括文件属性， 关联标签， 管理目录节点ID
    function detail() {
        $http
        .get('/document/detail/'+docid)
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            var ret = res.data.message;
            editor.setMarkdown(ret.content); 
            $scope.groupRead  = (ret.private.indexOf('GR1')!=-1) ? true : false;
            $scope.otherRead  = (ret.private.indexOf('OR1')!=-1) ? true : false;
            // 关联标签
            $scope.tagrel = ret.tagnames;
            // 根据ID选择关联节点
            $scope.nodeSelected = [];
            for (var i=0; i<$scope.listView.length; i++) {
                if (!ret.categoryids || (ret.categoryids.indexOf($scope.listView[i].id)==-1)) continue;
                $scope.nodeSelected.push($scope.listView[i]);
            }
            tagGet();
            categoryExpand();
        });
    }

    $scope.delete = ()=>{
        $http
        .delete('/document/'+docid)
        .then((res)=>{
            if (errorCheck(res)) return ;
            window.location.href = '/document';
        });
    }

    $scope.display = ()=>{
        window.open('/document/display/'+docid+'?r='+Math.random(), "_blank");
    }
}