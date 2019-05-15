var app = angular.module('indexApp', [])

appConfiguration(app)
.controller('indexCtrl', indexCtrl);



function indexCtrl($scope, user) {
    $scope.user = user;

    $scope.$watch("user",function  () {
        //console.log('after', $scope.user);
    }, true)

}
