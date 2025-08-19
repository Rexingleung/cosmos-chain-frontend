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
# 克隆项目
git clone https://github.com/Rexingleung/cosmos-chain-frontend.git
cd cosmos-chain-frontend

# 清理缓存（如果之前安装过）
rm -rf node_modules package-lock.json yarn.lock

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
│   ├── Transfer/       # 转账组件
│   └── DataQuery/      # 数据查询组件
├── stores/             # Zustand状态管理
│   ├── chainStore.ts   # 链状态
│   └── walletStore.ts  # 钱包状态
├── services/           # API服务
│   └── cosmosService.ts # Cosmos链交互服务
├── types/              # TypeScript类型定义
├── config/             # 配置文件
└── utils/              # 工具函数
```

## 🔧 配置说明

### 网络配置

项目默认连接到本地 Ignite 启动的 Cosmos 链：

- RPC 端点: `http://localhost:26657`
- REST 端点: `http://localhost:1317`
- 链 ID: `aaa`（根据你的链配置调整）

如需修改网络配置，请编辑 `src/config/network.ts` 文件：

```typescript
export const CHAIN_CONFIG: ChainInfo = {
  chainId: 'your-chain-id',
  rpcEndpoint: 'http://localhost:26657',
  restEndpoint: 'http://localhost:1317',
  faucetEndpoint: 'http://localhost:4500'
};
```

### 测试账户

项目包含以下测试账户信息（来自 Ignite 启动信息）：
- Alice: `cosmos129t9tm3kd5ju9dgmdt5hp0mcm3wncann2arvl5`
- Bob: `cosmos19hf4pd460t6s399pz0q5wthtzzkpl9v5reay47`

## 📚 主要功能使用说明

### 1. 链信息查看
- 实时显示当前区块高度
- 查看最新区块信息
- 显示网络连接状态
- 自动每5秒刷新数据

### 2. 钱包管理
- **创建钱包**：生成新的钱包地址和助记词
- **导入钱包**：通过12或24个单词的助记词导入现有钱包
- **钱包切换**：支持多钱包管理和切换
- **本地存储**：钱包信息安全存储在浏览器本地

### 3. 余额查询
- 查看当前钱包的所有代币余额
- 支持多种代币显示
- 一键刷新余额信息

### 4. 转账功能
- 向指定 Cosmos 地址转账
- 实时余额验证
- 自动计算手续费
- 支持添加交易备注
- 快速填入测试地址功能

### 5. 数据查询
- **区块查询**：通过区块高度查看区块详情
- **交易查询**：通过交易哈希查看交易信息
- **余额查询**：查看任意地址的代币余额

## 🔐 安全说明

- 助记词和私钥仅存储在本地浏览器中，不会上传到任何服务器
- 请妥善保管你的助记词，这是恢复钱包的唯一方式
- 不要在生产环境中使用测试助记词
- 建议在测试网络上进行功能测试

## ⚠️ 常见问题

### 1. Buffer is not defined 错误
如果遇到 "Buffer is not defined" 错误，请按以下步骤解决：

```bash
# 清理所有缓存
rm -rf node_modules package-lock.json yarn.lock .vite

# 重新安装依赖
npm install

# 重启开发服务器
npm run dev
```

项目已配置了 Buffer polyfill，包括：
- Vite 配置中的 alias 映射
- 全局 Buffer 对象注入
- TypeScript 类型声明

### 2. 连接失败
如果遇到连接问题，请检查：
- Ignite 链是否正在运行
- 端口是否被其他程序占用
- 网络配置是否正确

### 3. 转账失败
转账失败可能的原因：
- 余额不足
- 无效的接收地址
- 网络连接问题
- 手续费不足

### 4. CosmJS 版本问题
如果遇到 CosmJS 相关错误：
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 5. 开发环境问题
如果开发环境出现问题：
```bash
# 清理 Vite 缓存
rm -rf .vite

# 重启开发服务器
npm run dev
```

## 🔄 更新日志

### v1.1.0 (2025-08-20)
- ✅ 修复 Buffer is not defined 错误
- ✅ 添加完整的 polyfills 支持
- ✅ 优化浏览器兼容性
- ✅ 完善错误处理

### v1.0.0 (2025-08-20)
- ✅ 基础链信息查看功能
- ✅ 钱包创建和导入功能
- ✅ 转账功能
- ✅ 数据查询功能
- ✅ 响应式UI设计
- ✅ 中文界面
- 🐛 修复 StargateClient 连接问题

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请创建 Issue 或联系项目维护者。

## 🔗 相关链接

- [Cosmos 官网](https://cosmos.network/)
- [CosmJS 文档](https://github.com/cosmos/cosmjs)
- [Ignite CLI 文档](https://docs.ignite.com/)
- [React 官方文档](https://reactjs.org/)
- [Zustand 状态管理](https://github.com/pmndrs/zustand)