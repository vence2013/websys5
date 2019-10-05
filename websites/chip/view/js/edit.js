var app = angular.module('editApp', [])

appConfiguration(app)
.controller('editCtrl', editCtrl);


function editCtrl($scope, $http, user, locals) 
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
    $scope.bitslist = [];
    // 页面初始化时会自动选择第1个元素
    $scope.chipsel = null;
    $scope.modulesel = null;
    $scope.registersel = null;
    $scope.bitsel = null;


    /************ 芯片元素（芯片， 模块， 寄存器， 位组）编辑 *********************/

    // - bits -----------------------------------------------------------------

    $scope.bitsReset = () => {
        $scope.bitsel = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
    }

    $scope.bitsEdit = () => {
        var name = $scope.bitsel.name;
        var rw   = $scope.bitsel.rw;
        var bitlist   = $scope.bitsel.bitlist;
        var valuelist = $scope.bitsel.valuelist;        
        if (!name || !rw || !/^(\d+,)*\d+$/.test(bitlist) || !/^(.,)*.$/.test(valuelist)) return toastr.warning('请输入有效的位组参数！');
        var arr1 = bitlist.split(',');
        var arr2 = valuelist.split(',');
        if (arr1.length!=arr2.length) return toastr.warning('位组的位序号和值数量不一样，请确认！');

        var i;
        // 检查位组序号的有效性
        var chipWidth = parseInt($scope.chipsel.width);            
        for (i=0; (i<arr1.length) && (parseInt(arr1[i])<chipWidth); i++) ;
        if (i<arr1.length) return toastr.warning('位组的序号应小于芯片位宽度， 请输入有效位组序号！');
        // 复位之可以为0/1/x

        $http
        .post('/chip/bits/'+$scope.registersel.id, $scope.bitsel)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            toastr.success(res.data.message);

            getBitsList(name);            
        });
    }

    $scope.bitsDelete = () => {
        if (!/^\d+$/.test($scope.bitsel.id)) return toastr.warning('请选择要删除的寄存器！');

        $http
        .delete('/chip/bits/'+$scope.bitsel.id)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            toastr.success(res.data.message);

            getBitsList();            
        });
    }

    // - register -------------------------------------------------------------

    $scope.registerReset = () => {
        $scope.registersel = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
    }

    $scope.registerEdit = ()=>{
        var name = $scope.registersel.name;
        var address = $scope.registersel.address;
        if (!name || !/0[xX]{1}[0-9a-fA-F]+/.test(address)) return toastr.warning('请输入有效的寄存器名称以及地址！');

        $http
        .post('/chip/register/'+$scope.modulesel.id, $scope.registersel)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            toastr.success(res.data.message);

            getRegisterList(name);            
        });
    }

    $scope.registerDelete = ()=>{
        if (!/^\d+$/.test($scope.registersel.id)) return toastr.warning('请选择要删除的寄存器！');

        $http
        .delete('/chip/register/'+$scope.registersel.id)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            toastr.success(res.data.message);

            getRegisterList();            
        });
    }

    // - module ---------------------------------------------------------------

    $scope.moduleReset = ()=> {
        $scope.modulesel = {'id':0, 'name':'', 'fullname':''};
    }

    $scope.moduleEdit = () => {
        var name = $scope.modulesel.name;
        if (!name) return toastr.warning('请输入有效的模块名称！');

        $http
        .post('/chip/module/'+$scope.chipsel.id, $scope.modulesel)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            toastr.success(res.data.message);

            getModuleList(name);            
        });
    }

    $scope.moduleDelete = () => {
        if (!/^\d+$/.test($scope.modulesel.id)) return toastr.warning('请选择要删除的模块！');

        $http
        .delete('/chip/module/'+$scope.modulesel.id)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            toastr.success(res.data.message);

            getModuleList();            
        });
    }

    // - chip -----------------------------------------------------------------

    $scope.chipReset = () => {
        $scope.chipsel = {'id':0, 'name':'', 'width':''};;
    }

    $scope.chipEdit = ()=>{
        var id    = $scope.chipsel.id;
        var name  = $scope.chipsel.name;
        var width = $scope.chipsel.width;
        if (!name || !/^\d+$/.test(width)) return toastr.warning('请输入有效的芯片参数！');
        
        $http
        .post('/chip/chip/'+id, $scope.chipsel)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            toastr.success(res.data.message);

            chipGetList(name);            
        });
    }

    $scope.chipDelete = () => {
        if (!/^\d+$/.test($scope.chipsel.id)) return toastr.warning('请选择要删除的芯片！');

        $http
        .delete('/chip/chip/'+$scope.chipsel.id)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            toastr.success(res.data.message);

            chipGetList();            
        });
    }

    /****************** 芯片元素（芯片， 模块， 寄存器， 位组）关联显示 ***********/

    // - bits -----------------------------------------------------------------

    $scope.bitsSelect = bitsSelect;
    function bitsSelect(bits)
    {        
        $scope.bitsel = bits;
        $(".bitsContainer>.sel").removeClass('sel');
        window.setTimeout(()=>{            
            var idx = $scope.bitslist.indexOf(bits);
            $(".bitsContainer>div:eq("+idx+")").addClass('sel');
        }, 0);
    }

    function getBitsList(namePreselect) {
        $http
        .get('/chip/bits/register/'+$scope.registersel.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.bitslist = ret;
            
            if (ret.length) {
                if (namePreselect) {
                    for (var i=0; (i<ret.length) && (ret[i].name!=namePreselect); i++) ;
                    if (i<ret.length) {
                        bitsSelect(ret[i]);
                    }
                } else {
                    bitsSelect(ret[0]);
                }
            } else {
                $scope.bitsel   = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
            }            
        })
    }

    // - register -------------------------------------------------------------

    $scope.registerSelect = registerSelect;
    function registerSelect(register)
    {
        $scope.registersel = register;
        locals.set('/chip/edit/registersel/'+user.username, register.id);
        
        $(".registerContainer>.sel").removeClass('sel');
        window.setTimeout(()=>{            
            var idx = $scope.registerlist.indexOf(register);
            $(".registerContainer>div:eq("+idx+")").addClass('sel');
        }, 0);

        getBitsList();
    }

    function getRegisterList(namePreselect) {
        $http
        .get('/chip/register/module/'+$scope.modulesel.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.registerlist = ret;
            
            if (ret.length) {
                if (namePreselect) {
                    for (var i=0; (i<ret.length) && (ret[i].name!=namePreselect); i++) ;
                    if (i<ret.length) {
                        registerSelect(ret[i]);
                    }
                } else {
                    var registeridPrevious = locals.get('/chip/edit/registersel/'+user.username);
                    if (registeridPrevious) {
                        for (var i = 0; (i < ret.length) && (ret[i].id != registeridPrevious); i++) ;
                        if (i < ret.length) {
                            registerSelect(ret[i]);
                        }
                    } else { // 默认选择第一个
                        registerSelect(ret[0]);
                    }
                }                
            } else {
                $scope.registersel  = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
                $scope.bitslist = [];
                $scope.bitsel   = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
            }            
        })
    }

    // - module ---------------------------------------------------------------

    $scope.moduleSelect = moduleSelect;
    function moduleSelect(module)
    {
        $scope.modulesel = module;
        locals.set('/chip/edit/modulesel/'+user.username, module.id);

        $(".moduleContainer>.sel").removeClass('sel');
        window.setTimeout(()=>{            
            var idx = $scope.modulelist.indexOf(module);
            $(".moduleContainer>div:eq("+idx+")").addClass('sel');
        }, 0);

        getRegisterList();
    }

    function getModuleList(namePreselect)
    {
        $http
        .get('/chip/module/chip/'+$scope.chipsel.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.modulelist = ret;
            
            if (ret.length) {
                if (namePreselect) {
                    for (var i=0; (i<ret.length) && (ret[i].name!=namePreselect); i++) ;
                    if (i<ret.length) {
                        moduleSelect(ret[i]);
                    }
                } else {
                    var moduleidPrevious = locals.get('/chip/edit/modulesel/'+user.username);
                    if (moduleidPrevious) {
                        for (var i = 0; (i < ret.length) && (ret[i].id != moduleidPrevious); i++) ;
                        if (i < ret.length) {
                            moduleSelect(ret[i]);
                        }
                    } else { // 默认选择第一个
                        moduleSelect(ret[0]);
                    }
                }
            } else {
                // 没有任何模块时，需要清除所有后续元素：模块编辑， 寄存器列表，编辑， 位组列表， 编辑
                $scope.modulesel    = {'id':0, 'name':'', 'fullname':''};
                $scope.registerlist = [];
                $scope.registersel  = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
                $scope.bitslist = [];
                $scope.bitsel   = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
            }
        })
    }

    //- chip ------------------------------------------------------------------

    $scope.chipSelect = chipSelect;
    /* 选择某个芯片。
     * 需要进行的工作有：
     * 1. 更新数据：选中的芯片
     * 2. 更新显示：选中的芯片
     * 3. 更新模块列表
     */
    function chipSelect(chip)
    {
        $scope.chipsel = chip;
        locals.set('/chip/edit/chipsel/'+user.username, chip.id);

        $(".chipContainer>.sel").removeClass('sel');
        window.setTimeout(()=>{
            var idx = $scope.chiplist.indexOf(chip);
            $(".chipContainer>div:eq("+idx+")").addClass('sel');
        }, 0);

        getModuleList();
    }

    /* 获取芯片列表
     * 1. 获取并更新芯片列表数据
     * 2. 默认选择第1个芯片
     * 
     * 说明： 允许预先选择某个芯片，应用于：新增芯片后选中
     */
    function chipGetList(namePreselect) {
        $http
        .get('/chip/chip')
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.chiplist = ret;  

            if (ret.length) {
                if (namePreselect) {
                    for (var i=0; (i<ret.length) && (ret[i].name!==namePreselect); i++) ;
                    if (i<ret.length) {
                        chipSelect(ret[i]);
                    }
                } else { 
                    var chipidPrevious = locals.get('/chip/edit/chipsel/'+user.username);
                    if (chipidPrevious) {  // 恢复上次的选择
                        for (var i = 0; (i < ret.length) && (ret[i].id != chipidPrevious); i++) ;
                        if (i < ret.length) {
                            chipSelect(ret[i]);
                        }
                    } else { // 默认选择第一个
                        chipSelect(ret[0]);
                    }
                }
            } else {
                $scope.chipsel = {'id':0, 'name':'', 'width':''};
                $scope.modulelist = [];
                $scope.modulesel  = {'id':0, 'name':'', 'fullname':''};
                $scope.registerlist = [];
                $scope.registersel  = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
                $scope.bitslist = [];
                $scope.bitsel   = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
            }
        })
    }

    chipGetList();
}