/* 导航菜单数据 */
exports.navigation = [
    {'name':'websys',        'father':null,                'url':'/',                    'access':'any'},
    {'name':'User',          'father':'websys',            'url':'/view/user.html',      'access':'root'},
    // 用户设置界面
    {'name':'Setting',       'father':'websys',            'url':'/view/setting.html',   'access':'user'},
    {'name':'Found',         'father':'websys',            'url':'/found',               'access':'any'},
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
    {'name':'Chip',          'father':null,                'url':'/chip',                    'access':'any'},
    {'name':'document',      'father':'Chip',              'url':'/chip/document/edit/0',    'access':'user'},
    {'name':'edit',          'father':'Chip',              'url':'/chip/view/edit.html',     'access':'user'},
];
