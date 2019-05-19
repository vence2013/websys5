var app = angular.module('settingApp', [])

appConfiguration(app)
.controller('settingCtrl', settingCtrl);


function settingCtrl($scope, $http, user, locals) {
    $scope.user = user;
    $scope.oldPassword = '';
    $scope.newPassword = '';
    $scope.confirmPassword = '';
    $scope.tagstr = '';
    $scope.backupfile = '';
    $scope.backupmessage = '等待备份';

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

    $scope.searchDocument = ()=>{
        window.open('/document?taglist='+$scope.tagstr, "_blank");
    }

    var backupQueryTimer = null;
    
    function backupQuery() {
        $http
        .get('/backup/progress')
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.backupmessage = res.data.message;
            if (res.data.message=='数据备份完成！') window.clearInterval(backupQueryTimer);
        });
    }

    $scope.backup = ()=>{
        var tagstr = $scope.tagstr;

        $http
        .get('/backup', {params: {'taglist':tagstr}})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.backupfile = res.data.message;
            backupQueryTimer = window.setInterval(backupQuery, 1000);            
        })
    }
}