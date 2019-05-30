var app = angular.module('editApp', [])

appConfiguration(app)
.controller('editCtrl', editCtrl);


function editCtrl($scope, $http) 
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

    $scope.chip = {'id':0, 'name':'', 'width':''};
    $scope.module = {'id':0, 'name':'', 'fullname':''};
    $scope.register = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
    $scope.bits = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};

    chipGet();


    // bits

    function bitsUnselect()
    {
        $scope.bits = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
    }

    $scope.bitsSelect = bitsSelect;
    function bitsSelect(bits)
    {
        $(".bitsContainer>.sel").removeClass('sel');
        if ($scope.bits == bits) {
            bitsUnselect();
        } else {
            $scope.bits = bits;
            window.setTimeout(()=>{            
                var idx = $scope.bitslist.indexOf(bits);
                $(".bitsContainer>div:eq("+idx+")").addClass('sel');
            }, 0);
        }
    }

    function bitsGet(sel) {
        if (!/^\d+$/.test($scope.register.id)) return toastr.warning('请先选择一个寄存器！');

        $http
        .get('/chip/bits/'+$scope.register.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.bitslist = ret;
            //如果没有数据，则清空后续数据
            if (!ret.length || (sel<0)) {
                bitsUnselect();
            } else {
                // 默认选择第一个
                var bits = ret[0];
                // 查看之前的选择是否还有效
                if ($scope.bits.id) { 
                    for (var i=0; (i<ret.length) && (ret[i].id!=$scope.bits.id); i++) ;
                    if (i<ret.length) bits = ret[i];
                }            
                bitsSelect(bits);
            }
        })
    }

    $scope.bitsSubmit = ()=>{
        var name = $scope.bits.name;
        var rw   = $scope.bits.rw;
        var bitlist   = $scope.bits.bitlist;
        var valuelist = $scope.bits.valuelist;        
        if (!/^\d+$/.test($scope.register.id)) return toastr.warning('请先选择一个寄存器！');
        if (!name || !rw || !/^(\d+,)*\d+$/.test(bitlist) || !/^(.,)*.$/.test(valuelist)) return toastr.warning('请输入有效的位组参数！');
        var arr1 = bitlist.split(',');
        var arr2 = valuelist.split(',');
        if (arr1.length!=arr2.length) return toastr.warning('位组的位序号和值数量不一样，请确认！');
        var i;
        // 检查位组序号的有效性
        var chipWidth = parseInt($scope.chip.width);            
        for (i=0; (i<arr1.length) && (parseInt(arr1[i])<chipWidth); i++) ;
        if (i<arr1.length) return toastr.warning('位组的序号应小于芯片位宽度， 请输入有效位组序号！');
        // 复位之可以为0/1/x

        $http
        .post('/chip/bits/'+$scope.register.id, $scope.bits)
        .then((res)=>{
            if (errorCheck(res)) return ; 

            bitsGet(-1);
            toastr.success(res.data.message);
        });
    }

    $scope.bitsDelete = ()=>{
        if (!/^\d+$/.test($scope.bits.id)) return toastr.warning('请选择要删除的寄存器！');

        $http
        .delete('/chip/bits/'+$scope.bits.id)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            
            bitsGet();
            toastr.success(res.data.message);
        });
    }


    // register 

    function registerUnselect()
    {
        $scope.register = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
        $scope.bits = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
        
        $scope.bitslist = [];
    }

    $scope.registerSelect = registerSelect;
    function registerSelect(register)
    {
        $(".registerContainer>.sel").removeClass('sel');
        if ($scope.register == register) {
            registerUnselect();
        } else {
            $scope.register = register;
            bitsGet();
            window.setTimeout(()=>{            
                var idx = $scope.registerlist.indexOf(register);
                $(".registerContainer>div:eq("+idx+")").addClass('sel');
            }, 0);
        }
    }

    function registerGet(sel) {
        if (!/^\d+$/.test($scope.module.id)) return toastr.warning('请先选择一款模块！');

        $http
        .get('/chip/register/'+$scope.module.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.registerlist = ret;
            //如果没有数据，则清空后续数据
            if (!ret.length || (sel<0)) {
                registerUnselect();
            } else {
                // 默认选择第一个
                var register = ret[0];
                // 查看之前的选择是否还有效
                if ($scope.register.id) { 
                    for (var i=0; (i<ret.length) && (ret[i].id!=$scope.register.id); i++) ;
                    if (i<ret.length) register = ret[i];
                }            
                registerSelect(register);
            }
        })
    }

    $scope.registerSubmit = ()=>{
        var name = $scope.register.name;
        var address = $scope.register.address;
        if (!/^\d+$/.test($scope.module.id)) return toastr.warning('请先选择一个模块！');
        if (!name || !/0[xX]{1}[0-9a-fA-F]+/.test(address)) return toastr.warning('请输入有效的寄存器名称以及地址！');

        $http
        .post('/chip/register/'+$scope.module.id, $scope.register)
        .then((res)=>{
            if (errorCheck(res)) return ; 

            registerGet(-1);
            toastr.success(res.data.message);
        });
    }

    $scope.registerDelete = ()=>{
        if (!/^\d+$/.test($scope.register.id)) return toastr.warning('请选择要删除的寄存器！');

        $http
        .delete('/chip/register/'+$scope.register.id)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            
            registerGet();
            toastr.success(res.data.message);
        });
    }


    // module

    function moduleUnselect() 
    {
        $scope.module = {'id':0, 'name':'', 'fullname':''};
        $scope.register = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
        $scope.bits = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
        
        $scope.registerlist = [];
        $scope.bitslist = [];
    }

    $scope.moduleSelect = moduleSelect;
    function moduleSelect(module) 
    {
        $(".moduleContainer>.sel").removeClass('sel');
        if ($scope.module == module) {
            moduleUnselect();
        } else {
            $scope.module = module;
            registerGet();
            window.setTimeout(()=>{            
                var idx = $scope.modulelist.indexOf(module);
                $(".moduleContainer>div:eq("+idx+")").addClass('sel');
            }, 0);
        }
    }

    function moduleGet(sel) {
        if (!/^\d+$/.test($scope.chip.id)) return toastr.warning('请先选择一款芯片！');

        $http
        .get('/chip/module/'+$scope.chip.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.modulelist = ret;
            //如果没有数据，则清空后续数据
            if (!ret.length || (sel<0)) {
                moduleUnselect();
            } else {
                // 默认选择第一个
                var module = ret[0];
                // 查看之前的选择是否还有效
                if ($scope.module.id) { 
                    for (var i=0; (i<ret.length) && (ret[i].id!=$scope.module.id); i++) ;
                    if (i<ret.length) module = ret[i];
                }            
                moduleSelect(module);
            }
        })
    }

    $scope.moduleSubmit = ()=>{
        if (!/^\d+$/.test($scope.chip.id)) return toastr.warning('请先选择一款芯片！');
        if (!$scope.module.name) return toastr.warning('请输入有效的模块名称！');

        $http
        .post('/chip/module/'+$scope.chip.id, $scope.module)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            
            moduleGet(-1);
            toastr.success(res.data.message);
        });
    }

    $scope.moduleDelete = ()=>{
        if (!/^\d+$/.test($scope.module.id)) return toastr.warning('请选择要删除的模块！');

        $http
        .delete('/chip/module/'+$scope.module.id)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            
            moduleGet();
            toastr.success(res.data.message);
        });
    }


    // chip

    function chipUnselect() 
    {
        $scope.chip = {'id':0, 'name':'', 'width':''};
        $scope.module = {'id':0, 'name':'', 'fullname':''};
        $scope.register = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
        $scope.bits = {'id':0, 'name':'', 'fullname':'', 'bitlist':'', 'valuelist':'', 'rw':'', 'desc':''};
        
        $scope.modulelist = [];
        $scope.registerlist = [];
        $scope.bitslist = [];
    }

    $scope.chipSelect = chipSelect;
    function chipSelect(chip)
    {
        $(".chipContainer>.sel").removeClass('sel');
        if ($scope.chip.id == chip.id) {
            chipUnselect();
        } else {
            $scope.chip = chip;
            moduleGet();
            window.setTimeout(()=>{
                var idx = $scope.chiplist.indexOf(chip);
                $(".chipContainer>div:eq("+idx+")").addClass('sel');
            }, 0);
        }
    }

    // sel - 默认选择
    function chipGet(sel) {
        $http
        .get('/chip/chip')
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.chiplist = ret;
            //如果没有数据，则清空后续数据
            if (!ret.length || (sel<0)) {
                chipUnselect();
            } else {
                // 默认选择第一个
                var chip = ret[0];
                // 查看之前的选择是否还有效
                if ($scope.chip.id) { 
                    for (var i=0; (i<ret.length) && (ret[i].id!=$scope.chip.id); i++) ;
                    if (i<ret.length) chip = ret[i];
                }            
                chipSelect(chip);
            }
        })
    }

    $scope.chipSubmit = ()=>{
        var name = $scope.chip.name;
        var width = $scope.chip.width;
        if (!name || !/^\d+$/.test(width)) return toastr.warning('请输入有效的芯片参数！');

        var chipid = /^\d+$/.test($scope.chip.id) ? $scope.chip.id : 0;
        $http
        .post('/chip/'+chipid, $scope.chip)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            
            chipGet(-1);
            toastr.success(res.data.message);
        });
    }

    $scope.chipDelete = ()=>{
        if (!/^\d+$/.test($scope.chip.id)) return toastr.warning('请选择要删除的芯片！');

        $http
        .delete('/chip/'+$scope.chip.id)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            
            chipGet();
            toastr.success(res.data.message);
        });
    }
}