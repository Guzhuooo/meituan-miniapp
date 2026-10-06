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

### Phase 3 — 工具链跑通 + vh/vw 探针 ✅ 真机验证通过
- [x] 探针页 `src/pages/probe/probe.vue`（四角/中心/scroller）。
- [x] `pnpm install` / `pnpm test`（9/9）/ `typecheck` / `pnpm build` 全绿；AMR 产物正常。
- [x] 语言约束实测：SFC 与运行时模块必须纯 JS 可解析（STANDARDS §3.1），services 已改 JS+JSDoc。
- [x] Windows 构建兼容补丁：`patches/`（falcon-module 绝对路径误判修复；pnpm patchedDependencies 自动应用）。
- [x] 应用图标：黄色圆角 + 袋鼠 + 美团字样（MIT 素材合成，120×120）。
- [x] **真机探针页验证**：四角/中心/scroller 全部渲染正确，vh/vw 直映射物理像素（evidence/2026-10-06-probe-vhvw.png）。
- [x] **真机启动契约修复**：App 必须导出 class（not a constructor 根因）；页面 hooks 必须放 methods（数据加载根因）——详见 STANDARDS §3.2。
- [ ] 模拟器行为记录（可选项，留待后续）。

### Phase 4 — 美团 v0.1 ✅ 真机渲染通过，待交互细节
- [x] 数据契约 + 归一化（`services/types.js`）+ mock 服务（`merchantService.js`）。
- [x] mock 数据（8 分类 / 12 商家，虚构）。
- [x] 组件：MtSearchBar / MtBanner / MtCategoryGrid / MtMerchantCard / MtMerchantList（分批渲染）。
- [x] 页面：首页 feed（轮播 + 分类筛选 + 商家列表）、分类页。
- [x] 纯逻辑测试 `tests/merchants.test.ts` + `tests/app-entry.test.ts`（9/9）。
- [x] **真机**：安装（ret:0）、首页 8 分类+商家卡片+banner 轮播渲染（evidence/2026-10-06-index.png）、分类页渲染（2026-10-06-category.png）。
- [x] **资源回收**：3 轮进出后 QuickJS 对象数恒定 106926（非泄漏量级）。
- [ ] 触控点击交互注入测试（待方案）；分类页数据加载为 spec 内简化（直接渲染）已复核。

### Phase 5 — Native CI 管线 ⏳ 代码就绪，待 CI 验证
- [x] `native/mtdevice`：DeviceModule（arch/page/cpus 同步 + meminfo Promise），三名一致。
- [x] `build-native.yml`：aarch64 交叉编译 + ELF/GLIBCXX 断言 + artifact。
- [x] `build-app.yml`：test/typecheck 门禁 + native artifact 进包 + AMR 校验 + SHA-256。
- [ ] 首次 push GitHub 后跑绿；真机 `.so` 加载 6 步验收。

### Phase 6 — 打包安装与真机验收 ⏳ 本机链路完成，待 CI 产物复核
- [x] 本机构建 AMR → `adb push` → `miniapp_cli install`（ret:0）→ `miniapp_cli start {appId} {page}` 冷启动。
- [x] 验证矩阵（本机部分）：两次+ 进出 / 内存对比 / 截图证据绑 profile。
- [ ] CI 产物 AMR 复核（等 GitHub push 后）；输入法路径 / 异常恢复留待 v0.2 输入法接入时执行。
- [ ] 覆盖安装与 versionCode 递增验证。

## 待用户提供

1. ~~GITHUB_TOKEN~~ 已解决：gh CLI 登录（Guzhuooo），已 `gh auth refresh -s read:packages`；本机安装用 `GITHUB_TOKEN=$(gh auth token)`。
2. **GitHub 连通性** — 本机 hosts 将 GitHub 域名指向 127.0.0.1（加速器工具未运行）：需开启加速器后 `gh repo create` + push。
3. **appid** — 当前占位 `0000000000000000`（`package.json` 与 `miniapp.app.json` 两处需同步改）；确认平台分配规则后更新。

## 后续版本草案

- v0.2：商家详情页 + 系统输入法搜索（两条 IM 路径真机验证）。
- v0.3：购物车 + storage（sqlite 能力包）持久化、订单列表。
- v0.4：真实/自建后端接入（仅替换 `merchantService` 数据源）+ 图片资源加载。
- v1.0：按 STANDARDS §8 完整验证矩阵 + 发布流程固化。
