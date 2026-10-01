# 百果图鉴（Fruit encyclopedia）

一个纯静态的水果介绍网站，收录 100 种常见可食用水果，每种都有中文介绍和图片。

## 使用方法
- 直接双击打开 `index.html` 即可（无需服务器，数据在 `assets/data.js` 里，不需要 fetch）。
- 也可以用任意静态服务器托管，例如：`python3 -m http.server 8000`，然后访问 http://localhost:8000/ 。

## 文件结构
- `index.html`：首页（卡片网格、搜索、按科筛选、拼音/英文首字母筛选、详情弹窗）
- `credits.html` / `CREDITS.txt`：所有图片的作者、许可证和 Commons 文件页链接
- `assets/data.js`：水果数据；`assets/app.js`：交互逻辑；`assets/style.css`：样式
- `images/`：本地图片（来自 Wikimedia Commons，已缩放）
- 详情页可直接通过链接打开，例如 `index.html#fruit=mango`

## 数据与许可
- 名称、学名、科属、果实类型、用途：Wikidata（CC0）。介绍文字根据这些数据另行编写，未复制维基百科原文。
- 图片：Wikimedia Commons，各图许可（CC BY / CC BY-SA / GFDL / 公有领域等）见 credits.html。改编（缩放）后的图片仍沿用原许可。
