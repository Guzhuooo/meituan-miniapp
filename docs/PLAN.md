# 总计划（PLAN）与进度

路线图的执行状态记录在本文件。验收门未过的阶段不得标记完成。

## 已确认决策

| 决策 | 结论 |
| --- | --- |
| 数据来源 | mock 优先（GitHub 无稳定可用美团接口；逆向 mtgsig 不采用），service 层可替换真实后端 |
| v0.1 范围 | 首页 feed + 分类导航 |
| Native v1 | CI 交叉编译管线 + `mtdevice` 示例模块 |
| 仓库 | 新建公开仓库，`F:\美团` 为源 |
| 样式单位 | 全部 vh/vw（标准见 STANDARDS §2，验收门在 Phase 3） |

## Phase 状态

### Phase 0 — 设备 profile ✅
- 只读 adb 探测完成：RK3562 / aarch64 / Buildroot 2021.11 / glibc 2.36 / GLIBCXX 3.4.29 / Falcon 4.9.7 / 屏幕 936×280@270。
- 产物：`profiles/youdao-rk3562-y02.yaml`。

### Phase 1 — 项目骨架 ✅
- 模板（penosext/miniapp-app-template 结构）落地：pnpm + Vue 3 + falcon-ui + `@penosext` 能力包。
- 目录：`src/{pages,components,services,mocks}`、`native/`、`profiles/`、`docs/`、`.github/workflows/`。

### Phase 2 — 标准与计划 ✅
- `docs/STANDARDS.md`（vh/vw 标准、分层、native 三名一致、CI 门禁）。
- 本文件。

### Phase 3 — 工具链跑通 + vh/vw 探针 ⏳ 代码就绪，待执行
- [x] 探针页 `src/pages/probe/probe.vue`（四角/中心/scroller/触控映射）。
- [ ] 本机 `pnpm install`（**需要用户提供 read:packages 的 GITHUB_TOKEN**）。
- [ ] `pnpm test` / `typecheck` / `build` 全绿。
- [ ] 模拟器 + 真机探针页验证，结论回写 profile（vh/vw 验收门）。

### Phase 4 — 美团 v0.1 ⏳ 代码就绪，待真机验收
- [x] 数据契约 + 归一化（`services/types.ts`）+ mock 服务（`merchantService.ts`）。
- [x] mock 数据（8 分类 / 12 商家，虚构）。
- [x] 组件：MtSearchBar / MtBanner / MtCategoryGrid / MtMerchantCard / MtMerchantList（分批渲染）。
- [x] 页面：首页 feed（轮播 + 分类筛选 + 商家列表）、分类页。
- [x] 纯逻辑测试 `tests/merchants.test.ts`。
- [ ] 真机：安装、两次进出、内存对比、截图证据。

### Phase 5 — Native CI 管线 ⏳ 代码就绪，待 CI 验证
- [x] `native/mtdevice`：DeviceModule（arch/page/cpus 同步 + meminfo Promise），三名一致。
- [x] `build-native.yml`：aarch64 交叉编译 + ELF/GLIBCXX 断言 + artifact。
- [x] `build-app.yml`：test/typecheck 门禁 + native artifact 进包 + AMR 校验 + SHA-256。
- [ ] 首次 push GitHub 后跑绿；真机 `.so` 加载 6 步验收。

### Phase 6 — 打包安装与真机验收 ⏳ 待 CI + 设备联调
- [ ] CI 产物 AMR → `adb push` → `miniapp_cli install` → 显式启动页冷启动。
- [ ] 验证矩阵执行（两次进出 / 输入法路径 / 异常恢复），证据绑 profile。

## 待用户提供

1. **GITHUB_TOKEN**（read:packages）— 本机 `pnpm install` 与 CI 拉取 `@penosext/*` 包都依赖它；CI 用内置 `secrets.GITHUB_TOKEN` 需在仓库 Settings → Actions 勾选允许访问私有包（或给仓库加一个 PAT secret）。
2. **公开仓库地址** — 远端创建后 `git remote add origin <url> && git push`。
3. **appid** — 当前占位 `0000000000000000`（`package.json` 与 `miniapp.app.json` 两处需同步改）；确认平台分配规则后更新。

## 后续版本草案

- v0.2：商家详情页 + 系统输入法搜索（两条 IM 路径真机验证）。
- v0.3：购物车 + storage（sqlite 能力包）持久化、订单列表。
- v0.4：真实/自建后端接入（仅替换 `merchantService` 数据源）+ 图片资源加载。
- v1.0：按 STANDARDS §8 完整验证矩阵 + 发布流程固化。
