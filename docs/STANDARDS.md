# 项目标准（STANDARDS）

本文件是工程约束的唯一权威来源。违反标准的代码不进 main。
设备相关事实一律以 [profiles/youdao-rk3562-y02.yaml](../profiles/youdao-rk3562-y02.yaml) 为准，本文件只引用不复制。

## 1. 目标平台

- 目标设备 profile：`youdao-rk3562-y02-497`（RK3562, aarch64, Buildroot 2021.11, glibc 2.36, Falcon 4.9.7）。
- 发现新机型/新固件 → 新增 profile 文件，**禁止**修改全局默认值去覆盖旧设备。
- 禁止在业务代码里写死：逻辑宽高、旋转、offset、触控映射、工具链路径、appid。这些只能从 profile 或运行时探测读取。

## 2. 样式单位标准：vh/vw（本项目强制）

- **所有组件样式一律使用 `vw` / `vh`**，禁止 `px`/`rpx` 固定值（`border-radius`、`font-size` 也用 vh 表达）。
- 理由：设备逻辑分辨率尚未完全验证（物理 936×280、direction 270），vh/vw 与分辨率解耦，跨机型天然适配。
- 换算约定：以屏幕物理短边 ≈ 100vh 基准设计；`1vh ≈ 2.8` 物理像素（280 高）。
- 状态切换 class（选中/打烊）只允许改 `opacity`/`background-color` 等非几何属性，**不得改变宽高**。
- **验收门（Phase 3 spike）**：`pages/probe` 探针页在真机 + 模拟器验证四角/中心/scroller/触控映射。通过前，本节标注"待验证"；不通过则启用降级方案（先实测 `setViewPort` 支持的单位，在 profile 记录，本节改写）。

## 3. Falcon UI 约束

- 文字必须包在 `<text>` 里；`<image>` 必须同时设 `src/width/height`；`<scroller>` 必须显式宽高和方向。
- 只用单 class 选择器；多值圆角简写拆成单角属性；显式写 `flex-direction`。
- 长列表分批渲染（`MtMerchantList` 的 BATCH_SIZE 模式），不做一次性大 v-for。

### 3.1 语言约束（实测平台事实，2026-10-06）

aiot-vue-cli 的 rollup 管线中，`@rollup/plugin-typescript` 的 TS 转换依赖 TS watch program 的异步 emit，与模块 `load` 存在竞态，在 Windows 上稳定失败（raw TS 源码被当 JS 解析）。实测证据：

- SFC `<script lang="ts">` 内的 TS 语法（`import type`、类型注解）→ 构建直接 parse error；
- 被页面导入的 `.ts` 文件（`import type` 语法）→ 同样 parse error（3/3 复现，含最小复现）。

**规则**：进入 rollup bundle 的源码一律写成**可被纯 JS 解析**的形式：

- SFC `<script>` 块：纯 JS（无 `lang="ts"`、无类型注解）；
- `src/**` 运行时模块：`.js` + JSDoc 类型（`tsconfig` 已开 `allowJs` + `checkJs`，strict 依然生效）；
- `.ts` 仅允许出现在 `tests/`（由 tsx 运行，不进 bundle）与不参与构建的类型文件中。

违反后果：AMR 构建失败或产物含未转换语法。新增依赖文件前先跑 `pnpm build` 验证。

### 3.2 真机运行时契约（2026-10-06 实测，证据见 profiles/）

以下为真机复现过的硬约束，违反会导致黑屏或功能静默失效：

1. **App 入口必须是 class**：`class App extends $falcon.App` + `export default App`。导出普通对象会在真机 `launchApp` 报 `TypeError: not a constructor` 并黑屏。`onLaunch` 中必须 `super.onLaunch(options)` 并调用 `$falcon.useDefaultBasePageClass(BasePage)`。
2. **页面生命周期钩子必须定义在 Vue 组件的 `methods` 里**（`onShow`/`onHide`/`onUnload`）。设备默认页基类通过 `this.$root.onShow()` 转发，写在顶层选项不会被执行（表现为数据不加载、timer 不启动）。
3. **启动命令**：`miniapp_cli start {appId} {page}`，page 是**位置参数**；传 `--probe` 会被当作字面文件名（找 `--probe.js`）而失败。省略 page 只创建进程不挂页面。
4. **vh/vw 直接生效**：1vh=0.01×屏高（280px 屏 → 2.8px）、1vw=0.01×屏宽（936px 屏 → 9.36px），无需 `setViewPort`。
5. 证据文件命名：`profiles/evidence/<日期>-<场景>.png`，与 profile.yaml 的 validation.evidence 条目互指。

