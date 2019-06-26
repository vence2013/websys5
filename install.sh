#!/bin/bash
# 配置参数
# CFG_templateDir - 模板文件的相对目录
CFG_templateDir="core/template"


# 运行参数， 通过硬件检测或命令行参数修改
# RUNTIME_target - 系统运行的目标设备类型，是PC还是rpc(树莓派)
# RUNTIME_debug  - 调试使能，调试运行时，不会自动将应用脚本(apps.js)复制为启动脚本(index.js)
RUNTIME_target='pc'
OSInfo=$(uname -a|grep -o '[0-9a-zA-Z_]*\sGNU/Linux$')
if [ ${OSInfo:0:3} == 'arm' ]; then 
    RUNTIME_target='rpi'
fi
RUNTIME_debug=0


# 解析命令行参数
# -h|--help, 显示帮助信息
# -d|--debug, 使能调试
# -c|--clean, 清除已安装的文件
ARGS=`getopt -o "hdc" -l "help,debug,clean" -n "install.sh" -- "$@"`
eval set -- "${ARGS}"
while true; do
    case "${1}" in
        -h|--help)
            shift
            echo "usage: ./install.sh -h|--help -c|--clean -d|--debug"
            echo "This script will check software: docker, docker-compose"
            exit
            ;;
        -d|--debug)
            shift
            echo "debug mode!"
            RUNTIME_debug=1
            ;;
        -c|--clean)
            shift
            docker-compose -p websys down
            rm -fv index.js docker-compose.yml 
            echo "Cleand!"            
            exit
            ;;
        --)
            shift;
            break;
            ;;
    esac
done
echo -e "Configuration:\n\ttemplateDir:"${CFG_templateDir}"\nRuntime Configuration:\n\ttarget:"${RUNTIME_target}"\n\tdebug:"${RUNTIME_debug}


