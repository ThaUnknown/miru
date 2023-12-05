#!/bin/bash

# instructions
# Install Android NDK
# Set $ANDROID_NDK_PATH (example: ~/Android/Sdk/ndk/26.1.10909125)
# Download and extract android .zip for nodejs-mobile from https://github.com/nodejs-mobile/nodejs-mobile/releases/tag/v18.17.2
# Update LIBNODE_PATH
# npm install nodejs-mobile-gyp
# install other npm packages like normal
# run this script

toolchain_target_arch=aarch64
node_target_arch=arm64
android_api_level=22
toolchain_folder=$ANDROID_NDK_PATH/toolchains/llvm/prebuilt/linux-x86_64/bin
export LIBNODE_PATH=~/Downloads/nodejs-mobile

export PATH=$toolchain_folder:$PATH

export CC=$toolchain_folder/${toolchain_target_arch}-linux-android${android_api_level}-clang
export CXX=$toolchain_folder/${toolchain_target_arch}-linux-android${android_api_level}-clang++
export LINK=$toolchain_folder/${toolchain_target_arch}-linux-android${android_api_level}-clang++
export AR=$toolchain_folder/llvm-ar

export npm_config_verbose=1
export npm_config_nodedir=${LIBNODE_PATH}
export npm_config_node_gyp=$(pwd)/node_modules/nodejs-mobile-gyp/bin/node-gyp.js
export npm_config_arch=${node_target_arch}
export npm_config_plaform=android
export npm_config_format=make-android
export npm_gyp_defines="target_arch=$node_target_arch v8_target_arch=$node_target_arch android_target_arch=$node_target_arch host_os=linux OS=android"

#mv node_modules ../node_modules.bak
# --from-from-source is used by node-pre-gyp
npm rebuild --build-from-source
# Remove executable permissions from native node modules
# find node_modules -iname '*.node' -exec chmod -x '{}' \;

# buildroot=$(pwd)/ncc
# target=arm64-android

# buildpath="${buildroot}/${target}"
# if [ ! -d "${buildpath}" ]; then
#   mkdir -p "${buildpath}"
# fi

# ncc build --source-map -d --asset-builds  --target es2022 -o ${buildpath} src/offline.ts

# rm -rf node_modules
# mv ../node_modules.bak node_modules
