var app = angular.module('uploadApp', ['angularFileUpload'])

appConfiguration(app)
.directive('ngThumb', ['$window', function($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function(item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function(file) {
            var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function(scope, element, attributes) {
            if (!helper.support) return;

            
            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file)) return;
            if (!helper.isImage(params.file)) return;

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({ width: width, height: height });
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}])
.controller('uploadCtrl', uploadCtrl)

function uploadCtrl($scope, FileUploader) {
    $scope.itemSel = null;

    var uploader = $scope.uploader = new FileUploader({
        url: '/file/upload', 'queueLimit': 30, removeAfterUpload: true
    });
    // 取消已存在(文件名/大小相同)的文件
    uploader.filters.push({ name: 'syncFilter',
        fn: function(item, options) { 
            if (this.queue.length>=24) return false; // 限制上传的数量
            for (var i=0; i<this.queue.length; i++) {
                if ((this.queue[i]._file.name === item.name) && (this.queue[i]._file.size===item.size)) return false;
            }
            return true;
        }
    });

    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        if (/^[\-0-9]+$/.test(response.errorCode)) {
            $scope.itemSel = null;
            if (response.errorCode != 0) { 
                toastr.info(response.message+'('+fileItem.file.name+')', '', {"positionClass": "toast-bottom-right", "timeOut": 5000}); 
            }
        } else {
            toastr.info('文件上传错误！', '', {"positionClass": "toast-bottom-right"});
            console.log(response);
        }
    };

    $scope.select = (file)=>{
        $scope.itemSel = file;
    }
}