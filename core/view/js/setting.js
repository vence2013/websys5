var app = angular.module('settingApp', [])

appConfiguration(app)
.controller('settingCtrl', settingCtrl);



function settingCtrl($scope, $http, user, locals) {
    $scope.user = user;
    $scope.oldPassword = '';
    $scope.newPassword = '';
    $scope.confirmPassword = '';

    function logout () {
        $http
        .get('/logout')
        .then((res)=>{            
            locals.setObject('/user', null);
            window.location.href = '/';
        })
    }

    $scope.changePassword = ()=>{
        var oldPassword = $scope.oldPassword;
        var password1 = $scope.newPassword;
        var password2 = $scope.confirmPassword;
        if (!password1 || (password1!=password2)) { return toastr.info("请输入有效的新密码!", '', {"positionClass": "toast-bottom-right"}); }

        $http
        .put('/user', {'oldPassword':oldPassword, 'password':password1})
        .then((res)=>{
            if (errorCheck(res)) return ;
            toastr.info("密码修改成功，请重新登录！", '', {"positionClass": "toast-bottom-right"});
            window.setTimeout(logout, 3000);
        })
    }
}