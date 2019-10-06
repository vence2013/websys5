var app = angular
    .module('indexApp', [])
    .filter('getTitle',function(){
        return function(content){
            var regExp = /[^ ] ([^\n]+)\n/;
            return content.match(regExp)[1];
        }
    });

appConfiguration(app)
.controller('indexCtrl', indexCtrl);


function indexCtrl($scope, $http, user, locals) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    var editor = editormd("funcInfo", {
        path : '/node_modules/editor.md/lib/',
        width: '41%',
        height: 690,
        onload : function() { 
            this.previewing(); 
            $('#funcInfo').find('.editormd-preview-close-btn').remove();
        } 
    });
    // 应用数据
    $scope.chiplist = [];
    $scope.chipsel  = null;
    $scope.modulelist = [];
    $scope.modulesel  = null;
    $scope.registerlist = [];
    $scope.bitindex = []; // 位映射的索引
    $scope.str = ''; // 寄存器或位组搜索
    $scope.$watch('str', mapSearch);
    $scope.functionlist = [];
    $scope.functionsels = []; // 选中功能列表
    $scope.multiSelect = false;

    chipGetList();

    // - 功能 -----------------------------------------------------------------

    $scope.functionDetailClose = () => {
        $('#funcInfo').css('display', 'none');
    }

    // 选中所有被选功能的位组
    function functionBits() 
    {
        $('.bitSelect').removeClass('bitSelect');
        for (i = 0; i < $scope.functionlist.length; i++) {
            var func = $scope.functionlist[i];
            if ($scope.functionsels.indexOf(func.id) == -1) continue;
            var bits = func.bitslist.split(',');
            for (var j = 0; j < bits.length; j++) {
                $('.bg'+bits[j]).removeClass('bitFocus').addClass('bitSelect');
            }
        }
    }

    $scope.functionEdit = () => {
        window.location.href = '/chip/function/edit/'+$scope.functionsels[0];
    }

    $scope.functionSelect = (func) => {        
        if ($scope.multiSelect) { // 多选
            $('.badge-success').removeClass('badge-success').addClass('badge-primary');
            $(".badge[funcid='"+func.id+"']").removeClass('badge-secondary').addClass('badge-primary');
            $scope.functionsels.push(func.id);
        } else {
            $('.badge-primary').removeClass('badge-primary').addClass('badge-secondary');
            $('.badge-success').removeClass('badge-success').addClass('badge-secondary');
            $(".badge[funcid='"+func.id+"']").removeClass('badge-secondary').addClass('badge-success');
            $scope.functionsels = [ func.id ];

            // 选择单个功能， 自动显示详细信息
            editor.setMarkdown(func.content); 
            $('#funcInfo').css('display', 'block');
        }

        window.setTimeout(functionBits, 0);
    }

    function getFunctionList(moduleid) 
    {
        $http
        .get('/chip/function/'+moduleid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.functionlist = ret;
        });
    }

    // - 寄存器及位组详细信息显示 ---------------------------------------------

    // - bits --------------------------------------------------------------

    $scope.bitUnfocus = ()=>{
        $('.bitFocus').removeClass('bitFocus');
        $('#floatInfo').css('display', 'none');
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
            var title = "<span>"+ret.name+
                "</span>,<span>"+ret.fullname+
                "</span>,<span>"+ret.rw+
                "</span>,<span>"+ret.valuelist+
                "</span><br/>";
            $('#floatInfo').html(title+desc).css('display', 'block');
        });
    }

    // - register ----------------------------------------------------------

    $scope.registerUnfocus = ()=>{
        $('#floatInfo').css('display', 'none');
    }

    // 当前只能有一个在聚焦
    $scope.registerFocus = (registerid)=>{
        if (!registerid) return ;

        $http
        .get('/chip/register/'+registerid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            var title = "<span>"+ret.name+
                "</span>,<span>"+ret.fullname+
                "</span>,<span>"+ret.address+
                "</span><br/>";
            var desc = ret.desc.replace(new RegExp('\n',"gm"),'<br/>');
            $('#floatInfo').html(title+desc).css('display', 'block');
        });
    }

    // - 芯片及模块列表显示 ---------------------------------------------------

    function mapSearch()
    {
        if (!$scope.modulesel) return;

        var str = $scope.str;
        if (!str) {
            mapShow(reglist);
            window.setTimeout(functionBits, 0);
        } else {
            // 搜索寄存器的：name, fullname, 位组的：name, fullname
            var list = [];

            for (var i=0; i<reglist.length; i++) {
                var reg = reglist[i];
                if ((reg.name.indexOf(str)==-1) && (reg.fullname.indexOf(str)==-1)) {
                    for (var j=0; j<reg.bitlist2.length; j++) {
                        var bits = reg.bitlist2[j];
                        if ((bits.name.indexOf(str)!=-1) || (bits.fullname && (bits.fullname.indexOf(str)!=-1))) 
                        {
                            list.push(reg);
                            break;
                        }
                    }
                } else {
                    list.push(reg);
                }
            }
            
            mapShow(list);
        }
    }

    function mapShow(reglist) 
    {
        $('#map').css('width', 120+101*reglist.length);
            
        var width = $scope.chipsel.width;
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
    }

    function registerMap() 
    {
        $http
        .get('/chip/register/map/'+$scope.modulesel.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            
            bitslist = [];
            // 将寄存器根据地址排序
            var list = ret.map((x)=>{
                // 搜集该寄存器下的位组
                for (var i = 0; i < x.bitlist.length; i++) {
                    bitslist.push(x.bitlist[i]);
                }

                x['address'] = parseInt(x['address'].substr(2),16);
                return x;
            });
            reglist = list.sort(function(a,b){ return a.address-b.address; });
            
            mapShow(reglist);     
        })
    }

    // - module -------------------------------------------------------------

    $scope.moduleSelect = moduleSelect;
    function moduleSelect(module) 
    {
        $scope.modulesel = module;
        locals.set('/chip/modulesel/'+user.username, module.id);

        $(".modulesel").removeClass('modulesel');
        window.setTimeout(()=>{            
            var idx = $scope.modulelist.indexOf(module);
            $(".moduleContainer>a:eq("+idx+")").addClass('modulesel');
        }, 0);

        registerMap();
        getFunctionList(module.id);
    }

    function moduleGetList() {
        if (!/^\d+$/.test($scope.chipsel.id)) return toastr.warning('请先选择一款芯片！');
        
        $http
        .get('/chip/module/chip/'+$scope.chipsel.id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.modulelist = ret;

            if (ret.length) {
                var moduleidPrevious = locals.get('/chip/modulesel/'+user.username);
                if (moduleidPrevious) {
                    for (var i = 0; (i < ret.length) && (ret[i].id != moduleidPrevious); i++) ;
                    if (i < ret.length) {
                        moduleSelect(ret[i]);
                    }
                } else {
                    moduleSelect(ret[0]);
                }
            }
        })
    }

    //- chip ------------------------------------------------------------------

    $scope.chipSelect = chipSelect;
    function chipSelect(chip)
    {        
        $scope.chipsel = chip;
        locals.set('/chip/chipsel/'+user.username, chip.id);

        $(".chipsel").removeClass('chipsel');
        window.setTimeout(()=>{
            var idx = $scope.chiplist.indexOf(chip);
            $(".chipContainer>a:eq("+idx+")").addClass('chipsel');
        }, 0);

        // 初始化map显示的数据（芯片的位宽）
        var width = $scope.chipsel.width;
        $scope.bitindex = new Array(width);
        for (var i=0; i<width; i++) $scope.bitindex[i] = i;

        moduleGetList();
    }

    function chipGetList() {
        $http
        .get('/chip/chip')
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $scope.chiplist = ret;

            if (ret.length) {
                var chipidPrevious = locals.get('/chip/chipsel/'+user.username);
                if (chipidPrevious) {
                    for (var i = 0; (i < ret.length) && (ret[i].id != chipidPrevious); i++) ;
                    if (i < ret.length) {
                        chipSelect(ret[i]);
                    }
                } else {
                    chipSelect(ret[0]);
                }                
            }
        })
    }
}
