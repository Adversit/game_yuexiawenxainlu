# 月下问仙录

[在线游玩](https://moonlit-immortal-chronicle.dingikang.chatgpt.site/) · 文字修仙模拟器

选择出身与先天气运，在山海奇遇中修炼、拜师、炼丹、渡劫，并在筑基后收徒。弟子会随年岁成长，旧日的善缘与债也可能多年后找上门。

## 云端存档

游戏进度写入 Sites 提供的 D1 数据库，以 ChatGPT 登录用户 ID 为键。每个账号保存一份完整仙途；浏览器本地存储保留离线缓存，并可迁移原有的本地存档。不同设备的进度冲突会要求玩家选择保留哪一份。数据库表定义在 `db/schema.ts`，迁移位于 `drizzle/`，读写接口为 `app/api/save/route.ts`。

设置中仍提供「测试 · 无限物资」及补满当前境界修为。测试状态与游戏进度一起保存。

## 本地开发

需要 Node.js 22.13 及以上。按项目使用的锁文件安装依赖：

```bash
pnpm install --frozen-lockfile
npm run build
```

在 Sites 的托管环境中，`.openai/hosting.json` 的逻辑 `DB` 绑定由平台配置并执行迁移。普通本地 D1 预览可在构建后执行已有迁移：

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_aspiring_dust.sql
npm start
```

`npm run dev` 可启动开发服务。游戏界面在 `app/page.tsx`，交互在 `public/game.js`，样式在 `public/style.css`。浏览器中保留旧版 `moonlit-immortal-chronicle-v1` 存档键以支持迁移。
