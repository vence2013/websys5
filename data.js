/* 导航菜单数据 */
exports.navigation = [
    {'name':'websys',        'father':null,                'url':'/',                    'access':'any'},
    {'name':'User',          'father':'websys',            'url':'/view/user.html',      'access':'root'},
    // 用户设置界面
    {'name':'Setting',       'father':'websys',            'url':'/view/setting.html',   'access':'user'},
    {'name':'Found',         'father':'websys',            'url':'/found',               'access':'any'},
    {'name':'Finance',       'father':'websys',            'url':'/finance',             'access':'user'},
    {'name':'Tag',           'father':null,                'url':'/tag',                 'access':'any'},
    {'name':'Category',      'father':null,                'url':'/category',            'access':'user'},
    {'name':'File',          'father':null,                'url':'/file',                'access':'any'},
    {'name':'edit',          'father':'File',              'url':'/file/view/file.html', 'access':'user'},
    {'name':'upload',        'father':'File',              'url':'/file/view/upload.html','access':'user'},
    {'name':'Document',      'father':null,                'url':'/document',            'access':'any'},
    {'name':'edit',          'father':'Document',          'url':'/document/edit/0',     'access':'user'},
    {'name':'Chip',          'father':null,                'url':'/chip',                'access':'any'},
];

/* 接口列表
 * {method, url, group}
 */
exports.interfaces = {
    'public': [
        {'method': 'POST','url': '/login',              'group':'/'},
        {'method': 'GET', 'url': '/',                   'group':'/'},
        {'method': 'GET', 'url': '/nav',                'group':'/'},
        // found
        {'method': 'GET', 'url': '/found',                   'group':'/'},
        {'method': 'GET', 'url': '/found/company/:code',     'group':'/'},
        {'method': 'GET', 'url': '/found/found/:code',       'group':'/'},
        {'method': 'GET', 'url': '/found/filter',            'group':'/'},
        {'method': 'GET', 'url': '/found/filter/apply',      'group':'/'},
        {'method': 'GET', 'url': '/found/filter/detail/:id', 'group':'/'},
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
        {'method': 'GET', 'url': '/logout',             'group':'/'},
        {'method': 'PUT', 'url': '/user',               'group':'/'},
        // found
        {'method': 'POST',   'url': '/found/filter',     'group':'/'},
        {'method': 'DELETE', 'url': '/found/filter/:id', 'group':'/'},
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
        {'method': 'POST',   'url': '/file/upload',  'group':'/file'},
        {'method': 'PUT',    'url': '/file/:fileid', 'group':'/file'},
        {'method': 'DELETE', 'url': '/file/:fileid', 'group':'/file'}, 
        {'method': 'GET',    'url': '/file/last',    'group':'/file'},                
        {'method': 'POST',   'url': '/file/tag/:fileid',      'group':'/file'},
        {'method': 'DELETE', 'url': '/file/tag/:fileid',      'group':'/file'},
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