# Atmoos

Ami 的个人网站，使用 [Astro](https://astro.build/) 构建，保留纸张质感的简约界面。

右上角导航提供三个内容入口：

- `/`：个人 CV，展示已有的个人资料、关注方向和公开项目。
- `/blog`：左侧发布日历，右侧博客与散文时间轴，最新文章在上；点击带小点的日期筛选当天文章。
- `/tutorials`：左侧教程与章节导航、中间笔记正文、右侧文章目录；默认打开数据结构第一篇。两侧可独立收起释放正文空间，切换笔记保留当前会话的收起状态；窄屏默认折叠为正文上方的入口。
- `/blog/文章路径`：文章正文；`/blog/rss.xml` 提供 RSS 摘要订阅。
- `/tutorials/笔记路径`：笔记正文；页尾可在同一系列内切换章节。

旧 `/cv`、`/docs`、`/essays` 及文章地址会永久跳转到对应的新地址；已下架的文章不再提供正文。

## 本地开发

```sh
npm ci
npm run dev
```

生产构建（包含类型检查）：

```sh
npm run build
```

开发启动和生产构建会先刷新 Astro 内容缓存，确保删除文章、清空栏目或修改 Markdown 配置后不会保留旧内容。

## 发布博客

博客仅发布 `src/content/blog/` 中的文章，文章路径由相对文件名生成。

Timefold 的 49 篇笔记已移到 `archive/timefold/` 留存，不参与内容加载、正文路由、标签、RSS 或 sitemap。当前博客为空，新文章发布后会自动显示时间轴和标签筛选。

在 `src/content/blog/` 新增 Markdown 文件，例如 `first-note.md`：

```md
---
title: '文章标题'
description: '简短介绍'
publishDate: '2026-10-05'
tags: ['学习']
draft: false
---

正文。
```

`publishDate` 为发布日期；`updatedDate` 可选，用于正文中的更新日期，不影响时间轴排序。
日期按上海时区显示。`draft: true` 的文章不会出现在列表、标签、RSS 或正文路由中。
日期（`?date=YYYY-MM-DD`）和标签（`?tag=标签`）可组合筛选，均由服务端处理，不依赖浏览器 JavaScript。
`?month=YYYY-MM` 只改变日历正在查看的月份，不会悄悄清空已选日期。小点统计当天所有公开文章，草稿不计入。
日历默认显示最新文章所在月，无文章时显示当前月；可以翻月、回到本月或清除日期。

## 发布教程与笔记

在 `src/content/tutorials/` 新增 Markdown 或 MDX 文件，例如 `example/01-introduction.md`，对应 `/tutorials/example/01-introduction`：

```md
---
title: '第一节：介绍'
description: '这一节会学习什么。'
publishDate: '2026-10-05'
series: '系列名称'
course: 'data-structures'
chapter: '绪论'
chapterOrder: 0
order: 1
tags: ['学习']
draft: true
---

## 开始之前

正文。
```

准备公开时把 `draft` 改成 `false`。`course` 是教程栏目的稳定英文标识，`series` 是显示名称。栏目内先按 `chapterOrder` 排章节，再按 `order` 排笔记。当前章节自动展开，展开其他章节会收起前一个。草稿不会生成公开页面，也不会出现在标签、章节导航或 sitemap 中。

栏目由 `src/data/tutorials.ts` 的 `getCourses` 统一管理；新增内容中的 `course` 也会自动加入。操作系统、计算机网络、计算机组成原理目前显示待整理，没有虚构内容。

### Obsidian 展示笔记

已收录数据结构的绪论 2 篇、线性表 5 篇、关联知识卡片 5 篇。源笔记保持不变，导入清单与暂未收录的关联页面见 [导入记录](docs/data-structures-import.md)。

需要重新导入这一批内容时，指定笔记库路径和网站收录日期：

```sh
node scripts/import-data-structures.mjs --vault /path/to/Study --publish-date 2026-10-06
```

脚本仅导入清单内的笔记，覆盖对应网站副本，不遍历教材、其他学科或个人工作目录。`sourceUpdated` 保留源笔记更新时间。站内双链会转换成网页链接；尚未收录的引用保留显示文字。两张 Excalidraw 图导出为 SVG，原始文字、布局、颜色和箭头保留，线条使用平滑绘制。

## 正文书写与阅读

博客与教程共用阅读页，支持：

- 二至四级标题自动生成可折叠目录、标题锚点。
- Markdown 列表、引用、任务清单、脚注、表格和 MDX 内容。
- 代码高亮、复制反馈、长代码展开；关闭 JavaScript 时仍完整显示代码。
- 图片自适应与点击放大；键盘 Enter 打开，Escape 关闭。
- 行内和块级数学公式（KaTeX 本地样式与字体）。
- Obsidian 提示块和可折叠提示；多页示例转换为可折叠段落。
- Mermaid 流程图按需加载并渲染，保留可查看的源码；无 JavaScript 时仍可读源码。
- 手机端表格、代码和长公式在块内滚动；返回列表、回到顶部、前后篇导航。

日历的时区、闰年、月边界及筛选参数检查：`node --experimental-strip-types --test tests/calendar.test.mjs`。

代码围栏可写语言和文件名，例如 `ts title="example.ts"`。正文图片使用标准 Markdown 语法，可引用相对于文章的本地图片，或 `public/` 下的绝对路径，例如 `![图片说明](/images/example.png)`。图片说明也会用于大图预览。

可选头图写在 frontmatter 中，路径相对于 Markdown 文件，例如：

```yaml
heroImage:
  src: '../../assets/cover.png'
  alt: '头图说明'
```

文章之间请使用站内页面地址，例如 `[下一节](/tutorials/example/02-next)`，不使用源文件的 `.md` 地址或 Obsidian 双链。行内公式用 `$a^2+b^2=c^2$`，独立公式用两行 `$$` 包住公式。

## 留存的 Timefold 导入工具

```sh
node scripts/import-timefold.mjs "/absolute/path/to/TimeFold"
```

导入器现在重建 `archive/timefold/`，不会自动发布到博客。归档中的原有 `/blog/timefold/` 链接仅用于保留笔记之间的对应关系，网站不再提供这些页面。

## CV 排版参考

- [Bartosz Jarocki 的 CV](https://cv.jarocki.me/)：紧凑的姓名、简介和项目层级。
- [Lee Robinson 的个人站](https://leerob.com/)：以文字和少量链接组织个人内容。

保留原有纸张色调，仅使用已确认的个人资料。CV 已预留工作 / 实习经历、教育经历和技术能力栏目，待本人补充具体内容；编辑入口为 `src/pages/index.astro`。

代码推送到 GitHub 后，由现有 Vercel 流程构建并更新网站。
