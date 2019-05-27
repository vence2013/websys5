var app = angular.module('documentApp', [])

appConfiguration(app)
.controller('documentCtrl', documentCtrl);


function documentCtrl($scope, $http, user) {
}