# exit_with_message(msg)
exit_with_message() {
    if [ $# -gt 0 ]; then
        echo $1
    fi
    exit
}

# #############################################################################
# 检查相关软件的安装
# 1. 系统软件： docker-ce, docker-compose(至少支持v2)
# 2. docker容器： mysql:5.5, node:9.11
#
# 参考： [Shell脚本实现简单分割字符串](https://blog.csdn.net/gb4215287/article/details/78090821)
# #############################################################################

# Docker
VerDocker=$(docker -v 2>&1)
if [ ${VerDocker:0:6} != "Docker" ]; then
    exit_with_message "Error> Docker not installed."
fi
VerDockerSub=$(echo $VerDocker | sed 's/[^0-9]*\([0-9\.]*\).*/\1/' | cut -d \. -f 1)
if [ ${VerDockerSub} -lt 17 ]; then
    exit_with_message "Error> docker(>=18.x) version too old!";
fi
# DockerCompose
VerDockerCompose=$(docker-compose -v 2>&1)
if [ ${VerDockerCompose:0:14} != "docker-compose" ]; then
    exit_with_message "Error> Docker-compose not installed."
fi
VerDockerComposeX=$(echo $VerDockerCompose | sed 's/[^0-9]*\([0-9\.]*\).*/\1/')
VerDockerComposeMajor=`echo ${VerDockerComposeX}|cut -d \. -f 1`
VerDockerComposeMinor=`echo ${VerDockerComposeX}|cut -d \. -f 2`
if [ ${VerDockerComposeMajor} -lt 1 ] || [ ${VerDockerComposeMinor} -lt 12 ]; then
    exit_with_message "Error> docker-compose(>=1.12.x) version too old!";
fi
echo -e "System Software:\n\t"${VerDocker}"\n\t"${VerDockerCompose} 

# Docker Images
ImageMysql="mysql:5.5"
ImageNode='node:9.11'
ImageCheckMysql=$(docker images --format "{{.Repository}}:{{.Tag}}"|grep -o "${ImageMysql}")
if [ -z "${ImageCheckMysql}" ]; then 
    echo "Pull image ${ImageMysql}"
    docker pull ${ImageMysql}
fi
ImageCheckNode=$(docker images --format "{{.Repository}}:{{.Tag}}"|grep -o "${ImageNode}")
if [ -z "${ImageCheckNode}" ]; then 
    echo "Pull image ${ImageNode}"
    docker pull ${ImageNode}
fi


# #############################################################################
# 检查并创建数据目录结构
# dataroot/
#   upload/
#     big/              上传文件大小：(1GB, ~)
#       201903/
#         xxx.ext
#       201904/
#         xxx.ext
#       ...
#     median/           上传文件大小: (100MB, 1024MB]
#       ...
#     small/            上传文件大小：[0B, 100MB]
#       ...
#   export/           用于容器导出，比如数据库容器导出数据表及数据
#
# 注： 
# 1. 脚本所在的目录即为系统根目录。
# 2. 以后有需要再添加
# #############################################################################

if [ ! -f ".env" ]; then
    exit_with_message "Error> Need custom .env(copy from script/template/env, and modify as required)."
fi
tmp=$(cat .env | grep "ROOTFS_DATA=" | sed 's/\xd//')
dataroot=${tmp:12}
if [ ! -d "${dataroot}" ]; then 
    exit_with_message 'data direcotry not exist('${dataroot}').'
fi
echo -e "Path in host system:\n\tdataroot:"${dataroot}

if [ ! -d "${dataroot}/upload" ]; then
    mkdir -pv ${dataroot}/upload
fi
if [ ! -d "${dataroot}/export" ]; then
    mkdir -pv ${dataroot}/export
fi


# #############################################################################
# 设置运行时环境(提取相关文件)
# 1. index.js(dummy.js)
# 2. docker-compose.yml(docker-compose-pc.yml, docker-compose-rpi.yml)
# #############################################################################

# dummy.js > index.js
# 在未安装npm软件包前， 必须要index.js存在，容器才能正常启动；但apps.js无法使用(相应的
# 软件包未安装)， 所以只使用dummy.js占位。
cp -fv dummy.js index.js
# docker-compose-pc.yml|docker-compose-rpi.yml > docker-compose.yml
if [ "${RUNTIME_target}" == "pc" ]; then
    cp -fv ${CFG_templateDir}/docker-compose_pc.yml docker-compose.yml
else
    cp -fv ${CFG_templateDir}/docker-compose_rpi.yml docker-compose.yml
fi


# #############################################################################
# 重建容器，安装容器内的npm软件包
# #############################################################################

# 提取容器名称
tmp=$(cat .env | grep "CONTAINER_WEB_NAME=" | sed 's/\xd//')
CONTAINER_WEB_NAME=${tmp:19}
tmp=$(cat .env | grep "CONTAINER_MYSQL_NAME=" | sed 's/\xd//')
CONTAINER_MYSQL_NAME=${tmp:21}
echo -e "Container Names:\n\tweb:"${CONTAINER_WEB_NAME}"\n\tmysql: "${CONTAINER_MYSQL_NAME}
# 删除后创建容器
docker-compose -p websys down
docker-compose -p websys up -d
# 安装容器内的npm软件包
docker exec ${CONTAINER_WEB_NAME} /usr/local/bin/npm install
# 修正editor.md在浏览器上按键无法使用的情况。
docker exec ${CONTAINER_WEB_NAME} /bin/sed -i 's#return eventType;#return mouseEventType;#g' node_modules/editor.md/editormd.js
# 系统依赖的软件包安装完成后， 如果是发行版本就使用app.js替换dummy.js
if [ ${RUNTIME_debug} -eq 0 ]; then
    echo "Copy apps.js as index.js"
    cp -fv apps.js index.js
fi


# #############################################################################
# 重启容器以应用各种改变。
# #############################################################################

echo "Restart the web container"
# 重启数据容器，是为了让脚本执行时，数据库容器已可用。 
docker restart ${CONTAINER_MYSQL_NAME} 
# 重启网页容器是必要的， 因为之前启动是 npm 软件包可能还没有安装， 因此应用没有正确运行。
docker restart ${CONTAINER_WEB_NAME}
# 安装完成。
exit_with_message "Install Finished!"