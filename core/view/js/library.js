// 导航页的控制器
function navCtrl($scope, $http, user, locals) {
    $scope.user = user;
    $scope.navlist = [];
    $scope.sub = null;    

    navRefresh();
    
    $scope.navRefresh = navRefresh;
    // 刷新一级菜单
    function navRefresh() {
        $http
        .get('/nav')
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            
            $scope.navlist = ret.nav;
            var userRet  = ret.user;
            // 服务器端用户未登录， 服务器端和客户端状态不一致， 都注销客户端保留的用户数据。
            if (user && (!userRet || (userRet.username != user.username))) { 
                logout();
            }
        });
    }

    // 菜单显示控制
    var subCloseTimer = null;
    $scope.subShow = (itm)=>{
        $scope.sub = itm.children;

        if (subCloseTimer) { subCloseTimer = window.clearTimeout(subCloseTimer); }
        // 获取一级菜单的位置
        var offset = $('#navMenu').find("a[name='"+itm.name+"']").offset();
        $('#navSub').css({'display':'table', 'position':'absolute', 'top':40, 'left':offset.left});
    }
    $scope.subEnter = ()=>{
        if (subCloseTimer) { subCloseTimer = window.clearTimeout(subCloseTimer); }
    }
    $scope.subDelay = ()=>{
        subCloseTimer = window.setTimeout(()=>{ $('#navSub').css('display', 'none'); }, 1000);
    }

    $scope.logout = logout;
    function logout()
    {
        $http
        .get('/logout')
        .then((res)=>{            
            locals.setObject('/user', null);
            window.location.href = '/';
        })
    }
}


/*
 * Function     : 
 * Description  : 
 * [快速了解AngularJs HTTP响应拦截器](https://www.cnblogs.com/laixiangran/p/5091804.html)
 * Parameter    : 
 * Return       : none.
 */

