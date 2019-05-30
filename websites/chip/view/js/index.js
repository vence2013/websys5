var app = angular.module('indexApp', [])

appConfiguration(app)
.controller('indexCtrl', indexCtrl);


function indexCtrl($scope, $http, user) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 应用数据
    $scope.chiplist = [];
    $scope.modulelist = [];
    $scope.chip = null;
    $scope.module = null;
    
    chipGet();


    // module

    $scope.moduleSelect = moduleSelect;
    function moduleSelect(module) 
    {
        $scope.module = module;
        $(".modulesel").removeClass('modulesel');
        window.setTimeout(()=>{            
            var idx = $scope.modulelist.indexOf(module);
            $(".moduleContainer>div:eq("+idx+")").addClass('modulesel');
        }, 0);
    }

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


    // chip

    function chipUnselect() 
    {
        $scope.chip = null;
        $scope.module = null;
        
        $scope.modulelist = [];
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
                $(".chipContainer>div:eq("+idx+")").addClass('chipsel');
            }, 0);
        }
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