# Types 类型定义

该目录包含整个应用的 TypeScript 类型定义，确保类型安全和代码的可维护性。

## 📂 文件说明

### index.ts
应用的核心类型定义文件，包含所有主要的数据结构和接口定义。

## 🏗️ 核心类型定义

### 钱包相关类型

#### WalletInfo
```typescript
interface WalletInfo {
  address: string;    // 钱包地址
  mnemonic: string;   // 助记词
  name?: string;      // 可选的钱包名称
}
```
钱包基本信息，包含地址和助记词。用于钱包的创建、导入和管理。

#### Balance
```typescript
interface Balance {
  denom: string;      // 代币名称/标识符
  amount: string;     // 代币数量（字符串格式，避免精度问题）
}
```
代币余额信息，支持多种代币类型的余额查询和显示。

### 区块链相关类型

#### ChainInfo
```typescript
interface ChainInfo {
  chainId: string;            // 链ID
  rpcEndpoint: string;        // RPC 端点地址
  restEndpoint: string;       // REST API 端点地址
  faucetEndpoint?: string;    // 可选的水龙头端点地址
}
```
区块链网络配置信息，定义连接参数和服务端点。

#### BlockInfo
```typescript
interface BlockInfo {
  height: number;     // 区块高度
  hash: string;       // 区块哈希
  time: string;       // 区块时间（ISO 格式）
  proposer: string;   // 区块提议者地址
  txCount: number;    // 区块包含的交易数量
}
```
区块详细信息，用于区块浏览和链状态监控。

### 交易相关类型

#### Transaction
```typescript
interface Transaction {
  hash: string;           // 交易哈希
  height: number;         // 所在区块高度
  timestamp: string;      // 交易时间戳
  fee: string;            // 交易手续费
  gas: string;            // Gas 使用量
  memo?: string;          // 可选的交易备注
  success: boolean;       // 交易是否成功
  messages: TxMessage[];  // 交易消息列表
}
```
交易完整信息，包含状态、费用、消息等详细数据。

#### TxMessage
```typescript
interface TxMessage {
  type: string;       // 消息类型
  from?: string;      // 发送方地址（可选）
  to?: string;        // 接收方地址（可选）
  amount?: string;    // 转账金额（可选）
  denom?: string;     // 代币类型（可选）
}
```
交易消息结构，支持不同类型的交易操作。

#### TransferForm
```typescript
interface TransferForm {
  toAddress: string;  // 接收方地址
  amount: string;     // 转账金额
  denom: string;      // 代币类型
  memo?: string;      // 可选的转账备注
}
```
转账表单数据结构，用于用户输入和交易构建。

## 🎯 设计原则

### 类型安全
- 所有数据结构都有明确的类型定义
- 避免使用 `any` 类型
- 提供完整的属性约束

### 可扩展性
- 使用接口而非类型别名，便于扩展
- 可选属性支持未来功能扩展
- 模块化的类型定义

### 一致性
- 统一的命名规范（驼峰命名）
- 一致的数据格式（如时间使用 ISO 字符串）
- 标准化的错误处理

## 💡 使用指南

### 导入类型
```typescript
import { WalletInfo, Balance, Transaction } from '../types';
```

### 类型断言
```typescript
const wallet: WalletInfo = {
  address: 'cosmos1...',
  mnemonic: 'word1 word2 ...'
};
```

### 可选属性处理
```typescript
// 安全的可选属性访问
const walletName = wallet.name ?? '未命名钱包';
const memo = transaction.memo || '';
```

### 类型守卫
```typescript
function isValidWallet(obj: any): obj is WalletInfo {
  return obj && 
    typeof obj.address === 'string' && 
    typeof obj.mnemonic === 'string';
}
```

## 🔄 版本控制

### 类型演进
- 新增属性使用可选类型
- 重大变更需要版本迁移
- 保持向后兼容性

### 文档同步
- 类型变更时同步更新文档
- 提供变更日志
- 标注废弃的类型

## 🚨 注意事项

### 数据精度
- 金额使用字符串类型避免 JavaScript 精度问题
- 时间戳使用 ISO 字符串格式
- 区块高度使用数字类型

### 安全考虑
- 助记词等敏感信息的类型标记
- 地址格式的验证
- 输入数据的类型检查

### 性能优化
- 避免深层嵌套的复杂类型
- 使用联合类型替代过度抽象
- 合理使用索引签名

## 🔧 扩展建议

### 添加新类型
1. 在 `index.ts` 中定义新接口
2. 导出新类型供其他模块使用
3. 更新相关文档
4. 添加类型测试

### 类型组织
- 按功能模块分组类型定义
- 使用命名空间避免类型冲突
- 提供类型工具函数

### 验证集成
- 结合运行时验证库（如 Zod）
- 提供类型到验证模式的转换
- 统一的数据验证流程

## 📊 使用统计

### 常用类型
- `WalletInfo`: 钱包管理功能
- `Balance`: 余额显示和计算
- `Transaction`: 交易历史和状态
- `TransferForm`: 转账表单验证

### 扩展需求
- 智能合约相关类型
- DeFi 协议接口
- NFT 数据结构
- 跨链桥接类型

## 🛠️ 开发工具

### IDE 支持
- VS Code TypeScript 插件
- 自动补全和类型检查
- 重构和导航功能
- 错误诊断和修复

### 类型检查
```bash
# 运行类型检查
npm run type-check

# 监听模式
npm run type-check:watch
```

### 生成工具
- 从 API 自动生成类型
- 数据库模式到类型转换
- GraphQL 类型生成
- OpenAPI 规范集成

这个类型系统为整个应用提供了坚实的类型安全基础，确保代码的可靠性和可维护性。
