# blog

个人网站。React 19 + TypeScript + Vite + Tailwind CSS v4，按「可长期迭代的复杂前端项目」搭的骨架。

配色沿用终末地：炭黑 `#1C1C1C` + 强调黄 `#FFFA00`。

## 技术栈

| 领域 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | React 19 | 函数组件 + Hooks，`StrictMode` 开启 |
| 语言 | TypeScript 5.9 | `strict`、`noUnusedLocals`、`verbatimModuleSyntax` |
| 构建 | Vite 8 | 原生 ESM，秒级 HMR |
| 样式 | Tailwind CSS v4 | `@theme` 设计令牌 + 原子类，复杂选择器放 `@layer components` |
| 路由 | React Router 7 | `BrowserRouter` |
| 动画 | GSAP + 自研曲线 | 入场编排用 GSAP，页面切换由 `src/lib/transition.ts` 的滚动曲线驱动 |
| 规范 | ESLint 10 + Prettier | 扁平配置，`prettier` 规则关闭冲突项 |

## 目录结构

```
src/
├─ main.tsx                   应用入口，挂载到 #root
├─ App.tsx                    浏览器路由 + 自定义光标
├─ index.css                  设计令牌 / 基础层 / 组件层
├─ assets/                    参与构建的图片（会被哈希、内联优化）
├─ components/
│  ├─ Icon.tsx                Simple Icons 渲染器
│  ├─ MaskIcon.tsx            位图图标（mask 剪影着色）
│  ├─ NavBar.tsx              顶部导航
│  ├─ PageStage.tsx           换页舞台：双槽位 + 幕布 + 巨型标题
│  ├─ PageReveal.tsx          单页入场编排（GSAP）
│  ├─ KineticLabel.tsx        过渡时的巨型字母层
│  └─ tile/                   铭牌：静态字标 + 旋转文字环
├─ data/                      站点内容（projects / platforms / socials / site）
├─ hooks/
│  ├─ useCursor.ts            跟随鼠标的差值混合光标
│  └─ useScrollTransition.ts  滚动驱动的换页状态机
├─ lib/
│  ├─ transition.ts           换页曲线与可调常量
│  ├─ motionCurve.ts          分段插值曲线
│  ├─ pageItems.ts            入场元素的选择与可用性判定
│  ├─ pageOrder.ts            路由顺序与过渡标题
│  ├─ iconPaths.ts            Simple Icons 路径数据
│  └─ ringConfig.ts           铭牌圆环配置
├─ pages/                     三个路由页面
└─ types/                     领域类型

public/                       原样拷贝到产物根目录（favicon、og 图）
```

## 常用命令

```bash
npm run dev        # 本地开发，默认 http://localhost:5173
npm run build      # 类型检查 + 生产构建，产物在 dist/
npm run preview    # 本地预览构建产物
npm run typecheck  # 只做类型检查
npm run lint       # ESLint
npm run format     # Prettier 格式化
```

## 设计令牌

全部集中在 `src/index.css` 的 `@theme` 里，Tailwind 会据此生成工具类：

```css
@theme {
  --color-ink: #1c1c1c; /* bg-ink / text-ink / fill-ink … */
  --color-accent: #fffa00;
  --color-fg: #f2f2f2;
  --color-muted: #8a8a8a;
  --font-display: 'Jost', …;
}
```

改主题色只需动这里；`@layer components` 里只保留了两处工具类不好表达的规则：圆环双段旋转 `.tile-spin`、SVG 悬停 `.ring-word`。

## 改内容的位置

| 想改什么 | 去哪个文件 |
| --- | --- |
| 头像、GitHub 地址 | `src/data/site.ts` |
| 项目色带（名称 / logo / 底色 / 链接） | `src/data/projects.ts` |
| 联系页联系方式 | `src/data/platforms.ts` |
| 首页社交图标 | `src/data/socials.ts` |
| 圆环上的文字 | `src/lib/ringConfig.ts` 的 `ringConfig` |

圆环上共 `words.length * 2 + 1` 段，顺时针均分 360°，`name` 单独占据正上方那一段。文字太长会和相邻段挤在一起，此时调小 `wordSize` / `nameSize`。

## 页面过渡

滚动不能一上来就翻页，所以中间隔了一段缓冲（见 `src/lib/transition.ts`）：

| 常量 | 作用 |
| --- | --- |
| `ARM_TRAVEL` | 缓冲行程，滚过它才开始移动页面 |
| `SPAN_TRAVEL` | 起步之后走完整条曲线的行程 |
| `SMOOTH_TAU` | 画面追赶进度的平滑系数，越小越跟手 |
| `IDLE_RESET` | 缓冲阶段静止多久就清零行程 |

曲线本体在 `src/lib/motionCurve.ts`：给一组控制点得到分段贝塞尔式的插值轨道，`transition.ts` 用它描述旧页、新页、幕布、巨型字母各自的位移 / 缩放 / 透明度。

## 部署

`npm run build` 产出 `dist/`，把这个目录整个丢到静态托管即可。

`vite.config.ts` 里 `base: './'` 用的是相对路径，因此部署到子目录（如 `example.com/blog/`）也不用改配置。路由是 history 模式，直接访问 `/projects` 这类子路径需要托管侧配置 fallback rewrite（把未命中的路径回落到 `index.html`），否则刷新会 404。

构建产物里已经备好这两份兜底配置，按托管平台取用即可：

| 文件 | 适用平台 | 作用 |
| --- | --- | --- |
| `_redirects`（来自 `public/`） | Netlify、Cloudflare Pages | `/* /index.html 200`，未命中路径回落到 SPA 首页 |
| `404.html`（由 `vite.config.ts` 的 `emit404` 插件从 `index.html` 复制） | GitHub Pages 等不支持 rewrite 的平台 | 直接用它作为未命中路径的响应页，内容与首页一致，由前端路由渲染 404 |

两者选一个即可，不需要同时配置。