function appConfiguration(app) 
{
    var user = JSON.parse(localStorage['/user'] || '{}');

    app
    .config(["$httpProvider", function($httpProvider) { 
        $httpProvider.interceptors.push('httpInterceptor'); 
    }])
    .factory("httpInterceptor", ["$q", "$injector", function($q, $injector) {
        return {
            "responseError": function(response) {
                if (response.status == 401) {
                    window.location.href = '/';
                }
             }
        }
    }])
    .factory('user', function(){ // 控制器之间共享数据
        return user;
    })
    .factory('locals',['$window', ($window)=>{
        return{        
            set: (key,value)=>{ $window.localStorage[key]=value; }, //存储单个属性
            get: (key,defaultValue)=>{ return $window.localStorage[key] || defaultValue; },        
            setObject: (key,value)=>{ $window.localStorage[key]=JSON.stringify(value);  }, //存储对象，以JSON格式存储
            getObject: (key)=>{ return JSON.parse($window.localStorage[key] || '{}'); }
        }
    }])
    .filter('datefmt', function() {
        return function(date, fmt) {
            if (!date) return '';
            
            var o = {   
                "M+" : date.getMonth()+1,                 //月份   
                "d+" : date.getDate(),                    //日   
                "h+" : date.getHours(),                   //小时   
                "m+" : date.getMinutes(),                 //分   
                "s+" : date.getSeconds(),                 //秒   
                "q+" : Math.floor((date.getMonth()+3)/3), //季度   
                "S"  : date.getMilliseconds()             //毫秒   
            };
        
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
        
            for(var k in o) {
                if(new RegExp("("+ k +")").test(fmt)) { 
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
        
            return fmt;   
        }
    })
    .controller('navCtrl', navCtrl)

    return app;
}


/*
 * Function     : errorCheck
 * Description  : 检查错误代码是否为零。
 * Parameter    : 
 * Return       : 是否有错误(true|false)
 */

function errorCheck(res) {
    if (res && res.data && /^[\-0-9]+$/.test(res.data.errorCode)) {
        if (res.data.errorCode == 0) { return false; }
        else { toastr.info('Fail with errorCode: '+res.errorCode+', message: '+res.data.message, '', {"positionClass": "toast-bottom-right"}); }
    } else {
        toastr.info('Fail with unknown: '+JSON.stringify(res), '', {"positionClass": "toast-bottom-right"});
        console.log('Fail with unknown: %o', res);
    }
    return true;
}

/* 生成分页项列表， 每项包括以下信息： disable, active, page, name */
function initPage(page, pageSize, total, display) {
    var pagelist = [];

    var max = Math.ceil(total/pageSize);
    max     = (max<1) ? 1 : max;

    // 首页/上一页
    pagelist.push({'disable':(page==1),  'active':false, 'page':1, 'name':'First(/'+pageSize+')'});
    var previous = (page>1) ? (page-1) : 1;
    pagelist.push({'disable':(page==1),  'active':false, 'page':previous, 'name':'Previous'});

    var half = Math.ceil(display/2);
    if ((max<display) || (page<=half)) {
        for (var i=1; (i<=max) && (i<display); i++) {
            var item = {'disable':false,  'active':(page==i), 'page':i, 'name':i};
            pagelist.push(item);
        }
        if (max > display) { // 表示还有页面
            pagelist.push({'disable':true,  'active':false, 'page':1, 'name':'...'});
        }
    } else if ((page+half)>max) {
        pagelist.push({'disable':true,  'active':false, 'page':1, 'name':'...'});
        var start = (max>display) ? (max-display) : 1;
        for (var i=start; i<=max; i++) {
            var item = {'disable':false,  'active':(page==i), 'page':i, 'name':i};
            pagelist.push(item);
        }
    } else {
        pagelist.push({'disable':true,  'active':false, 'page':1, 'name':'...'});
        for (var i=(page-half+1); i<=(page+half); i++) {
            var item = {'disable':false,  'active':(page==i), 'page':i, 'name':i};
            pagelist.push(item);
        }
        pagelist.push({'disable':true,  'active':false, 'page':1, 'name':'...'});
    }

    // 下一页/末页
    var next = (page<max) ? (page+1) : max;
    pagelist.push({'disable':(page==next),  'active':false, 'page':next, 'name':'Next'});
    pagelist.push({'disable':(page==max),  'active':false, 'page':max, 'name':'Last('+total+')'});

    return pagelist;
}


/****************************************************************************** 
 * 目录树相关的定义($scope)
 * .treeRoot - 完整的目录树数据(包括所有有权阅读的节点)， 用于目录树搜索等操作
 * .listRoot - 完整的目录树节点列表(包括所有有权阅读的节点)， 用于目录树搜索等操作。
 * .treeView - 用于当前显示的目录树数据，比如目录树查看或显示目录树搜索结果。
 * .listView - 用于当前显示的目录树节点列表，
 * .listExpand - 需要展开的目录节点列表。
 * .nodeSel  - 被选中的节点
 *****************************************************************************/


/*
 * Function     : treeTravel
 * Description  : 对树进行递归遍历。返回树形结构中的目录节点和所有节点列表。 
 * Parameter    : 
 *      data  - 树形的目录数据
 *      depth - 当前递归的深度
 *      limit - 层级小于该值的目录节点都将作为展开节点返回
 * Return       : { dir:x, any:x }
 *      dir - 层级小于depth的目录节点， 用于展开列表
 *      any - 整个树节点的列表， 可以用于计算节点数量、根据ID查找节点数据(类似本地数据库)。
 */

function treeTravel(data, depth, limit) {
    var dir2 = [], list2 = [];

    list2 = list2.concat(data); // 将当前节点加入列表
    for (var i=0; i<data.length; i++) {
        // 如果当前子节点没有子节点，则进入下一节点处理。
        if (!data[i]['children'] || !data[i]['children'].length) continue;
        // 如果目录层级符合要求，则将当前节点加入目录节点。
        if (depth<limit) { dir2.push(data[i]); }
        var {dir, list} = treeTravel(data[i]['children'], depth+1, limit);
        dir2 = dir2.concat(dir);
        list2 = list2.concat(list);
    }

    return {'dir':dir2, 'list':list2};
}

/* 通过节点ID的数组搜索整个父级链条的节点， 同时返回哪些是目录节点
 * 参数
 *    list - 整个目录树的节点列表数据, 
 *    ids - 要搜索节点的ID数组
 * 返回
 *    dir2 - 目录节点
 *    list2 - ID列表， 用于过滤器判断
 */
function treeSearch(list, ids) {
    // 查找所有的节点
    var res = [];
    for (var i=0; i<list.length; i++) {
        if (ids.indexOf(list[i]['id'])==-1) { continue; }
        res.push(list[i]);
    }
    // 如果没有找到任何结果，则清空显示并返回
    if (!res.length) return {'dir2':[], 'list2':[]};

    // 逐级查找这些节点的上级节点，直到根节点
    var sublist = [];
    for (var i=0; i<res.length; i++) {
        var node = res[i];           
        sublist.push(node);
        while(node['father']) {
            // 查找上级节点
            for (var j=0; (j<list.length) && (list[j]['id'] != node['father']); j++) ;
            if (j>=list.length) break;
            node = list[j];
            if (node) sublist.push(node);
        }
    }
    $.unique(sublist);
    var dirlist = [];
    var idlist  = sublist.map((x)=>{ 
        if (x.children && x.children.length) dirlist.push(x);
        return x.id; 
    });
    
    return {'dir2': dirlist, 'list2':idlist};
}