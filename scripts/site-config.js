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
        catalogBaseUrl: `https://gitee.com/${ORG}/canbox-catalog-data/raw/main`,
        catalogSnapshotPath: './data/catalog-snapshot',
        siteRoot: '/canbox-pages/',
        external: {
            homepage: `https://gitee.com/${ORG}/canbox-pages`,
            managerRelease: `https://gitee.com/${ORG}/canbox-manager/releases`,
            // 下载链接按 OS 平台隔离（方案 A）：
            // canbox-manager 有 2 个平台产物，而项目级 files/latest/download 只指向
            // 「整个项目最近上传的那 1 个文件」，无法同时服务两平台 →
            // 必须用「平台子目录 + 固定文件名直链」。
            // 产物文件名经核实不含版本号（见 canbox-manager/scripts/build-linux.sh、
            // .github/workflows/release.yml 的 artifact 校验），故链接永久稳定。
            managerDownload: {
                // canbox-manager 有 2 个平台产物，文件名固定 → 各自固定直链即可。
                // 物理目录不分层（用户偏好：文件名本身就是路径，不需要 linux/、windows/ 子目录分组）。
                // 项目级 files/latest/download 仍不可用——只指向"最近上传的那 1 个文件"。
                linux: `https://sourceforge.net/projects/canbox-manager/files/Canbox-linux-x86_64.sh/download`,
                windows: `https://sourceforge.net/projects/canbox-manager/files/Canbox-Setup-x86_64.exe/download`
            },
            developerRepo: `https://gitee.com/${ORG}/canbox-developer`,
            developerRelease: `https://gitee.com/${ORG}/canbox-developer/releases`,
            // canbox-developer 只有 1 个跨平台产物（app.asar 平台无关 zip，依赖全为纯 JS，无原生模块），
            // 且其文件名含版本号 → 无法用固定文件名直链，改用项目级 latest。
            // 单产物项目下 latest 语义唯一（只可能指向那个 zip），故此处 latest 是可靠的。
            developerDownload: `https://sourceforge.net/projects/canbox-developer/files/latest/download`,
            // Gitee 无 topic 聚合页（/explore/<topic> 实测 405），改用可用的站内检索
            topicGuide: `https://gitee.com/search?q=canbox-app`
        }
    } : {
        platform: 'github',
        catalogDataMode: 'remote',
        catalogBaseUrl: `https://raw.githubusercontent.com/${ORG}/canbox-catalog-data/main`,
        catalogSnapshotPath: './data/catalog-snapshot',
        siteRoot: '/',
        external: {
            homepage: `https://github.com/${ORG}/canbox-pages`,
            managerRelease: `https://github.com/${ORG}/canbox-manager/releases`,
            // 与 Gitee 分支同构：按 OS 平台隔离。
            // canbox-manager 两个平台的产物文件名都不含版本号，故可用
            // releases/latest/download/<固定文件名> 直链（唯一性由文件名保证）。
            // ※ 改造前此处是两个平台共用 releases 页，此处属有意变更；
            //   如需回退，把下面两个值都改成 `https://github.com/${ORG}/canbox-manager/releases`。
            managerDownload: {
                linux: `https://github.com/${ORG}/canbox-manager/releases/latest/download/Canbox-linux-x86_64.sh`,
                windows: `https://github.com/${ORG}/canbox-manager/releases/latest/download/Canbox-Setup-x86_64.exe`
            },
            developerRepo: `https://github.com/${ORG}/canbox-developer`,
            developerRelease: `https://github.com/${ORG}/canbox-developer/releases`,
            // 单跨平台产物且文件名含版本号 → 无法固定文件名，且 GitHub 无「单产物 latest 附件」别名，
            // 故 GitHub 端保持 releases 页（与改造前一致）。
            developerDownload: `https://github.com/${ORG}/canbox-developer/releases`,
            topicGuide: `https://github.com/search?q=topic%3Acanbox-app&type=repositories`
        }
    };
})();