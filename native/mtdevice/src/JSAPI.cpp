// ============================================================================
//  JSAPI 总注册入口
//  pluginname = "mtdevice"
//  => .so 名 libjsapi_mtdevice.so、JS: import { DeviceModule } from 'mtdevice'
// ============================================================================

#include <jsmodules/JSCModuleExtension.h>
#include <jquick_config.h>
#include "DeviceModule/JSDeviceModule.hpp"

using namespace JQUTIL_NS;

static std::vector<std::string> exportList = {
    "DeviceModule",
};

static int module_init(JSContext *ctx, JSModuleDef *m)
{
    auto env = JQModuleEnv::CreateModule(ctx, m, "mtdevice"); // 必须 == pluginname
    env->setModuleExport("DeviceModule", createDeviceModule(env.get()));
    env->setModuleExportDone(JS_UNDEFINED, exportList);
    return 0;
}

DEF_MODULE_LOAD_FUNC_EXPORT(mtdevice, module_init, exportList)

extern "C" JQUICK_EXPORT void custom_init_jsapis()
{
    registerCModuleLoader("mtdevice", &mtdevice_module_load);
}
