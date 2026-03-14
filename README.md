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
