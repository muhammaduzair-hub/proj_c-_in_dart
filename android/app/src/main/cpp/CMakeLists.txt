
#
# Copyright (C) The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

cmake_minimum_required(VERSION 3.22.1)

# configure import libs
set(distribution_DIR ${CMAKE_SOURCE_DIR}/../../../../distribution)

# shared lib will also be tucked into APK and sent to target
# refer to app/build.gradle, jniLibs section for that purpose.
# ${ANDROID_ABI} is handy for our purpose here. Probably this ${ANDROID_ABI} is
# the most valuable thing of this sample, the rest are pretty much normal cmake
add_library(proj SHARED IMPORTED)
set_target_properties(
        proj
        PROPERTIES
        IMPORTED_LOCATION ${distribution_DIR}/gperf/lib/${ANDROID_ABI}/libproj.so)

add_library(sqlite SHARED IMPORTED)
set_target_properties(
        sqlite
        PROPERTIES
        IMPORTED_LOCATION ${distribution_DIR}/gperf/lib/${ANDROID_ABI}/libsqlite3.so)

# build application's shared lib
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++11")

add_library(proj-libs SHARED
        native-lib.cpp)

target_include_directories(proj-libs PRIVATE
        ${distribution_DIR}/gperf/include)

target_link_libraries(
        proj-libs
        android
        proj
        sqlite
        log)
