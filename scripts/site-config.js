// scripts/site-config.js —— 站点所有"平台相关链接/数据源"的唯一来源
// 站点其余文件（HTML/JS）一律从 window.SITE_CONFIG 取值，不得内联平台硬编码。
(function() {
    const ORG = 'canbox-io';

    window.SITE_CONFIG = {
        platform: 'github',
        catalogDataMode: 'remote',
        catalogBaseUrl: `https://raw.githubusercontent.com/${ORG}/canbox-catalog-data/main`,
        catalogSnapshotPath: './data/catalog-snapshot',
        siteRoot: '/',
        external: {
            homepage: `https://github.com/${ORG}/canbox-pages`,
            managerRelease: `https://github.com/${ORG}/canbox-manager/releases`,
            managerDownload: {
                linux: `https://github.com/${ORG}/canbox-manager/releases/latest/download/Canbox-linux-x86_64.sh`,
                windows: `https://github.com/${ORG}/canbox-manager/releases/latest/download/Canbox-Setup-x86_64.exe`
            },
            developerRepo: `https://github.com/${ORG}/canbox-developer`,
            developerRelease: `https://github.com/${ORG}/canbox-developer/releases`,
            developerDownload: `https://github.com/${ORG}/canbox-developer/releases`,
            topicGuide: `https://github.com/search?q=topic%3Acanbox-app&type=repositories`
        }
    };
})();