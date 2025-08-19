# Cosmos 链前端交互界面

基于 React + TypeScript + Zustand + Vite 的 Cosmos 链前端交互界面，支持钱包管理、余额查询、转账等功能。

## ✨ 功能特性

- 🔗 **链信息查看**：实时查看链高度和区块信息
- 👛 **钱包管理**：创建钱包、导入钱包（支持助记词）
- 💰 **余额查询**：查看账户余额和交易历史
- 💸 **转账功能**：支持向其他地址转账
- 🔍 **数据查询**：查看区块信息、交易详情等链上数据

## 🛠 技术栈

- **前端框架**：React 18
- **类型系统**：TypeScript
- **状态管理**：Zustand
- **构建工具**：Vite
- **Cosmos集成**：CosmJS
- **UI样式**：CSS Modules

## 🚀 快速开始

### 前置要求

- Node.js >= 16.0.0
- pnpm 或 npm
- 本地运行的 Cosmos 链（使用 Ignite 启动）

### 本地开发环境配置

确保你的本地 Cosmos 链正在运行：

```bash
ignite chain serve
```

链应该在以下端点可用：
- Tendermint RPC: http://localhost:26657
- REST API: http://localhost:1317
- Token Faucet: http://localhost:4500

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

应用将在 http://localhost:3000 启动。

### 构建生产版本

```bash
pnpm build
# 或
npm run build
```

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── ChainInfo/      # 链信息组件
│   ├── WalletManager/  # 钱包管理组件
│   ├── BalanceQuery/   # 余额查询组件
│   └── Transfer/       # 转账组件
├── stores/             # Zustand状态管理
│   ├── chainStore.ts   # 链状态
│   └── walletStore.ts  # 钱包状态
├── services/           # API服务
│   └── cosmosService.ts # Cosmos链交互服务
├── types/              # TypeScript类型定义
└── utils/              # 工具函数
```

## 🔧 配置说明

### 网络配置

项目默认连接到本地 Ignite 启动的 Cosmos 链：

- RPC 端点: `http://localhost:26657`
- REST 端点: `http://localhost:1317`
- 链 ID: `aaa`（根据你的链配置调整）

如需修改网络配置，请编辑 `src/config/network.ts` 文件。

### 测试账户

项目包含以下测试账户信息（来自 Ignite 启动信息）：
- Alice: `cosmos129t9tm3kd5ju9dgmdt5hp0mcm3wncann2arvl5`
- Bob: `cosmos19hf4pd460t6s399pz0q5wthtzzkpl9v5reay47`

## 📚 主要功能使用说明

### 1. 链信息查看
- 实时显示当前区块高度
- 查看最新区块信息
- 显示网络状态

### 2. 钱包管理
- **创建钱包**：生成新的钱包地址和助记词
- **导入钱包**：通过助记词导入现有钱包
- **钱包切换**：支持多钱包切换

### 3. 余额查询
- 查看当前钱包余额
- 显示交易历史
- 支持多种代币显示

### 4. 转账功能
- 向指定地址转账
- 设置转账金额和手续费
- 交易状态跟踪

## 🔐 安全说明

- 助记词和私钥仅存储在本地浏览器中
- 请妥善保管你的助记词
- 不要在生产环境中使用测试助记词

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请创建 Issue 或联系项目维护者。
