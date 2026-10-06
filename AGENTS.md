# 懂了 · 技术黑话翻译器

- **状态:** 验证阶段;已迁移到 React + TypeScript + Vite 工程
- **技术栈:** React 18 · TypeScript · Vite · 纯 CSS 设计系统 · GitHub Pages(gh-pages 分支)
- **主入口:** `index.html`(Vite 模板)→ `src/main.tsx` → `src/App.tsx`
- **内容主源:** `src/data/levels.ts`(47 词)· `src/data/icons.ts`(内联 SVG)
- **在线体验(公开):** https://cancanhhhhh.github.io/dongle-tech-slang/
- **仓库:** https://github.com/CanCanHHHHH/dongle-tech-slang(公开)
- **最近更新:** 2026-10-06 — 从单文件 HTML 迁移到 React+TS+Vite,组件化(Home/Deck/Sheets)+ 类型系统 + CI 自动部署;功能不变:十一关 47 词、闯关/词典/复习三模式、错词本、成就系统

## 文档导航
- `docs/PRD.md` —— 完整需求蓝图(愿景/用户/范围/功能/技术/指标/风险/路线图)
- `docs/内容骨架.md` —— 分级词表 + 每张卡的生产脚本(内容主源)
- `docs/类比校对自查.md` —— 5 个高风险类比的自查与更严谨说法(给校对人的清单)
- `docs/验收报告.md` —— PM 验收走查结果(P0 逐条实测 + 缺陷与处理)
- `docs/UX走查报告.md` —— 用户体验启发式走查(第一次用户视角 + ADHD 专项)
- `docs/路人测试与综合优化.md` —— 路人视角测试 + 四方意见汇总与 V9 优化记录

## 修改约定
- 内容(词/类比/题)改 `src/data/levels.ts`(现为内容主源),同步更新 `docs/内容骨架.md`。
- 加新图标:往 `src/data/icons.ts` 加 `key: '<svg…>'`,卡片 `art` 字段引用该 key。
- 部署:`npm run build` 后把 `dist/` 推到 `gh-pages` 分支(Pages 源指向该分支)。
- (可选 CI)如需推送 `.github/workflows/`,先 `gh auth refresh -s workflow` 授予 workflow 权限,再用 Actions 自动部署。

## 验证方式
- 本地:`npm install && npm run dev`,走通闯关/复习/查词、答错入错词本、刷新进度保留、深浅色切换。
- 构建:`npm run build` 应无 TS 报错;`npm run preview` 预览产物。
