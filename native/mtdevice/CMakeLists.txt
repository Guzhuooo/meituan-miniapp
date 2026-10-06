cmake_minimum_required(VERSION 3.10)

# 交叉编译器一律从环境变量注入（CI 或本机 profile 脚本设置），本地 x86 构建
# 只用于语法检查时同样通过这两个变量指向主机 gcc。
if(DEFINED ENV{CROSS_C_COMPILER} AND DEFINED ENV{CROSS_CXX_COMPILER})
  set(CMAKE_C_COMPILER "$ENV{CROSS_C_COMPILER}")
  set(CMAKE_CXX_COMPILER "$ENV{CROSS_CXX_COMPILER}")
elseif(DEFINED ENV{CROSS_TOOLCHAIN_PREFIX})
  set(CMAKE_C_COMPILER "$ENV{CROSS_TOOLCHAIN_PREFIX}gcc")
  set(CMAKE_CXX_COMPILER "$ENV{CROSS_TOOLCHAIN_PREFIX}g++")
else()
  message(FATAL_ERROR "Set CROSS_C_COMPILER/CROSS_CXX_COMPILER from the target device profile (see profiles/)")
endif()

project(jsapi_mtdevice C CXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(SDK "${CMAKE_SOURCE_DIR}/iot-miniapp-sdk")

file(GLOB_RECURSE SDK_SOURCES "${SDK}/src/*.cpp")
add_library(iot_sdk STATIC ${SDK_SOURCES})
target_compile_options(iot_sdk PRIVATE -w)
target_include_directories(iot_sdk PUBLIC "${SDK}/include")
set_target_properties(iot_sdk PROPERTIES POSITION_INDEPENDENT_CODE ON)

file(GLOB_RECURSE PLUGIN_SOURCES "${CMAKE_SOURCE_DIR}/src/*.cpp")
add_library(jsapi_mtdevice SHARED ${PLUGIN_SOURCES})
target_include_directories(jsapi_mtdevice PRIVATE "${CMAKE_SOURCE_DIR}/src")
target_compile_options(jsapi_mtdevice PRIVATE
  -Wall -Wextra -Werror=return-type -Wno-psabi -fvisibility=hidden)
target_link_libraries(jsapi_mtdevice PRIVATE
  iot_sdk pthread -Wl,-unresolved-symbols=ignore-all)
set_target_properties(jsapi_mtdevice PROPERTIES
  OUTPUT_NAME "jsapi_mtdevice"
  PREFIX "lib")

# 注意：链接目标为设备 glibc 2.36 / GLIBCXX ≤ 3.4.29（见 profiles/）。
# 新增 curl/sqlite/GStreamer 依赖时，只能使用目标 sysroot 匹配版本。
