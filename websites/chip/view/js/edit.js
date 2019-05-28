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

    chipReset();
    chipGet();

    function chipReset() {
        $scope.chip = {'id':0, 'name':'', 'width':''};
    }

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
        
        if (chip.id == $scope.chip.id) { chipReset(); }
        else {
            var idx = $scope.chiplist.indexOf(chip);
            $(".chipContainer>div:eq("+idx+")").addClass('sel');
            $scope.chip = chip;
        }
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