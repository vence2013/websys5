var app = angular.module('documentApp', [])

appConfiguration(app)
.controller('documentCtrl', documentCtrl);


function documentCtrl($scope, $http, $interval, user) 
{
    // 基础配置
    toastr.options = { closeButton: false, debug: false, progressBar: true, positionClass: "toast-bottom-right",  
        onclick: null, showDuration: "300", hideDuration: "1000", timeOut: "2000", extendedTimeOut: "1000",  
        showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"  
    };
    // 应用数据
    $scope.chiplist = [];
    $scope.modulelist = [];
    $scope.registerlist = [];
    $scope.chip = null;
    $scope.module = null;
    $scope.bitindex = []; // 位映射的索引

    var content = '';
    var docid   = $('#wrapper').attr('docid');
    $scope.docid= parseInt(docid);
    // 初始化editor.md
    var editor = editormd("editormd", {
        path : '/node_modules/editor.md/lib/',
        width: '100%',
        height: 330,
        toolbarIcons : function() {
            return editormd.toolbarModes['simple']; // full, simple, mini
        },    
        onload : function() {
            /*
            // 获取编辑标签的内容
            if (docid!='0') { detail(); }
            else { tagGet(); }*/
        }    
    });   
    // 启动定时解析文章内容    
    $interval(()=>{ content = editor.getMarkdown(); }, 1000);

    chipGet();




    // 当前只能有一个在聚焦
    $scope.bitFocus = (bitid)=>{
        if (!bitid) return ;

        $('.bitFocus').removeClass('bitFocus');
        $('.bg'+bitid).addClass('bitFocus');
    }

    // 允许多选
    $scope.bitSelect = (bitid)=>{
        if (!bitid) return ;

        if ($('.bg'+bitid).hasClass('bitSelect')) {
            $('.bg'+bitid).removeClass('bitSelect');
        } else {
            $('.bg'+bitid).addClass('bitSelect');
        }
    }


    // map

    function map() 
    {
        var width = $scope.chip.width;

        $scope.bitindex = new Array(width);
        for (var i=0; i<width; i++) $scope.bitindex[i] = i;

        $http
        .get('/chip/register/map/'+$scope.module.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            // 将地址解析为数字
            var reglist = res.data.message.map((x)=>{
                x['address'] = parseInt(x['address'].substr(2),16);
                return x;
            });
            // 根据寄存器地址顺序排列
            reglist = reglist.sort(function(a,b){ return a.address-b.address; });
            
            /* 重新构建位组序列，需求是：
             * 1. 同一位组的连续位，合并后重新计算行高
             * 
             * 操作步骤
             * 1. 生成数组： [0-width]:{'id':bits.id, 'cnt':1}
             * 2. 倒序遍历， 如果当前元素和下一个元素的id相同，则将下一个元素的cnt设置为当前元素的cnt+下一个元素的cnt， 并且将当前元素的cnt清零
             * 3. 顺序变量数组，取出cnt不为0的元素
             * 4. 按序取出bits对象，并关联cnt数据
             */
            for (var i=0; i<reglist.length; i++) {
                var j;

                var reg = reglist[i];

                var bits = [];
                for (j=0; j<width; j++) bits[j] = {'id':0, 'cnt':1};
                // 构建寄存器位与所属位组的关系
                for (j=0; j<reg.bitlist.length; j++) {
                    var bits2 = reg.bitlist[j];
                    bits2.bitlist.split(',').map((x)=>{
                        var idx = parseInt(x);
                        bits[idx]['id'] = bits2.id; //{'id':bits2.id, 'cnt':1};
                    });
                }
                
                // 合并连续的位组
                for (j=width-2; j>=0; j--) {
                    if (!bits[j] || !bits[j+1] || (bits[j].id!=bits[j+1].id)) continue;
                    bits[j]['cnt']  += bits[j+1]['cnt'];
                    bits[j+1]['cnt'] = 0;
                }
                // 取出有效的位组，并关联位组数据
                var skip = 0;
                var bitlist = [];
                for (j=0; j<width; j++) {
                    if (skip && --skip) continue;
                    
                    if (!bits[j] || !bits[j].id) {
                        if (bits[j].cnt) bitlist.push({'id':0, 'name':'Reserved', 'cnt':bits[j].cnt});
                    } else {
                        var k = 0;
                        for (; (k<reg.bitlist.length) && (bits[j].id!=reg.bitlist[k].id); k++) ;
                        var tmp = angular.copy(reg.bitlist[k]);
                        tmp['cnt'] = skip = bits[j].cnt;
                        bitlist.push(tmp);
                    }
                }
                reglist[i]['bitlist2'] = bitlist;
            }
            $scope.registerlist = reglist;
        })
    }


    // module

    function moduleUnselect() 
    {
        $scope.module = null;
        $scope.registerlist = [];
    }

    $scope.moduleSelect = moduleSelect;
    function moduleSelect(module) 
    {
        $scope.module = module;
        $(".modulesel").removeClass('modulesel');
        window.setTimeout(()=>{            
            var idx = $scope.modulelist.indexOf(module);
            $(".moduleContainer>div:eq("+idx+")").addClass('modulesel');
        }, 0);

        map();
    }

    function moduleGet() {
        if (!/^\d+$/.test($scope.chip.id)) return toastr.warning('请先选择一款芯片！');

        $http
        .get('/chip/module/'+$scope.chip.id)
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.modulelist = ret;

            //如果没有数据，则清空后续数据
            if (!ret.length) {
                moduleUnselect();
            } else {
                moduleSelect(ret[0]);
            }
        })
    }


    // chip

    function chipUnselect() 
    {
        $scope.chip = null;
        $scope.module = null;
        
        $scope.modulelist = [];
    }

    $scope.chipSelect = chipSelect;
    function chipSelect(chip)
    {
        $(".chipsel").removeClass('chipsel');
        if ($scope.chip && ($scope.chip.id == chip.id)) {
            chipUnselect();
        } else {
            $scope.chip = chip;
            moduleGet();
            window.setTimeout(()=>{
                var idx = $scope.chiplist.indexOf(chip);
                $(".chipContainer>div:eq("+idx+")").addClass('chipsel');
            }, 0);
        }
    }

    function chipGet() {
        $http
        .get('/chip/chip')
        .then((res)=>{
            if (errorCheck(res)) return ;
            var ret = res.data.message;
            $scope.chiplist = ret;

            if (!ret.length) { //如果没有数据，则清空后续数据
                chipUnselect();
            } else { // 默认选择第一个
                chipSelect(ret[0]);
            }
        })
    }
}