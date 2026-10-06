// JS 包壳类：JS 端可见的 API、协议、线程模型都在这里组织
#pragma once
#include "DeviceModule.hpp"
#include <jqutil_v2/jqutil.h>
#include <memory>
#include <mutex>

using namespace JQUTIL_NS;

class JSDeviceModule : public JQPublishObject
{
public:
    JSDeviceModule();
    ~JSDeviceModule();

    // 同步：短操作，禁止阻塞 IO
    void getVersion(JQFunctionInfo &info);
    void getArch(JQFunctionInfo &info);
    void getPageSize(JQFunctionInfo &info);
    void getOnlineCpus(JQFunctionInfo &info);

    // Promise：阻塞文件 IO（/proc/meminfo）
    void readMemInfo(JQAsyncInfo &info);

private:
    std::unique_ptr<DeviceModule> obj_;
    mutable std::mutex objMutex_;
    DeviceModule *getObj() const
    {
        std::lock_guard<std::mutex> lock(objMutex_);
        return obj_.get();
    }
};

extern JSValue createDeviceModule(JQModuleEnv *env);
