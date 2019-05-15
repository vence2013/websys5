/* 导航菜单
 * 
 */
exports.navigation = [
    {'name': 'Websys',       'access': 'any',    'url': '/',                   'children': [
        {'name': 'User',     'access': 'root',   'url': '/view/user.html'},
        {'name': 'Found',    'access': 'any',    'url': '/found'},
        {'name': 'Finance',  'access': 'user',   'url': '/finance'},        
    ]},
    {'name': 'Tag',          'access': 'any',    'url': '/tag', },
    {'name': 'Category',     'access': 'user',   'url': '/category'},
    {'name': 'File',         'access': 'any',    'url': '/file',               'children':[
        {'name': 'edit',     'access': 'user',   'url': '/file/view/file.html'},
        {'name': 'upload',   'access': 'user',   'url': '/file/view/upload.html'},
    ]},       
    {'name': 'Document',     'access': 'any',    'url': '/document',           'children':[
        {'name': 'edit',     'access': 'user',   'url': '/document/edit/0'},
    ]},          
    {'name': 'Chip',         'access': 'any',    'url': '/chip/view',          'children':[
        {'name': 'document', 'access': 'user',   'url': '/chip/view/document.html'},
        {'name': 'map',      'access': 'user',   'url': '/chip/view/map.html'},
        {'name': 'edit',     'access': 'user',   'url': '/chip/view/edit.html'},        
    ]},     
];

/* 接口列表
 * {method, url, group}
 */
exports.interfaces = {
    'public': [
        {'method': 'POST','url': '/login',              'group':'/'},
        {'method': 'GET', 'url': '/logout',             'group':'/'},
        {'method': 'GET', 'url': '/',                   'group':'/'},
        {'method': 'GET', 'url': '/nav',                'group':'/'},
        {'method': 'GET', 'url': '/found',              'group':'/'},
        
        // tag
        {'method': 'GET', 'url': '/tag',                'group':'/'},
        {'method': 'GET', 'url': '/tag/search',         'group':'/tag'},
        // file        
        {'method': 'GET', 'url': '/file',               'group':'/'},
        {'method': 'GET', 'url': '/file/search',        'group':'/file'},
        {'method': 'GET', 'url': '/file/detail/:fileid','group':'/file'}, 
        {'method': 'GET', 'url': '/file/tag/:fileid',   'group':'/file'},        
        // document
        {'method': 'GET', 'url': '/document',                'group':'/document'},
        {'method': 'GET', 'url': '/document/edit/:docid',    'group':'/document'},
        {'method': 'GET', 'url': '/document/search',         'group':'/document'},
        {'method': 'GET', 'url': '/document/display/:docid', 'group':'/document'},
        {'method': 'GET', 'url': '/document/detail/:docid',  'group':'/document'},
    ],
    'private': [        
        // tag
        {'method': 'POST',   'url': '/tag',       'group':'/tag'},
        {'method': 'DELETE', 'url': '/tag',       'group':'/tag'},
        // category        
        {'method': 'POST',   'url': '/category',             'group':'/category'},
        {'method': 'PUT',    'url': '/category/:categoryid', 'group':'/category'},
        {'method': 'DELETE', 'url': '/category/:categoryid', 'group':'/category'},
        {'method': 'GET',    'url': '/category',             'group':'/category'},
        {'method': 'GET',    'url': '/category/tree/:categoryid', 'group':'/category'},
        // file
        {'method': 'GET',    'url': '/file/last',    'group':'/file'},  
        {'method': 'POST',   'url': '/file/upload',  'group':'/file'},
        {'method': 'PUT',    'url': '/file/:fileid', 'group':'/file'},
        {'method': 'DELETE', 'url': '/file/:fileid', 'group':'/file'},               
        {'method': 'POST',   'url': '/file/tag/:fileid',      'group':'/file'},
        {'method': 'PUT',    'url': '/file/tag/:fileid',      'group':'/file'},
        {'method': 'POST',   'url': '/file/category/:fileid', 'group':'/file'},
        {'method': 'PUT',    'url': '/file/category/:fileid', 'group':'/file'},
        {'method': 'GET',    'url': '/file/category/:fileid', 'group':'/file'},
        // document
        {'method': 'POST',   'url': '/document/:docid',      'group':'/document'},
        {'method': 'DELETE', 'url': '/document/:docid',      'group':'/document'},        
    ]
}

/* 
 * Function     : dateFmt
 * Description  : 格式化日期字符串。
 *   var crtTime = new Date(value);
 *   dateFmt("yyyy-MM-dd hh:mm:ss",crtTime);
 * Parameter    : 
 * Return       : 
 */

 exports.dateFmt = (fmt, date)=>{
    var o = {   
        "M+" : date.getMonth()+1,                 //月份   
        "d+" : date.getDate(),                    //日   
        "h+" : date.getHours(),                   //小时   
        "m+" : date.getMinutes(),                 //分   
        "s+" : date.getSeconds(),                 //秒   
        "q+" : Math.floor((date.getMonth()+3)/3), //季度   
        "S"  : date.getMilliseconds()             //毫秒   
    };   

    if(/(y+)/.test(fmt))   
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   

    for(var k in o)   
        if(new RegExp("("+ k +")").test(fmt))   

    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
    return fmt;   
} 