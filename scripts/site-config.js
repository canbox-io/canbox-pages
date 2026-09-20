// scripts/site-config.js —— 单一来源，运行时根据 hostname 自识别部署平台
//
// 本文件是站点所有"平台相关链接/数据源"的唯一来源：
//   - GitHub Pages（canbox-io.github.io / CNAME）hostname 不含 gitee → 命中 GitHub 分支
//   - Gitee Pages（canbox-io.gitee.io/canbox-pages）hostname 含 gitee → 命中 Gitee 分支
// 站点其余文件（HTML/JS）一律从 window.SITE_CONFIG 取值，不得内联平台硬编码。
(function() {
    const host = location.hostname;
    const isGitee = host.includes('gitee.io') || host.includes('gitee.com');
    const ORG = 'canbox-io';

    window.SITE_CONFIG = isGitee ? {
        platform: 'gitee',
        // Gitee raw 不返回 Access-Control-Allow-Origin，浏览器无法跨域直取，
        // 故 Gitee 站走同站快照（由 scripts/build-snapshot.mjs 生成到 data/catalog-snapshot/）
        catalogDataMode: 'snapshot',
        catalogBaseUrl: `https://gitee.com/${ORG}/canbox-catalog/raw/main/data/gitee`,
        catalogSnapshotPath: './data/catalog-snapshot',
        siteRoot: '/canbox-pages/',
        external: {
            homepage: `https://gitee.com/${ORG}/canbox-pages`,
            managerRelease: `https://gitee.com/${ORG}/canbox-manager/releases`,
            managerDownload: `https://sourceforge.net/projects/canbox-manager/files/latest/download`,
            developerRepo: `https://gitee.com/${ORG}/canbox-developer`,
            developerRelease: `https://gitee.com/${ORG}/canbox-developer/releases`,
            developerDownload: `https://sourceforge.net/projects/canbox-developer/files/latest/download`,
            // Gitee 无 topic 聚合页（/explore/<topic> 实测 405），改用可用的站内检索
            topicGuide: `https://gitee.com/search?q=canbox-app`
        }
    } : {
        platform: 'github',
        catalogDataMode: 'remote',
        catalogBaseUrl: `https://raw.githubusercontent.com/${ORG}/canbox-catalog/main/data/github`,
        catalogSnapshotPath: './data/catalog-snapshot',
        siteRoot: '/',
        external: {
            homepage: `https://github.com/${ORG}/canbox-pages`,
            managerRelease: `https://github.com/${ORG}/canbox-manager/releases`,
            // 与改造前 index.html 的下载链接保持完全一致（GitHub 站零变化）
            managerDownload: `https://github.com/${ORG}/canbox-manager/releases`,
            developerRepo: `https://github.com/${ORG}/canbox-developer`,
            developerRelease: `https://github.com/${ORG}/canbox-developer/releases`,
            developerDownload: `https://github.com/${ORG}/canbox-developer/releases`,
            topicGuide: `https://github.com/search?q=topic%3Acanbox-app&type=repositories`
        }
    };
})();
