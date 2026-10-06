// 业务工作类：纯 OS/C++，不依赖 jsutil —— 可在 host 上单测
#pragma once
#include <string>

struct DeviceMemoryInfo {
    long totalKb = 0;      // /proc/meminfo MemTotal
    long availableKb = 0;  // /proc/meminfo MemAvailable（内核 <3.14 为 0）
};

class DeviceModule
{
public:
    DeviceModule() = default;
    ~DeviceModule() = default;

    // 模块版本（与 package.json/STANDARDS 中的 native 版本约定一致）
    std::string getVersion() const;

    // 内核架构 + 页大小 + 在线 CPU 数（短操作，不阻塞）
    std::string getArch() const;
    int getPageSize() const;
    int getOnlineCpus() const;

    // 阻塞文件 IO：读 /proc/meminfo。失败返回 false 并保持 out 不变
    bool readMemInfo(DeviceMemoryInfo &out) const;
};
