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
    $scope.user = user;
    // 功能变量
    $scope.opts = {'str':'', 'page':1, 'pageSize':10};
    $scope.pages = [];
    $scope.financelist = [];
    $scope.money = '';
    $scope.date  = '';
    $scope.desc  = '';
    $scope.type  = 'pay';

    $scope.$watch('opts', get, true);
    
    $scope.get = get;
    function get() 
    {
        $http
        .get('/finance/search', {params:$scope.opts})
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            var ret = res.data.message;
            $scope.financelist = ret.financelist;

            $scope.opts['page'] = ret.page;
            $scope.pages = initPage(ret.page, $scope.opts.pageSize, ret.total, 16);  
        })
    }

    $scope.create = ()=>{
        var money = $scope.money;
        var date  = $scope.date;
        var desc  = $scope.desc;
        var type  = $scope.type;
        var moneyReg = /^\d+(\.\d+)?$/;
        var dateReg  = /^\d{4}(\-)\d{1,2}\1\d{1,2}$/;
        var types  = ['get', 'pay', 'payFixed', 'property'];
        if (!moneyReg.test(money) || !desc || (types.indexOf(type)==-1) || ((type!='payFixed') && !dateReg.test(date))) {
            return toastr.warning('请输入有效的参数！');
        }

        $http
        .post('/finance', {'money':money, 'date':date, 'desc':desc, 'type':type})
        .then((res)=>{
            if (errorCheck(res)) return ;
            get();
        })
    }


}
