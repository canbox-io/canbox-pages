// scripts/build-snapshot.mjs —— 同站快照降级构建脚本
//
// 背景：Gitee raw（https://gitee.com/<owner>/<repo>/raw/<branch>/<path>）不返回
// Access-Control-Allow-Origin，浏览器无法跨域直取 catalog 数据。Gitee Pages 站点
// 因此改用同源快照：本脚本在 Node 环境（无 CORS 限制）抓取 catalog.json 与全部分片，
// 落到站点本地 data/catalog-snapshot/，页面按站点相对路径读取。
//
// 用法：
//   node scripts/build-snapshot.mjs                    # 默认抓 Gitee 实例
//   node scripts/build-snapshot.mjs --base=<url>       # 指定 catalog 数据根地址
//   node scripts/build-snapshot.mjs --out=<dir>        # 指定输出目录
//
// 快照属低频人工刷新产物：Gitee 实例数据更新后重新执行本脚本并提交即可。

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const DEFAULT_BASE = 'https://raw.githubusercontent.com/canbox-io/canbox-catalog-data/main';
const DEFAULT_OUT = path.join(REPO_ROOT, 'data', 'catalog-snapshot');

function getArgValue(name, defaultValue = null) {
    const argv = process.argv.slice(2);
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === `--${name}` && argv[i + 1] !== undefined) return argv[i + 1];
        if (arg.startsWith(`--${name}=`)) return arg.slice(name.length + 3);
    }
    return defaultValue;
}

async function fetchJson(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} for ${url}`);
    }
    return resp.json();
}

async function main() {
    const baseUrl = (getArgValue('base', DEFAULT_BASE) || DEFAULT_BASE).replace(/\/$/, '');
    const outDir = getArgValue('out', DEFAULT_OUT);

    console.log(`[snapshot] Source: ${baseUrl}`);
    console.log(`[snapshot] Output: ${outDir}`);

    const index = await fetchJson(`${baseUrl}/catalog.json`);
    const shards = Array.isArray(index.shards) ? index.shards : [];
    if (shards.length === 0) {
        console.warn('[snapshot] WARNING: catalog.json has no shards, snapshot will be empty.');
    }

    await fs.rm(outDir, { recursive: true, force: true });
    await fs.mkdir(path.join(outDir, 'catalogs'), { recursive: true });

    let totalApps = 0;
    for (const shard of shards) {
        const shardData = await fetchJson(`${baseUrl}/${shard.file}`);
        const fileName = path.basename(shard.file);
        await fs.writeFile(
            path.join(outDir, 'catalogs', fileName),
            JSON.stringify(shardData, null, 2) + '\n',
            'utf-8'
        );
        totalApps += (shardData.apps || []).length;
        console.log(`[snapshot] Written catalogs/${fileName} with ${(shardData.apps || []).length} apps`);
    }

    // 索引保留原字段，分片路径统一为站点相对结构 catalogs/shard-XXX.json
    const snapshotIndex = {
        ...index,
        snapshot: {
            source: baseUrl,
            generatedAt: new Date().toISOString()
        }
    };
    await fs.writeFile(path.join(outDir, 'catalog.json'), JSON.stringify(snapshotIndex, null, 2) + '\n', 'utf-8');

    console.log(`[snapshot] Done. ${totalApps} apps in ${shards.length} shards.`);
}

main().catch(err => {
    console.error('[snapshot] Fatal error:', err);
    process.exit(1);
});