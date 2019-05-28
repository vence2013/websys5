var app = angular.module('editApp', [])

appConfiguration(app)
.controller('editCtrl', editCtrl);


function editCtrl($scope, $http) {
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 应用数据
    $scope.chiplist = [];
    $scope.modulelist = [];
    $scope.registerlist = [];

    $scope.chip = {'id':0, 'name':'', 'width':''};
    $scope.module = {'id':0, 'name':'', 'fullname':''};
    $scope.register = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};

    chipGet();


    $scope.registerSelect = (register)=>{
        $(".sel").removeClass('sel');
        var idx = $scope.registerlist.indexOf(register);
        $(".registerContainer>div:eq("+idx+")").addClass('sel');
        $scope.register = register;
    }

    function registerGet() {
        if (!/^\d+$/.test($scope.module.id)) return toastr.warning('请先选择一款模块！');

        $http
        .get('/chip/register/'+$scope.module.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.registerlist = ret;
        })
    }

    $scope.registerSubmit = ()=>{
        var name = $scope.register.name;
        var address = $scope.register.address;
        if (!/^\d+$/.test($scope.module.id)) return toastr.warning('请先选择一个模块！');
        if (!name || !address) return toastr.warning('请输入有效的寄存器名称以及地址！');

        $http
        .post('/chip/register/'+$scope.module.id, $scope.register)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            if (!$scope.register.id) $scope.register = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
            registerGet();
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

    function moduleGet() {
        if (!/^\d+$/.test($scope.chip.id)) return toastr.warning('请先选择一款芯片！');

        $http
        .get('/chip/module/'+$scope.chip.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.modulelist = ret;
        })
    }

    $scope.moduleSelect = (module)=>{
        $(".sel").removeClass('sel');
        var idx = $scope.modulelist.indexOf(module);
        $(".moduleContainer>div:eq("+idx+")").addClass('sel');
        $scope.module = module;
        $scope.register = {'id':0, 'name':'', 'fullname':'', 'address':'', 'desc':''};
        registerGet();
    }

    $scope.moduleSubmit = ()=>{
        if (!/^\d+$/.test($scope.chip.id)) return toastr.warning('请先选择一款芯片！');
        if (!$scope.module.name) return toastr.warning('请输入有效的模块名称！');

        $http
        .post('/chip/module/'+$scope.chip.id, $scope.module)
        .then((res)=>{
            if (errorCheck(res)) return ; 
            
            moduleGet();
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

    function chipGet() {
        $http
        .get('/chip/chip')
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.chiplist = ret;
        })
    }

    $scope.chipSelect = (chip)=>{
        $(".sel").removeClass('sel');
        var idx = $scope.chiplist.indexOf(chip);
        $(".chipContainer>div:eq("+idx+")").addClass('sel');
        $scope.chip = chip;
        $scope.module = {'id':0, 'name':'', 'fullname':''};
        moduleGet();
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
            
            chipGet();
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