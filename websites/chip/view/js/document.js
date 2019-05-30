var app = angular.module('documentApp', [])

appConfiguration(app)
.controller('documentCtrl', documentCtrl);


function documentCtrl($scope, $http, user) 
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
    
    chipGet();


    // map

    function map() 
    {
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
            $scope.registerlist = reglist.sort(function(a,b){ return a.address-b.address; });
            /* 重新构建位组序列
             * 1. 同一位组的连续位，合并后重新计算行高
             * 
             * 操作步骤
             * 1. 生成数组： [0-width]:{'id':bits.id, 'cnt':1}
             * 2. 倒序遍历， 如果当前元素和下一个元素的id相同，则将下一个元素的cnt设置为当前元素的cnt+下一个元素的cnt， 并且将当前元素的cnt清零
             * 3. 顺序变量数组，取出cnt不为0的元素
             * 4. 按序取出bits对象，并关联cnt数据
             */
            
            console.log(res, reglist);
        })
    }


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

        map();
    }

    function moduleGet() {
        if (!/^\d+$/.test($scope.chip.id)) return toastr.warning('请先选择一款芯片！');

        $http
        .get('/chip/module/'+$scope.chip.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.modulelist = ret;

            //如果没有数据，则清空后续数据
            if (!ret.length) {
                moduleUnselect();
            } else {
                moduleSelect(ret[0]);
            }
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