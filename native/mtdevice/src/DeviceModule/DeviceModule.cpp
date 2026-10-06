#include "DeviceModule.hpp"
#include <cstddef>
#include <cstdlib>
#include <fstream>
#include <sys/sysinfo.h>
#include <sys/utsname.h>
#include <unistd.h>

std::string DeviceModule::getVersion() const { return "0.1.0"; }

std::string DeviceModule::getArch() const
{
    struct utsname buf{};
    if (uname(&buf) != 0)
        return "unknown";
    return std::string(buf.machine);
}

int DeviceModule::getPageSize() const
{
    long v = sysconf(_SC_PAGESIZE);
    return v > 0 ? static_cast<int>(v) : 0;
}

int DeviceModule::getOnlineCpus() const
{
    long v = sysconf(_SC_NPROCESSORS_ONLN);
    return v > 0 ? static_cast<int>(v) : 0;
}

bool DeviceModule::readMemInfo(DeviceMemoryInfo &out) const
{
    // /proc/meminfo 常驻内存文件，行数固定量级；限定读取长度防异常环境
    std::ifstream f("/proc/meminfo");
    if (!f.is_open())
        return false;
    DeviceMemoryInfo info;
    std::string line;
    bool gotTotal = false, gotAvail = false;
    while (std::getline(f, line) && !(gotTotal && gotAvail))
    {
        if (line.rfind("MemTotal:", 0) == 0)
        {
            info.totalKb = std::atol(line.c_str() + 9);
            gotTotal = true;
        }
        else if (line.rfind("MemAvailable:", 0) == 0)
        {
            info.availableKb = std::atol(line.c_str() + 13);
            gotAvail = true;
        }
    }
    if (!gotTotal)
        return false;
    out = info;
    return true;
}
