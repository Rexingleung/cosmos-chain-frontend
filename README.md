# Cosmos 链前端交互界面

基于 React + TypeScript + Zustand + Vite 的 Cosmos 链前端交互界面，支持钱包管理、余额查询、转账、水龙头等功能。

## ✨ 功能特性

- 🔗 **链信息查看**：实时查看链高度和区块信息
- 👛 **钱包管理**：创建钱包、导入钱包（支持助记词）
- 💧 **水龙头功能**：自动获取测试代币，支持多种代币类型
- 💰 **余额查询**：查看账户余额和交易历史
- 💸 **灵活转账**：支持当前钱包转账和助记词转账两种模式
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
- Token Faucet: http://localhost:4500 （水龙头端点）

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
│   ├── Faucet/         # 水龙头组件
│   ├── Transfer/       # 转账组件
│   └── DataQuery/      # 数据查询组件
├── stores/             # Zustand状态管理
│   ├── chainStore.ts   # 链状态
│   └── walletStore.ts  # 钱包状态
├── services/           # API服务
│   └── cosmosService.ts # Cosmos链交互服务
├── types/              # TypeScript类型定义
├── config/             # 配置文件
├── utils/              # 工具函数
└── main.tsx            # 应用入口
```

## 🔧 配置说明

### 网络配置

项目默认连接到本地 Ignite 启动的 Cosmos 链：

- RPC 端点: `http://localhost:26657`
- REST 端点: `http://localhost:1317`
- 水龙头端点: `http://localhost:4500`
- 链 ID: `aaa`（根据你的链配置调整）

如需修改网络配置，请编辑 `src/config/network.ts` 文件：

```typescript
export const CHAIN_CONFIG: ChainInfo = {
  chainId: 'your-chain-id',
  rpcEndpoint: 'http://localhost:26657',
  restEndpoint: 'http://localhost:1317',
  faucetEndpoint: 'http://localhost:4500'  // 水龙头端点
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
- **集成水龙头**：创建钱包后可直接获取测试代币

### 3. 💧 水龙头功能
- **自动检测**：自动检测水龙头服务状态
- **快速获取**：一键获取常用数量的测试代币
- **自定义请求**：支持自定义代币类型和数量
- **多种代币**：支持 stake、token、uatom、ucosm 等
- **智能提示**：提供详细的使用说明和状态反馈
- **自动刷新**：获取代币后自动刷新钱包余额

### 4. 💸 灵活转账功能

转账功能支持两种模式，满足不同的使用场景：

#### 🔄 转账模式选择

**模式1: 使用当前钱包**
- 使用已创建/导入的钱包进行转账
- 自动显示当前钱包地址和余额
- 支持余额验证和最大值自动计算
- 转账后自动刷新余额

**模式2: 输入助记词转账**  
- 适合临时转账或使用其他钱包
- 无需预先导入钱包到系统
- 支持12/15/18/21/24个单词的助记词
- 自动计算发送地址

#### 📝 转账操作步骤

1. **选择转账方式**：在下拉菜单中选择"使用当前钱包"或"输入助记词"

2. **设置发送方**：
   - **当前钱包模式**：自动显示已选钱包地址
   - **助记词模式**：在文本框中输入助记词

3. **设置接收方**：输入目标Cosmos地址或使用快速填入按钮

4. **选择代币**：从下拉菜单选择要转账的代币类型

5. **输入金额**：手动输入或点击"最大值"按钮（仅当前钱包模式可用）

6. **添加备注**（可选）：为交易添加备注信息

7. **确认转账**：点击"确认转账"按钮完成操作

#### 🛡️ 安全特性

- **地址验证**：自动验证Cosmos地址格式的有效性
- **余额检查**：转账前验证是否有足够余额（当前钱包模式）
- **重复检查**：防止向自己转账
- **手续费预留**：自动预留手续费金额
- **助记词保护**：助记词仅在内存中处理，不会持久化存储

#### 💡 使用场景

**当前钱包模式适用于**：
- 日常转账操作
- 需要查看余额信息
- 频繁使用的钱包

**助记词模式适用于**：
- 临时转账需求
- 使用其他钱包转账
- 无需导入钱包到系统的场景
- 测试和开发用途

### 5. 数据查询
- **区块查询**：通过区块高度查看区块详情
- **交易查询**：通过交易哈希查看交易信息
- **余额查询**：查看任意地址的代币余额

## 🔐 安全说明

- 助记词和私钥仅存储在本地浏览器中，不会上传到任何服务器
- 助记词转账模式中，助记词仅在内存中临时处理
- 请妥善保管你的助记词，这是恢复钱包的唯一方式
- 不要在生产环境中使用测试助记词
- 建议在测试网络上进行功能测试
- 水龙头功能仅限测试环境使用

## ⚠️ 常见问题及解决方案

### 1. Buffer is not defined 错误
如果遇到 "Buffer is not defined" 错误：

```bash
# 清理所有缓存
rm -rf node_modules package-lock.json yarn.lock .vite

