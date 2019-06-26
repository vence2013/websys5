var app = angular.module('indexApp', [])

appConfiguration(app)
.controller('indexCtrl', indexCtrl);


function indexCtrl($scope, $http) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 基金数据    
    $scope.opts = {'companyCreate':'', 'companyMoney':'', 'companyManager':'', 
        'foundCreate':'', 'foundMoney':'', 'foundShare':'', 
        'statisticWeek':'', 'statisticMonth':'', 'statisticQuarter':'', 'statisitcHalfyear':'', 'statistic1year':'', 
        'statistic2year':'', 'statistic3year':'', 'statisticThisyear':'', 'statisticCreate':'',
        'valueMin':'', 'valueMinGT':'', 'valueMinLT':'', 'valueMax':'', 'valueMaxGT':'', 'valueMaxLT':''};
    $scope.companylist = [];
    $scope.foundlist   = [];
    $scope.filterlist  = [];
    $scope.filterid    = 0;
    $scope.company = null;
    $scope.found   = null;

    get();
    window.setTimeout(apply, 100);

    // 净值数据筛选耗时太长，随时提交只会增加服务器负担，改为手动应用筛选。
    $scope.apply = apply;
    function apply() {
        $scope.companylist = [];
        $scope.foundlist   = [];
        $scope.company = null;
        $scope.found   = null;
        
        $('#applyFilter').popover('show');
        $http
        .get('/found/filter/apply', {params:$scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;

            $('#applyFilter').popover('hide');
            var ret = res.data.message;
            $scope.companylist = ret.companylist;
            $scope.foundlist   = ret.foundlist;
        })
    }

    $scope.select = (type, code)=>{
        if (type=='company') {
            $scope.found   = null;
            $http
            .get('/found/company/'+code)
            .then((res)=>{
                if (errorCheck(res)) return ;
                $scope.company = res.data.message;
            })
        } else {
            $scope.company = null;
            $http
            .get('/found/found/'+code)
            .then((res)=>{
                if (errorCheck(res)) return ;
                $scope.found = res.data.message;
            })
        }
    }

    /* 获取已存储的过滤器 */
    function get() {
        $http
        .get('/found/filter')
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.filterlist = res.data.message;
        });
    }

    /* 更新过滤器 */
    $scope.update = ()=>{
        var name = $scope.filterName;
        if (!name) { return toastr.info('请输入有效的过滤器名称', '', {"positionClass": "toast-bottom-right"}); }

        $http
        .post('/found/filter', {'name': name, 'filter': $scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;
            get();
        });
    }

    $scope.use = (id)=>{
        $scope.filterid = id;
        $(".badge-success").removeClass('badge-success').addClass('badge-secondary');
        $("#filter"+id).removeClass('badge-secondary').addClass('badge-success');

        $http
        .get('/found/filter/detail/'+id)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var filter = res.data.message;
            $scope.filterName = filter.name;
            for (x in $scope.opts) {
                $scope.opts[x] = filter[x];
            }
            apply();
        });
    }

    $scope.delete = ()=>{
        $http
        .delete('/found/filter/'+$scope.filterid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            get();
        })
    }
}