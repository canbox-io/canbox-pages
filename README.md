# Canbox Pages

Canbox 项目的 static website, hosted on GitHub Pages.

---

## Project Note

Both Canbox and Canbox Pages are created by a self-taught developer (learned frontend development independently). While the basic functionality is implemented, there is still room for improvement in many areas.

Welcome to join and help improve this project:

- ✅ Submit PRs to improve website design and interactions
- ✅ Enhance documentation content
- ✅ Fix typos and errors
- ✅ Submit your apps to the App Center

## About Canbox

Canbox is a lightweight application runtime platform that provides minimal core capabilities, allowing developers to focus on implementing their own application logic.

**Key Features:**
- **App Management**: Supports installation, uninstallation, and updates of applications
- **WebApp Creation**: Turn any URL into a desktop app with auto site info scraping, navigation controls, and alias system
- **App Import & Export**: Import offline app packages, export installed apps for sharing
- **Shortcuts**: Create desktop and start menu shortcuts with alias support
- **Auto Update**: Automatic update checking with GitHub, configurable check frequency
- **Customization**: Configurable language, font, data path, and window zoom (0.5x ~ 2.0x)
- **Log Viewer**: Built-in log viewer with real-time monitoring, filtering, search, and export
- **File Task Management**: Unified task management for download, import, export, and other file operations
- **Multi-platform Support**: Based on Electron, supports Linux, Windows, and macOS

---

## Tech Stack

- Pure HTML5 + CSS3 + JavaScript
- Responsive design with mobile support
- No build tools required, ready to use

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/canbox-io/canbox-pages.git
cd canbox-pages
```

2. Use a local server to preview (optional, recommended):

Using Python:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx serve
```

3. Open http://localhost:8000 in your browser

## Deployment

### GitHub Pages

1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select default branch (main/master)
4. Visit https://yourusername.github.io/canbox-pages/

## Directory Structure

```
canbox-pages/
├── index.html          # Homepage
├── apps.html          # App center
├── docs.html          # Documentation
├── app-dev.html       # App development guide
├── canbox-dev.html   # Canbox development guide
├── data/              # Data files
│   ├── apps.js
│   ├── categories.js
│   └── apps-authors/  # App author information
├── images/            # Image resources
│   ├── logo.png
│   ├── logo_128x128.png
│   ├── logo_256x256.png
│   └── logo_512x512.png
├── styles/            # Style files
│   ├── main.css
│   ├── apps.css
│   └── docs.css
├── scripts/           # Script files
│   ├── main.js
│   ├── apps-main.js
│   └── docs.js
└── README.md
```

## Customization

- Update links: Modify GitHub links in `index.html`
- Modify styles: Customize colors and layout in `styles/main.css`
- Add images: Place images in the `images/` directory

## License

Apache 2.0
