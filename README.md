# 美团 — 词典笔 Falcon Mini-app

面向有道词典笔（RK3562 / aarch64 / Buildroot 2021.11 / Falcon 4.9.7）的美团风格 mini-app。
所有组件样式统一使用 vh/vw 单位，C/C++ native 模块由 GitHub Actions 交叉编译。

## 快速开始

```bash
# 需要 GITHUB_TOKEN（read:packages 权限）拉取 @penosext 私有包
pnpm install
pnpm generate      # 生成 miniapp.lock
pnpm test          # 纯逻辑测试
pnpm typecheck     # tsc --noEmit
pnpm build         # 打包 AMR（--mock 模式）
```

## 设备安装

```bash
adb push dist/<app>.amr /tmp/meituan.amr
adb shell miniapp_cli install /tmp/meituan.amr
adb shell miniapp_cli start 0000000000000000 --index
```

（appid 与启动页以 `docs/PLAN.md` 与 `profiles/` 为准。）

## 文档

- [项目标准](docs/STANDARDS.md)
- [总计划与进度](docs/PLAN.md)
- [设备 profile](profiles/youdao-rk3562-y02.yaml)

## 平台兼容补丁

`patches/@penosext__miniapp-aiot-vue-cli@1.0.35.patch` 修复构建器在 Windows 下
把绝对路径（`F:\...`）误判为裸模块导致 `modules are not found` 的问题；
经 `pnpm-workspace.yaml` 的 `patchedDependencies` 在 `pnpm install` 时自动应用。
上游合并后可移除。

## 素材来源

- 应用图标：由 MIT 协议的 emoji-datasource-google（袋鼠）与系统字体合成，见 `docs/STANDARDS.md` 交付检查。
