var app = angular.module('docApp', ['treeControl'])

appConfiguration(app)
.controller('docCtrl', docCtrl);

function docCtrl($scope, $http, $interval) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
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
        height: 800,
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
        var query = {'str':$scope.tagstr, 'page':1, 'pageSize':50, 'order': ['createdAt', 'DESC']};
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

    // 文档编辑提交
    $scope.submit = ()=>{
        var taglist = $scope.tagrel;

        $http
        .post('/document/'+docid, {'content':content, 'taglist':taglist})
        .then((res)=>{
            if (errorCheck(res)) return ;
            // 显示更新成功后，刷新该页面
            toastr.info(res.data.message, '', {"positionClass": "toast-bottom-right"});
            window.setTimeout(()=>{ 
                window.location.href = '/document';    
            }, 1000);
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
            // 关联标签
            $scope.tagrel = ret.tagnames;
            tagGet();      
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
        window.location.href = '/document/display/'+docid+'?r='+Math.random();
        //window.open('/document/display/'+docid+'?r='+Math.random(), "_blank");
    }
}