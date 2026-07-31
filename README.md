# Atmoos

Atmoos 的个人网站，使用 [Astro](https://astro.build/) 构建。

网站用于整理和发布真实的个人内容，目前首先收录 Timefold Solver
学习笔记；CV 内容会在后续补充。

## 本地开发

```sh
npm ci
npm run dev
```

生产构建：

```sh
npm run build
```

## 同步 Timefold 笔记

```sh
node scripts/import-timefold.mjs "/absolute/path/to/TimeFold"
```

导入器会重建公开目录、转换 Obsidian 站内链接，并移除内部笔记回链。

代码推送到 GitHub 后，由 Vercel 自动构建并更新网站。
