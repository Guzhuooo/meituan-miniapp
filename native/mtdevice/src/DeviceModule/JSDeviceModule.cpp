#include "JSDeviceModule.hpp"
#include <Exceptions/AssertFailed.hpp>
#include <Exceptions/Exception.hpp>

// ----------------------------------------------------------------------------
// Factory：6 步骨架；JS 侧 import { DeviceModule } from 'mtdevice'
// ----------------------------------------------------------------------------
extern JSValue createDeviceModule(JQModuleEnv *env)
{
    JQFunctionTemplateRef tpl = JQFunctionTemplate::New(env, "DeviceModule");
    tpl->InstanceTemplate()->setObjectCreator([]() { return new JSDeviceModule(); });

    tpl->SetProtoMethod("getVersion", &JSDeviceModule::getVersion);
    tpl->SetProtoMethod("getArch", &JSDeviceModule::getArch);
    tpl->SetProtoMethod("getPageSize", &JSDeviceModule::getPageSize);
    tpl->SetProtoMethod("getOnlineCpus", &JSDeviceModule::getOnlineCpus);
    tpl->SetProtoMethodPromise("readMemInfo", &JSDeviceModule::readMemInfo);

    JSDeviceModule::InitTpl(tpl);
    return tpl->CallConstructor();
}

JSDeviceModule::JSDeviceModule()
    : obj_(std::make_unique<DeviceModule>()) {}

JSDeviceModule::~JSDeviceModule() = default;

// 同步方法都不接受入参
void JSDeviceModule::getVersion(JQFunctionInfo &info)
{
    try {
        ASSERT(info.Length() == 0);
        DeviceModule *o = getObj();
        ASSERT(o != nullptr);
        info.GetReturnValue().Set(o->getVersion());
    } catch (const std::exception &e) {
        info.GetReturnValue().ThrowInternalError(e.what());
    }
}

void JSDeviceModule::getArch(JQFunctionInfo &info)
{
    try {
        ASSERT(info.Length() == 0);
        DeviceModule *o = getObj();
        ASSERT(o != nullptr);
        info.GetReturnValue().Set(o->getArch());
    } catch (const std::exception &e) {
        info.GetReturnValue().ThrowInternalError(e.what());
    }
}

void JSDeviceModule::getPageSize(JQFunctionInfo &info)
{
    try {
        ASSERT(info.Length() == 0);
        DeviceModule *o = getObj();
        ASSERT(o != nullptr);
        info.GetReturnValue().Set(o->getPageSize());
    } catch (const std::exception &e) {
        info.GetReturnValue().ThrowInternalError(e.what());
    }
}

void JSDeviceModule::getOnlineCpus(JQFunctionInfo &info)
{
    try {
        ASSERT(info.Length() == 0);
        DeviceModule *o = getObj();
        ASSERT(o != nullptr);
        info.GetReturnValue().Set(o->getOnlineCpus());
    } catch (const std::exception &e) {
        info.GetReturnValue().ThrowInternalError(e.what());
    }
}

void JSDeviceModule::readMemInfo(JQAsyncInfo &info)
{
    try {
        ASSERT(info.Length() == 0);
        DeviceModule *o = getObj();
        ASSERT(o != nullptr);
        DeviceMemoryInfo mem;
        if (!o->readMemInfo(mem))
        {
            info.postError("readMemInfo: /proc/meminfo unavailable");
            return;
        }
        info.post(Bson::object{
            // Bson 无 long long 构造器；KB 值转为 double 无精度损失（< 2^53）
            {"totalKb", static_cast<double>(mem.totalKb)},
            {"availableKb", static_cast<double>(mem.availableKb)},
        });
    } catch (const std::exception &e) {
        info.postError(e.what());
    }
}
