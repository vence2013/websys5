var app = angular.module('userApp', []);

appConfiguration(app)
.controller('userCtrl', userCtrl);  

function userCtrl($scope, $http) {
    $scope.username = '';
    $scope.usersel  = null;  
    $scope.groupsel = null;  // 用于辅助移出组的操作
    $scope.userlist = [];
    $scope.interfacelist = {};    
    $scope.interfaceSelectAll = false;

    userGet();
    interfacesGet();
    $scope.$watch('interfaceSelectAll', (val)=>{
        if (!$scope.usersel) return ;

        $("#interfacelist").find("input[type='checkbox']").each((idx, itm)=>{ $(itm).prop("checked", val ? 'checked' : ''); });
        // 查找当前所有被选中的接口，组成列表字符串
        var interfacelist = [];
        $("#interfacelist").find("input[type='checkbox']:checked").map((idx, item)=>{ interfacelist.push($(item).val()); });

        $http
        .post('/interface/set/'+$scope.usersel.id, {'interfacestr': interfacelist.join(' ')})
        .then((res)=>{
            if (errorCheck(res)) return ;
            interfaceRefresh(res.data.message);
        });
    })

    function interfacesGet() {
        $http
        .get('/interface/private')
        .then((res)=>{
            if (errorCheck(res)) return ;
            res.data.message.map((x)=>{
                var key = x['group'];
                if ($scope.interfacelist[key]) $scope.interfacelist[key].push(x);
                else $scope.interfacelist[key] = [x];
            });
        })
    }

    function interfaceRefresh(interfacestr) {
        var interfacelist = interfacestr
                            .replace(/[\s]+/, ' ')  // 删除多余的空格
                            .replace(/^\s+|\s+$/g,'') // 删除首尾的空格
                            .split(' ');
        $scope.usersel['interfaces'] = interfacelist;
        // 更新该用户可访问的接口
        $("#interfacelist").find("input[type='checkbox']").each((idx, itm)=>{ $(itm).prop("checked", ''); });
        if ($scope.usersel['interfaces'].length) {
            $("#interfacelist").find("input[type='checkbox']").each((idx, itm)=>{
                if ($scope.usersel['interfaces'].indexOf($(itm).val())!=-1) $(itm).prop("checked", 'checked');
            });
        }
    }

    // 多个接口之间使用逗号分隔， 因为空格无法传递
    function interfaceAttach(interfacestr) {
        $http
        .post('/interface/add/'+$scope.usersel.id, {'interface': interfacestr})
        .then((res)=>{
            if (errorCheck(res)) return ;
            interfaceRefresh(res.data.message);
        });
    }

    function interfaceDetach(interfacestr) {
        $http
        .delete('/interface/'+$scope.usersel.id, {'params': {'interface': interfacestr}})
        .then((res)=>{
            if (errorCheck(res)) return ;
            interfaceRefresh(res.data.message);
        });
    }

    /* 如果当前接口在用户的可访问接口列表中，则删除，否则添加 */
    $scope.editInterface = (interface)=>{
        var interfacestr = interface.method+interface.url;
        if ($scope.usersel.interfaces.indexOf(interfacestr)==-1) interfaceAttach(interfacestr);
        else interfaceDetach(interfacestr);
    }

    $scope.userCreate = ()=>{
        var username = $scope.username;     
        if (!username) { return toastr.info('帐号为空，请重新输入', '', {"positionClass": "toast-bottom-right"}); }

        $http
        .post('/user', {'username': username})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.username = '';
            userGet();
        });
    }

    $scope.userDelete = ()=>{
        $http
        .delete('/user/'+$scope.usersel.id)
        .then((res)=>{ 
            if (errorCheck(res)) return ;
            $("#delUserConfirm").modal( "hide" );
            $("#interfacelist").find("input[type='checkbox']").each((idx, itm)=>{ $(itm).prop("checked", ''); });
            $scope.name    = '';
            $scope.usersel = null;
            $scope.grouplist = [];
            userGet();
        });
    }

    function userGet() {
        $http
        .get('/user')
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            var userlist = res.data.message;
            // 将用户可访问的私有接口字符串转换为数组
            for (var i=0; i<userlist.length; i++) {
                if (userlist[i]['interfaces']) {
                    userlist[i]['interfaces'] = userlist[i]['interfaces']
                                                .replace(/[\s]+/, ' ')  // 删除多余的空格
                                                .replace(/^\s+|\s+$/g,'') // 删除首尾的空格
                                                .split(' ');
                } else {
                    userlist[i]['interfaces'] = [];
                }
            }
            $scope.userlist = userlist;
        })
    }

    $scope.userSelect = (x)=>{
        $scope.usersel = x;
        $scope.interfaceSelectAll = false;
        // 获取该用户的所属组，设置该用户可访问的私有接口
        groupGet(x.id);
        // 更新该用户可访问的接口
        $("#interfacelist").find("input[type='checkbox']").each((idx, itm)=>{ $(itm).prop("checked", ''); });
        if ($scope.usersel['interfaces'].length) {
            $("#interfacelist").find("input[type='checkbox']").each((idx, itm)=>{
                if ($scope.usersel['interfaces'].indexOf($(itm).val())!=-1) $(itm).prop("checked", 'checked');
            });
        }
    }

    function groupGet(userid) {
        $http
        .get('/group/'+userid)
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.grouplist = res.data.message;
        })
    }

    $scope.groupJoin = (name)=>{
        $http
        .post('/group/'+$scope.usersel.id, {'group': name})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.grouplist = res.data.message;
        })
    }

    $scope.groupSelect = (name)=>{
        $scope.groupsel = name;
    }

    $scope.groupDelete = ()=>{
        $http
        .delete('/group/'+$scope.usersel.id, {params: {'group': $scope.groupsel}})
        .then((res)=>{
            if (errorCheck(res)) return ;
            $scope.grouplist = res.data.message;
        });
    }
}