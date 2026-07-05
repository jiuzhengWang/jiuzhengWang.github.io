# PKU Slidev Template

这是一个北京大学风格的 Slidev starter。术语上，根目录是“模板仓库 / starter”，`theme/` 目录是可复用的 Slidev theme；如果以后要发布到 npm，可以把 `theme/` 独立成 `slidev-theme-pku`。

## 使用

```bash
npm install
npm run dev
```

日常只改 `slides.md`。Slidev 使用 `---` 分页，单页样式用 frontmatter 指定：

```md
---
layout: section
---

# Q1: 为什么要学操作系统？
```

常用约定：

- `<red>重点</red>`：北大红强调
- `<VClicks>...</VClicks>`：逐步出现
- `<BrandImage src="brand/pku-emblem-red.png" />`：需要时插入品牌图片，默认示例只在封面使用
- `---`：水平分页
- `----`：JYY/Reveal 风格垂直分页，会被主题预处理为 Slidev 页面
- `layout: section`：章节页
- `layout: center`：居中页
- `layout: image-right`：右图左文页

默认右下角有三个导航按钮：上一水平页、下一垂直页、下一水平页。

## 品牌资源

`public/brand/` 中的 PNG 来自北京大学标识管理办公室“下载专区”公开资源：

- `pku-emblem-red.png`
- `pku-emblem-white.png`
- `pku-lockup-horizontal.png`

主题色使用 VI 规范中的标准色“北大红”：`#94070A`。正式公开发布前，请阅读资源页中的《北大标识使用基本操作规范》和《北大标识常见误用情况》。

更详细的使用提醒见 `BRAND.md`。

## 维护建议

- 先把课程内容写在 `slides.md`，不要在页面里到处写内联 CSS。
- 视觉调整优先改 `theme/styles/`，布局结构优先改 `theme/layouts/`。
- 依赖固定在 `@slidev/cli@52.16.0`；升级 Slidev 时运行 `npm run build` 检查主题兼容性。
- 如果发布为 npm 主题，包名遵循 Slidev 约定：`slidev-theme-*`，并保留 `slidev-theme` 和 `slidev` keywords。

## 参考

- Slidev Writing Themes: https://sli.dev/guide/write-theme
- Slidev Theme and Addons: https://sli.dev/guide/theme-addon
- 北京大学标识管理办公室下载专区: https://vim.pku.edu.cn/xzzq/index.htm