# 重新安装依赖
npm install

# 重启开发服务器
npm run dev
```

### 2. 转账失败 - "Invalid string. Length must be a multiple of 4"
这个错误已通过以下方式修复：

**已实现的修复**：
- ✅ 改进助记词清理和验证函数
- ✅ 使用正确的 Gas 价格格式 (`0.0025stake`)
- ✅ 优化 CosmJS 客户端配置
- ✅ 添加完善的错误处理和用户友好提示
- ✅ 实现助记词格式验证（12/15/18/21/24个单词）

**如果仍有问题**：
```bash
# 1. 检查助记词格式
# 确保助记词是12或24个单词，用空格分隔，无多余字符

# 2. 重新导入钱包或使用助记词模式
# 使用项目的导入功能重新导入钱包

# 3. 检查网络连接
curl http://localhost:26657/status
```

### 3. 助记词转账相关问题

**Q: 助记词转账时无法显示余额怎么办？**
A: 这是正常现象。助记词模式下无法预先查询余额，请确保转账地址有足够的代币。

**Q: 助记词格式错误？**
A: 请确保：
- 单词数量正确（12/15/18/21/24个）
- 单词间用单个空格分隔
- 无多余的换行符或特殊字符
- 所有单词都是小写

**Q: 最大值按钮无法使用？**
A: 助记词模式下无法自动计算最大值，请手动输入转账金额。

### 4. 水龙头无法使用
如果水龙头功能不可用：

```bash
# 检查水龙头端点是否可访问
curl http://localhost:4500

# 检查 Ignite 是否启用了水龙头
ignite chain serve --verbose
```

## 🛠 转账功能开发指南

### 添加新的转账模式

如需扩展转账功能，可以按以下步骤操作：

1. **更新类型定义**：
```typescript
// 在 src/types/index.ts 中添加新模式
type WalletSource = 'current' | 'mnemonic' | 'private_key';
```

2. **扩展UI组件**：
```typescript
// 在 Transfer.tsx 中添加新的选项
<option value="private_key">输入私钥</option>
```

3. **实现验证逻辑**：
```typescript
// 添加对应的验证函数
const validatePrivateKey = (privateKey: string): boolean => {
  // 私钥验证逻辑
};
```

### 自定义代币支持

添加新的代币类型：

```typescript
// 在 src/config/network.ts 中添加
export const SUPPORTED_DENOMS = [
  'stake',
  'token', 
  'uatom',
  'ucosm',
  'your_custom_token'  // 添加自定义代币
];
```

## 🔄 更新日志

### v1.4.0 (2025-08-20)
- ✅ 新增转账方式选择功能
- ✅ 支持当前钱包转账和助记词转账两种模式
- ✅ 添加转账方式说明和用户引导
- ✅ 优化助记词输入界面和验证
- ✅ 增强转账安全性和用户体验
- ✅ 完善响应式设计和移动端适配

### v1.3.0 (2025-08-20)
- ✅ 修复转账功能中的 Base64 编码错误
- ✅ 改进助记词处理和验证
- ✅ 优化 Gas 价格配置
- ✅ 增强错误处理和用户提示
- ✅ 添加转账安全验证
- ✅ 完善工具函数库

### v1.2.0 (2025-08-20)
- ✅ 新增水龙头功能
- ✅ 支持多种水龙头 API 格式
- ✅ 自动检测水龙头服务状态
- ✅ 集成钱包管理中的快速获取功能
- ✅ 独立的水龙头界面
- ✅ 智能余额刷新

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