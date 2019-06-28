var app = angular.module('documentApp', [])

appConfiguration(app)
.controller('documentCtrl', documentCtrl);


function documentCtrl($scope, $http, $interval, user) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 应用数据
    $scope.chiplist = [];
    $scope.modulelist = [];
    $scope.registerlist = [];
    $scope.chip = null;
    $scope.module = null;
    $scope.bitindex = []; // 位映射的索引

    var docid   = $('#wrapper').attr('docid');
    $scope.docid= /^\d+$/.test(docid) ? parseInt(docid) : 0;    
    // 选中的位组所属的寄存器列表
    $scope.modulelistsel = []; // module: id, name, registerlist:[ id, name, bitslist:[(id, name)] ]
    // 用于通过ID查找数据
    var registerall = [];
    var bitsall     = [];

    var content = '';
    // 初始化editor.md
    var editor = editormd("editormd", {
        path : '/node_modules/editor.md/lib/',
        width: '100%',
        height: 200,
        toolbarIcons : function() {
            return editormd.toolbarModes['simple']; // full, simple, mini
        },    
        onload : function() {
            // 获取编辑标签的内容
            if ($scope.docid) { detail(); }
        }    
    });  
    // 启动定时解析文章内容    
    $interval(()=>{ content = editor.getMarkdown(); }, 1000);

    chipGet();


    $scope.edit = ()=>{
        // 文档， 标签， 关联的芯片或(关联的模块, 关联寄存器)
        var moduleids=[], bitsids=[];
        for (var i=0; i<$scope.modulelistsel.length; i++) {
            moduleids.push($scope.modulelistsel[i]['id']);
            var registerlist = $scope.modulelistsel[i]['registerlist'];
            for (var j=0; j<registerlist.length; j++) {
                for (var k=0; k<registerlist[j]['bitslist'].length; k++) {
                    bitsids.push(registerlist[j]['bitslist'][k].id);
                }
            }
        }
        if (!content) toastr.warning('请输入有效的内容！');

        $http
        .post('/chip/document/'+$scope.docid, {'content':content, 'chipid':$scope.chip.id, 'moduleids':moduleids, 'bitsids':bitsids })
        .then((res)=>{
            if (errorCheck(res)) return ;
            window.location.href = '/chip';
        });
    }

    $scope.delete = ()=>{
        $http
        .delete('/chip/document/'+$scope.docid)
        .then((res)=>{
            if (errorCheck(res)) return ;
            window.location.href = '/chip';
        });
    }

    $scope.detail = detail;
    function detail() {
        $http
        .get('/chip/document/detail/'+$scope.docid)
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            var ret = res.data.message;
            editor.setMarkdown(ret.content); 
            $scope.modulelistsel = ret.modulelistsel;
            // 选择chip
            for (var i=0; (i<$scope.chiplist.length) && ($scope.chiplist[i].id!=ret.ChipId); i++) ;
            if (i>=$scope.chiplist.length) return;
            if ($scope.chip != $scope.chiplist[i]) chipSelect($scope.chiplist[i]);
        });
    }


    // bit 

    $scope.bitUnfocus = ()=>{
        $('.bitFocus').removeClass('bitFocus');
        $('#bitsInfo').css('display', 'none');
    }

    // 当前只能有一个在聚焦
    $scope.bitFocus = (bitsid)=>{
        if (!bitsid) return ;

        $('.bitFocus').removeClass('bitFocus');
        $('.bg'+bitsid).addClass('bitFocus');

        $http
        .get('/chip/bits/'+bitsid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;            
            var desc = ret.desc.replace(new RegExp('\n',"gm"),'<br/>');
            $('#bitsInfo').html(ret.fullname+'<br/>'+desc).css('display', 'block');
        });
    }

    function bitsRefresh() 
    {        
        for (var i=0; (i<$scope.modulelistsel.length) && ($scope.module.id!=$scope.modulelistsel[i].id); i++) ;
        if (i>=$scope.modulelistsel.length) return;        
        var registerlist = $scope.modulelistsel[i]['registerlist'];
        for (var j=0; j<registerlist.length; j++) {
            var bitslist = registerlist[j]['bitslist'];
            for (var k=0; k<bitslist.length; k++) {
                $('.bg'+bitslist[k].id).addClass('bitSelect');
            }
        }
    }

    // 构建树形结构 modulelistsel
    $scope.bitSelect = (bitsid)=>{
        for (var i=0; (i<bitsall.length) && (bitsid!=bitsall[i]['id']); i++) ;
        var bits = angular.copy(bitsall[i]);
        for (var i=0; (i<registerall.length) && (bits.ChipRegisterId!=registerall[i].id); i++) ;
        var register = angular.copy(registerall[i]);

        if ($('.bg'+bitsid).hasClass('bitSelect')) { // 删除节点
            $('.bg'+bitsid).removeClass('bitSelect');

            var moduleid = $scope.module.id;
            for (var i=0; (i<$scope.modulelistsel.length) && (moduleid!=$scope.modulelistsel[i]['id']); i++) ;
            if (i<$scope.modulelistsel.length) {
                var module2 = $scope.modulelistsel[i];
                for (var j=0; (j<module2['registerlist'].length) && (register.id!=module2['registerlist'][j].id); j++) ;
                if (j<module2['registerlist'].length) {
                    var register2 = module2['registerlist'][j];
                    for (var k=0; (k<register2['bitslist'].length) && (bits.id!=register2['bitslist'][k].id); k++) ;
                    if (k<register2['bitslist'].length) {
                        $scope.modulelistsel[i]['registerlist'][j]['bitslist'].splice(k, 1);
                        if (!$scope.modulelistsel[i]['registerlist'][j]['bitslist'].length) $scope.modulelistsel[i]['registerlist'].splice(j, 1);
                        if (!$scope.modulelistsel[i]['registerlist'].length) $scope.modulelistsel.splice(i, 1); 
                    }
                }
            }  
        } else { // 新增节点
            $('.bg'+bitsid).addClass('bitSelect');

            var moduleid = $scope.module.id;
            for (var i=0; (i<$scope.modulelistsel.length) && (moduleid!=$scope.modulelistsel[i]['id']); i++) ;
            var module2;
            if (i>=$scope.modulelistsel.length) {
                module2 = {'id':$scope.module.id, 'name':$scope.module.name, 'registerlist':[]};
                $scope.modulelistsel.push(module2);
            } else {
                module2 = $scope.modulelistsel[i];
            }
            // 寄存器
            for (var i=0; (i<module2['registerlist'].length) && (register.id!=module2['registerlist'][i].id); i++) ;
            var register2;
            if (i>=module2['registerlist'].length) {
                register2 = {'id':register.id, 'name':register.name, 'bitslist':[]};
                module2['registerlist'].push(register2);
            } else {
                register2 = module2['registerlist'][i];
            }
            for (var i=0; (i<register2['bitslist'].length) && (bits.id!=register2['bitslist'][i].id); i++) ;
            if (i>=register2['bitslist'].length) register2['bitslist'].push(bits);
        }
    }


    // map

    function map() 
    {
        var width = $scope.chip.width;

        $scope.bitindex = new Array(width);
        for (var i=0; i<width; i++) $scope.bitindex[i] = i;

        $http
        .get('/chip/register/map/'+$scope.module.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            // 将地址解析为数字
            var reglist = res.data.message.map((x)=>{
                x['address'] = parseInt(x['address'].substr(2),16);
                return x;
            });
            // 根据寄存器地址顺序排列
            reglist = reglist.sort(function(a,b){ return a.address-b.address; });
            
            /* 重新构建位组序列，需求是：
             * 1. 同一位组的连续位，合并后重新计算行高
             * 
             * 操作步骤
             * 1. 生成数组： [0-width]:{'id':bits.id, 'cnt':1}
             * 2. 倒序遍历， 如果当前元素和下一个元素的id相同，则将下一个元素的cnt设置为当前元素的cnt+下一个元素的cnt， 并且将当前元素的cnt清零
             * 3. 顺序变量数组，取出cnt不为0的元素
             * 4. 按序取出bits对象，并关联cnt数据
             */
            for (var i=0; i<reglist.length; i++) {
                var j;

                var reg = reglist[i];

                var bits = [];
                for (j=0; j<width; j++) bits[j] = {'id':0, 'cnt':1};
                // 构建寄存器位与所属位组的关系
                for (j=0; j<reg.bitlist.length; j++) {
                    var bits2 = reg.bitlist[j];
                    bits2.bitlist.split(',').map((x)=>{
                        var idx = parseInt(x);
                        bits[idx]['id'] = bits2.id; //{'id':bits2.id, 'cnt':1};
                    });
                }
                
                // 合并连续的位组
                for (j=width-2; j>=0; j--) {
                    if (!bits[j] || !bits[j+1] || (bits[j].id!=bits[j+1].id)) continue;
                    bits[j]['cnt']  += bits[j+1]['cnt'];
                    bits[j+1]['cnt'] = 0;
                }
                // 取出有效的位组，并关联位组数据
                var skip = 0;
                var bitlist = [];
                for (j=0; j<width; j++) {
                    if (skip && --skip) continue;
                    
                    if (!bits[j] || !bits[j].id) {
                        if (bits[j].cnt) bitlist.push({'id':0, 'name':'Reserved', 'cnt':bits[j].cnt});
                    } else {
                        var k = 0;
                        for (; (k<reg.bitlist.length) && (bits[j].id!=reg.bitlist[k].id); k++) ;
                        var tmp = angular.copy(reg.bitlist[k]);
                        tmp['cnt'] = skip = bits[j].cnt;
                        bitlist.push(tmp);
                    }
                }
                reglist[i]['bitlist2'] = bitlist;
            }
            $scope.registerlist = reglist;

            window.setTimeout(bitsRefresh, 10);
        })
    }

    // register

    $scope.registerUnfocus = ()=>{
        $('#bitsInfo').css('display', 'none');
    }

    // 当前只能有一个在聚焦
    $scope.registerFocus = (registerid)=>{
        if (!registerid) return ;

        $http
        .get('/chip/register/'+registerid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            var desc = ret.desc.replace(new RegExp('\n',"gm"),'<br/>');
            $('#bitsInfo').html(ret.fullname+'<br/>'+desc).css('display', 'block');
        });
    }


    // module

    function moduleUnselect() 
    {
        $scope.module = null;
        $scope.registerlist = [];
    }

    $scope.moduleSelect = moduleSelect;
    function moduleSelect(module) 
    {
        $(".modulesel").removeClass('modulesel');
        if ($scope.module==module) {
            moduleUnselect();
        } else {
            $scope.module = module;
            window.setTimeout(()=>{            
                var idx = $scope.modulelist.indexOf(module);
                $(".moduleContainer>a:eq("+idx+")").addClass('modulesel');
            }, 0);
    
            map();            
        }
    }

    function moduleGet() {
        if (!/^\d+$/.test($scope.chip.id)) return toastr.warning('请先选择一款芯片！');

        $http
        .get('/chip/module/chip/'+$scope.chip.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.module = null;
            $scope.modulelist = ret;
        })
    }


    // chip

    function chipUnselect() 
    {
        $scope.chip = null;
        $scope.module = null;
        
        $scope.modulelist = [];
        $scope.registerlist = [];
    }

    $scope.chipSelect = chipSelect;
    function chipSelect(chip)
    {
        $(".chipsel").removeClass('chipsel');
        if ($scope.chip && ($scope.chip.id == chip.id)) {
            chipUnselect();
        } else {
            $scope.chip = chip;
            moduleGet();
            window.setTimeout(()=>{
                var idx = $scope.chiplist.indexOf(chip);
                $(".chipContainer>a:eq("+idx+")").addClass('chipsel');
            }, 0);
        }

        $http
        .get('/chip/all/'+chip.id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            registerall = ret.registerlist;
            bitsall     = ret.bitslist;
        })
    }

    function chipGet() {
        $http
        .get('/chip/chip')
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.chiplist = ret;

            if (!ret.length) { //如果没有数据，则清空后续数据
                chipUnselect();
            } else { // 默认选择第一个
                chipSelect(ret[0]);
            }
        })
    }
}