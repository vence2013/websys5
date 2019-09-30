var app = angular.module('userApp', []);

appConfiguration(app)
.controller('userCtrl', userCtrl);  

function userCtrl($scope, $http) {
    $scope.username = '';
    $scope.password = '';
    $scope.usersel  = null;  
    $scope.userlist = [];

    get();

    $scope.edit = ()=>{
        var username = $scope.username;  
        var password = $scope.password;
        if (!username || !password) { return toastr.info('请输入有效的帐号和密码', '', {"positionClass": "toast-bottom-right"}); }

        $http
        .post('/user', {'username': username, 'password': password})
        .then((res)=>{
            if (errorCheck(res)) return ;

            get();
            $scope.username = '';
            $scope.password = '';            
        });
    }

    $scope.delete = ()=>{
        $http
        .delete('/user/'+$scope.usersel.id)
        .then((res)=>{ 
            if (errorCheck(res)) return ;
            $("#delUserConfirm").modal( "hide" );

            get();
            $scope.username = '';
            $scope.password = '';  
            $scope.usersel  = null;            
        });
    }

    function get() {
        $http
        .get('/user')
        .then((res)=>{
            if (errorCheck(res)) return ;            
            $scope.userlist = res.data.message;
        })
    }

    $scope.userSelect = (x)=>{
        $scope.usersel = x;
        $scope.username = x.username;
    }
}