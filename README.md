# Sevens Duel Web

单机 AI 对战的改良版排七 Web 游戏，用一张深色绒面牌桌和一副真实扑克牌，把传统接龙规则做成更适合桌面与手机试玩的短局体验。

## 亮点

- 单机 AI 对战，支持 `儿童 / 标准 / 挑战` 三档难度
- 基于 PixiJS 的牌桌场景与真实扑克牌表现
- 关键动作带短促音效反馈，试玩更接近成品体验
- 手机与桌面双端可玩，已有基础烟测覆盖

## 游戏截图

![首页](docs/assets/showcase/home.png)

![对局中](docs/assets/showcase/gameplay.png)

![结果页](docs/assets/showcase/result.png)

## 演示视频

[![演示视频封面](docs/assets/showcase/demo-cover.png)](docs/assets/showcase/sevens-duel-demo.mp4)

点击封面可查看仓库内的短演示视频，内容展示首页进入牌局、牌桌动效以及结果页闭环。

## 玩法概览

- 围绕四个 `7` 开线，向上接 `6/5/4...`，向下接 `8/9/10...`
- 双方轮流出牌；没有可出的牌时，需要从对手手里借一张
- 先打光手牌，或在特殊情况下借光对手，即可结束本局

## 体验特性

- 首页、对局、结果页使用统一的深色牌桌视觉语言
- 牌局信息聚焦在顶部状态、中央牌桌和底部手牌区
- README 展示素材位于 `docs/assets/showcase/`
- 音效来源说明见 [audio-attribution.md](docs/assets/showcase/audio-attribution.md)

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
