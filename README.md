# Sevens Duel Web

双人改良版排七 Web 游戏。当前版本已具备：

- 单人对战 AI
- 儿童 / 标准 / 挑战三档难度
- 基于 PixiJS 的赛博牌桌画布
- 手机与桌面双端烟测

## 开发

安装依赖：

```bash
npm install
```

启动本地开发：

```bash
npm run dev
```

## 测试

单元与组件测试：

```bash
npm run test
```

端到端烟测：

```bash
npx playwright test e2e/smoke.spec.ts
```

## 构建

生产构建：

```bash
npm run build
```

本地预览：

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

## 部署

当前项目适合部署到静态站点平台。推荐主方案是 `Cloudflare Pages`，备用零成本方案是 `GitHub Pages`。

- 当前 Cloudflare Pages 地址：`https://79ae24dd.sevens-duel-game.pages.dev/`
- 当前 GitHub Pages 备用地址：`https://unix2dos.github.io/sevens-duel-game/`
- 详细部署说明：[`docs/deployment.md`](docs/deployment.md)
- Cloudflare Pages 构建配置：`npm run build`，输出目录 `dist`
- Cloudflare Pages 根目录：默认仓库根目录，不需要额外子路径
- GitHub Pages 已预留自动发布工作流，合并到 `main` 后可自动构建部署
