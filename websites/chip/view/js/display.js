var app = angular.module('displayApp', [])

appConfiguration(app)
.controller('displayCtrl', displayCtrl);

function displayCtrl($scope, $http) {
    $scope.detail = null;
    $scope.modulelistsel = [];

    var docid   = $('#wrapper').attr('docid');

    var editor = editormd("editormd", { 
        path : '/node_modules/editor.md/lib/',
        width : '100%',             
        tocContainer : ".TOC",
        tocDropdown  : false,        
        onload : function() { 
            this.previewing(); 
            $('#editormd').find('.editormd-preview-close-btn').remove();

            detail();
        }    
    }); 

    function detail() {
        $http
        .get('/chip/document/detail/'+docid)
        .then((res)=>{
            if (errorCheck(res)) return ;
            
            $scope.detail = res.data.message;
            editor.setMarkdown($scope.detail.content); 
            $scope.modulelistsel = $scope.detail['modulelistsel'];
        })
    }

    $scope.registerUnfocus = ()=>{
        $('#info').css('display', 'none');
    }

    $scope.registerFocus = (registerid)=>{        
        $http
        .get('/chip/register/'+registerid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $('#info').html(ret.fullname+'<br/>'+ret.desc).css('display', 'block');
        });
    }

    $scope.bitsUnfocus = ()=>{
        $('#info').css('display', 'none');
    }

    $scope.bitsFocus = (bitsid)=>{
        $http
        .get('/chip/bits/'+bitsid)
        .then((res)=>{
            if (errorCheck(res)) return ;

            var ret = res.data.message;
            $('#info').html(ret.fullname+'<br/>'+ret.desc).css('display', 'block');
        });        
    }
}