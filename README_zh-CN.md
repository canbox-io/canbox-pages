# Canbox Pages

Canbox 项目的静态网站，托管在 GitHub Pages 和 Gitee Pages。

---

## 🚧 项目说明

Canbox 和 Canbox Pages 都是由非专业出身的开发者（自学前端技术）创建的项目。虽然实现了基础功能，但仍有许多可以改进的地方。

欢迎大家一起参与进来，共同完善这个项目：

- ✅ 提交 PR 改进网站设计和交互
- ✅ 完善文档内容
- ✅ 修正错误和拼写问题
- ✅ 分享你的应用到 APP 中心

---

## 关于 Canbox

Canbox 是一个轻量级应用运行时平台，提供了最基础的功能能力，让开发者可以专注于应用本身的逻辑实现。

**核心特性：**

- **应用管理**：支持应用的安装、卸载和更新
- **创建网页应用**：将任意网址封装为桌面应用，自动抓取网站信息，支持导航控制和别名系统
- **APP 导入导出**：支持导入离线应用包，支持导出已安装应用供分享
- **快捷方式**：为常用应用创建桌面、开始菜单快捷方式，支持别名系统
- **自动更新**：支持 GitHub 和 Gitee 双源自动更新，可配置检查频率
- **个性化配置**：可配置语言、字体、数据路径，支持窗口缩放（0.5x ~ 2.0x）
- **日志查看器**：内置日志查看器，支持实时监控、过滤、搜索和导出功能
- **文件任务管理**：统一下载、导入、导出等文件操作的任务管理
- **多平台支持**：基于 Electron，支持 Linux、Windows、macOS

---

## 技术栈

- 纯 HTML5 + CSS3 + JavaScript
- 响应式设计，支持移动端
- 无需构建工具，开箱即用

## 本地开发

1. 克隆仓库：

```bash
git clone https://gitee.com/rexlevin/canbox-pages.git
cd canbox-pages
```

2. 使用本地服务器预览（可选，推荐）：

使用 Python：

```bash
python -m http.server 8000
```

使用 Node.js：

```bash
npx serve
```

3. 在浏览器中打开 http://localhost:8000

## 部署

### GitHub Pages

1. 推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择默认分支（main/master）
4. 访问 https://yourusername.github.io/canbox-pages/

### Gitee Pages

1. 推送到 Gitee 仓库
2. 在仓库设置中启用 Gitee Pages
3. 选择默认分支并更新
4. 访问 https://yourusername.gitee.io/canbox-pages/

## 目录结构

```
canbox-pages/
├── index.html          # 首页
├── apps.html          # 应用中心
├── docs.html          # 文档
├── app-dev.html       # APP 开发指南
├── canbox-dev.html   # Canbox 开发指南
├── data/              # 数据文件
│   ├── apps.js
│   ├── categories.js
│   └── apps-authors/  # APP 作者信息
├── images/            # 图片资源
│   ├── logo.png
│   ├── logo_128x128.png
│   ├── logo_256x256.png
│   └── logo_512x512.png
├── styles/            # 样式文件
│   ├── main.css
│   ├── apps.css
│   └── docs.css
├── scripts/           # 脚本文件
│   ├── main.js
│   ├── apps-main.js
│   └── docs.js
└── README.md
```

## 自定义

- 修改链接：在 `index.html` 中更新 GitHub/Gitee 链接
- 修改样式：在 `styles/main.css` 中自定义颜色和布局
- 添加图片：将图片放入 `images/` 目录

## 许可证

Apache 2.0
