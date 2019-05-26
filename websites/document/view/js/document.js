var app = angular.module('docApp', ['treeControl'])

appConfiguration(app)
.controller('docCtrl', docCtrl);

function docCtrl($scope, $http, $interval, user) 
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
    // 目录搜索
    $scope.predicate = '';
    $scope.comparator = false;
    $scope.treeOptions = { dirSelectable: true, multiSelection: true };
    // 文档属性
    $scope.groupRead  = true;
    $scope.otherRead  = true;
    // 标签相关数据
    $scope.tagstr = '';
    $scope.tagrel = [];
    $scope.tagres = [];

    var content = '';
    var docid   = $('#wrapper').attr('docid');
    $scope.docid= parseInt(docid);

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

    $scope.$watch('tagstr', tagGet);
    // 启动定时解析文章内容    
    $interval(()=>{ content = editor.getMarkdown(); }, 1000);
    

    $scope.tagGet = tagGet;
    function tagGet() {
        var query = {'str':$scope.tagstr, 'page':1, 'pageSize':20, 'order': ['createdAt', 'DESC']};
        $http
        .get('/tag/search', {'params': query})
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            
            $scope.tagres = [];
            for (var i=0; (i<ret.taglist.length) && ($scope.tagres.length<6); i++) {
                var name = ret.taglist[i].name;
                if ($scope.tagrel.indexOf(name)==-1) $scope.tagres.push(name);
            }
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
        if (idx!=-1) $scope.tagrel.splice(idx, 1);
        tagGet();
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
            window.setTimeout(()=>{ 
                window.location.href = '/document';    
            }, 1000);
        });
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
            tagGet();
            if ($scope.user && $scope.user.username) { categoryRefresh(ret.categoryids); }            
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