## 4. 分层标准

```text
src/
  app.js / app.json      # 入口与页面注册（页面名 = 目录名 = manifest 页面键）
  pages/                 # 页面：只消费 services 的稳定接口 + 组件
  components/            # 纯展示组件，全部 vh/vw，无直接 IO
  services/              # 数据契约 + adapter：能力检测、归一化、错误翻译都在这层
  mocks/                 # mock 数据（JSON），与真实 service 同接口
```

- 页面禁止直接 `import` mock JSON 或直连底层 API；换数据源只改 `services/merchantService.ts`。
- 所有异步入口用 **generation 计数**防过期回调写页面（参照 `pages/index/index.vue`）。
- timer/interval/订阅在 `onHide`/`onUnload` 成对清理；清理函数必须幂等。
- storage/网络/输入法调用若涉及多条兼容路径，先做能力检测再封装进 adapter，模板里禁止堆叠 `if (apiA) else if (apiB)`。

## 5. 数据契约与校验

- 后端/mock 的宽松输入 → `services/types.ts` 的 `normalize*` 归一化为强类型；拒绝缺失关键字段（返回 null 并过滤），数值 clamp。
- 归一化是纯函数，`tests/` 必须覆盖：正常、缺字段、越界、类型错乱四类输入。

## 6. Native（C/C++）标准

- **三名一致**：`libjsapi_<plugin>.so` ⇔ `registerCModuleLoader("<plugin>", …)` ⇔ JS `import { … } from '<plugin>'`。当前模块：`mtdevice`。
- 目录约定：`native/<plugin>/{CMakeLists.txt, src/, iot-miniapp-sdk/}`；业务类（纯 OS/C++）与 JS 包壳类（`JS*`）分离，业务类可在 host 单测。
- CMake 交叉编译器只从 `CROSS_C_COMPILER`/`CROSS_CXX_COMPILER`（或 `CROSS_TOOLCHAIN_PREFIX`）环境变量读取。
- 链接目标硬约束：glibc 2.36、GLIBCXX ≤ 3.4.29（CI 中有断言，超限即失败）。
- 同步方法（`JQFunctionInfo`）禁止阻塞 IO；阻塞 IO 一律 `SetProtoMethodPromise`（`JQAsyncInfo`）；跨线程事件用 `publish`。
- 所有 JS 入参做存在性/类型/长度校验，`try/catch` 转稳定错误；禁止拼接 shell 字符串。
- 产物入库前必须通过：`file`（AArch64）、`readelf -d`（依赖集合）、`nm -D | grep custom_init_jsapis`。

## 7. 工程与版本

- Node 22 + pnpm（corepack），版本变更需同步 CI。
- 命令：`pnpm test`（node:test + tsx）→ `pnpm typecheck` → `pnpm build`（AMR）。
- 版本号来源：`package.json` 的 `version` 与 `miniapp.app.json`/AMR 同步递增；发布产物记录 SHA-256 并附在 PR/Release 描述。
- commit 规范：`feat:|fix:|docs:|ci:|refactor:|test:` 前缀；appid、token、设备私密标识不入库。
- `GITHUB_TOKEN`（read:packages）是 `pnpm install` 的前置条件（@penosext 私有包）。

## 8. 真机验收基线

每版发布前在目标设备完成（结果记入 profile 的 `validation`）：

1. 首次安装 + 覆盖安装均 `ret: 0`；显式 `miniapp_cli start <appid> --index` 冷启动。
2. 首页/分类页两次进出：无残留 timer、无内存单调增长（`miniapp_cli memoryUsageGC` 对比）。
3. `miniapp_cli capture` 截图与探针页预期一致（vh/vw 验收门）。
4. 禁止用整机重启掩盖生命周期问题。
