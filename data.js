/* 导航菜单数据 */
exports.navigation = [
    {'name':'websys',        'father':null,                'url':'/',                    'access':'any'},
    {'name':'User',          'father':'websys',            'url':'/view/user.html',      'access':'root'},
    // 用户设置界面
    {'name':'Setting',       'father':'websys',            'url':'/view/setting.html',   'access':'user'},
    {'name':'Found',         'father':'websys',            'url':'/found',               'access':'any'},
    {'name':'Finance',       'father':'websys',            'url':'/finance',             'access':'user'},
    {'name':'Tag',           'father':null,                'url':'/tag',                 'access':'any'},
    {'name':'Category',      'father':null,                'url':'/category',                    'access':'user'},
    {'name':'file',          'father':'Category',          'url':'/category/view/file.html',     'access':'user'},
    {'name':'document',      'father':'Category',          'url':'/category/view/document.html', 'access':'user'},
    {'name':'edit',          'father':'Category',          'url':'/category/view/edit.html',     'access':'user'},
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
        {'method': 'POST','url': '/login', 'group':'/'},
        {'method': 'GET', 'url': '/',      'group':'/'},
        {'method': 'GET', 'url': '/nav',   'group':'/'},
        // found
        {'method': 'GET', 'url': '/found',                   'group':'/'},
        {'method': 'GET', 'url': '/found/company/:code',     'group':'/'},
        {'method': 'GET', 'url': '/found/found/:code',       'group':'/'},
        {'method': 'GET', 'url': '/found/filter',            'group':'/'},
        {'method': 'GET', 'url': '/found/filter/apply',      'group':'/'},
        {'method': 'GET', 'url': '/found/filter/detail/:id', 'group':'/'},
        // tag
        {'method': 'GET', 'url': '/tag',               'group':'/'},
        {'method': 'GET', 'url': '/tag/search',        'group':'/tag'},
        {'method': 'GET', 'url': '/tag/relate/:tagid', 'group':'/tag'},
        // file        
        {'method': 'GET', 'url': '/file',               'group':'/'},
        {'method': 'GET', 'url': '/file/search',        'group':'/file'},
        {'method': 'GET', 'url': '/file/detail/:fileid','group':'/file'}, 
        {'method': 'GET', 'url': '/file/tag/:fileid',   'group':'/file'},        
        // document
        {'method': 'GET', 'url': '/document',                'group':'/document'},  // 搜索页面
        {'method': 'GET', 'url': '/document/edit/:docid',    'group':'/document'},  // 编辑页面
        {'method': 'GET', 'url': '/document/search',         'group':'/document'},  // 搜索接口
        {'method': 'GET', 'url': '/document/display/:docid', 'group':'/document'},  // 显示页面
        {'method': 'GET', 'url': '/document/detail/:docid',  'group':'/document'},  // 显示接口
        {'method': 'GET', 'url': '/document/tag/:tagid',     'group':'/document'},
    ],
    'private': [
        {'method': 'GET', 'url': '/logout', 'group':'/'},
        {'method': 'PUT', 'url': '/user',   'group':'/'},
        // found
        {'method': 'POST',   'url': '/found/filter',     'group':'/'},
        {'method': 'DELETE', 'url': '/found/filter/:id', 'group':'/'},
        // tag
        {'method': 'POST',   'url': '/tag',     'group':'/tag'},
        {'method': 'DELETE', 'url': '/tag/:id', 'group':'/tag'},
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
        {'method': 'POST',   'url': '/file/category/:categoryid',  'group':'/file'},
        {'method': 'DELETE', 'url': '/file/category/:categoryid',  'group':'/file'}, 
        {'method': 'GET',    'url': '/file/category/:categoryid',  'group':'/file'},
        // document
        {'method': 'POST',   'url': '/document/:docid', 'group':'/document'},
        {'method': 'DELETE', 'url': '/document/:docid', 'group':'/document'},
        {'method': 'GET',    'url': '/document/export', 'group':'/document'},
        {'method': 'POST',   'url': '/document/category/:categoryid', 'group':'/document'},
        {'method': 'DELETE', 'url': '/document/category/:categoryid', 'group':'/document'},
        {'method': 'GET',    'url': '/document/category/:categoryid', 'group':'/document'},
    ]
}
