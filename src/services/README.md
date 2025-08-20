# Services 服务层

服务层包含与 Cosmos 区块链交互的核心业务逻辑，提供钱包、转账、查询等功能的底层实现。

## 📂 文件说明

### cosmosService.ts
核心的 Cosmos 区块链服务类，提供完整的区块链交互功能。

## 🔧 CosmosService 类详解

### 核心依赖
```typescript
import { StargateClient, SigningStargateClient } from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { generateMnemonic } from 'bip39';
import { GasPrice, calculateFee } from '@cosmjs/stargate';
```

### 客户端管理
**私有属性：**
- `stargateClient`: 用于查询区块链状态的只读客户端
- `tmClient`: Tendermint RPC 客户端，用于获取底层区块信息

**初始化方法：**
```typescript
async initClients(): Promise<void>
```
- 连接到配置的 RPC 端点
- 初始化 Stargate 和 Tendermint 客户端
- 自动重试机制和错误处理

## 🏗️ 核心功能模块

### 1. 区块链查询功能

#### 获取链高度
```typescript
async getChainHeight(): Promise<number>
```
- 返回当前区块链的最新高度
- 自动初始化客户端

#### 获取区块信息
```typescript
async getBlockInfo(height?: number): Promise<BlockInfo>
```
- 获取指定高度或最新区块的详细信息
- 返回数据：高度、哈希、时间、提议者、交易数量

#### 获取网络状态
```typescript
async getNetworkStatus()
```
- 获取节点信息、同步状态、验证者信息
- 用于监控网络健康状态

### 2. 钱包管理功能

#### 创建新钱包
```typescript
async createWallet(): Promise<WalletInfo>
```
- 生成 BIP39 助记词
- 创建 HD 钱包实例
- 返回地址和助记词

#### 导入现有钱包
```typescript
async importWallet(mnemonic: string): Promise<WalletInfo>
```
- 验证助记词格式
- 从助记词恢复钱包
- 返回地址信息

### 3. 余额查询功能

#### 获取账户余额
```typescript
async getBalance(address: string): Promise<Balance[]>
```
- 获取指定地址的所有代币余额
- 支持多种代币类型
- 返回代币名称和数量

### 4. 交易功能

#### 获取交易详情
```typescript
async getTransaction(txHash: string): Promise<Transaction | null>
```
- 根据交易哈希查询交易详情
- 包含交易状态、手续费、区块信息
- 自动解析交易时间戳

#### 代币转账
```typescript
async transfer(mnemonic: string, transferForm: TransferForm): Promise<string>
```

**转账流程：**
1. **钱包创建**: 从助记词恢复钱包
2. **账户验证**: 获取发送方账户信息
3. **客户端初始化**: 创建签名客户端
4. **参数验证**: 验证地址格式和数量
5. **交易执行**: 发送转账交易
6. **结果验证**: 检查交易状态和结果

**错误处理：**
- 助记词格式验证
- 网络连接错误处理
- 余额不足检查
- Base64 编码错误修复
- 用户友好的错误信息

### 5. 水龙头功能

#### 请求测试代币
```typescript
async requestFromFaucet(
  address: string, 
  denom: string = 'stake', 
  amount?: string
): Promise<{ success: boolean; message: string; txHash?: string }>
```

**支持多种水龙头 API 格式：**
- POST /credit - 标准格式
- POST /faucet - 简化格式  
- GET 参数格式 - URL 参数
- POST /request - 扩展格式

**特性：**
- 自动尝试多种 API 格式
- 错误重试机制
- 交易哈希返回

#### 检查水龙头状态
```typescript
async checkFaucetStatus(): Promise<{ available: boolean; message: string }>
```
- 检查水龙头服务可用性
- 返回状态和描述信息

## 🔒 安全特性

### 助记词处理
- 安全的助记词验证
- 内存中临时处理，不持久化
- 错误时清理敏感数据

### 网络安全
- RPC 端点验证
- 超时处理
- 连接错误重试

### 交易安全
- 签名验证
- 交易状态检查
- Gas 费用计算

## ⚡ 性能优化

### 客户端复用
- 单例模式避免重复连接
- 连接池管理
- 自动重连机制

### 错误处理
- 分类错误处理
- 用户友好的错误信息
- 详细的调试日志

### 异步操作
- Promise 基础的异步 API
- 非阻塞操作
- 并发请求支持

## 🔧 配置管理

### 网络配置
使用 `CHAIN_CONFIG` 配置：
- `rpcEndpoint`: RPC 节点地址
- `faucetEndpoint`: 水龙头服务地址
- `prefix`: 地址前缀 (cosmos)

### Gas 配置
- `DEFAULT_GAS_PRICE`: 默认 Gas 价格
- `DEFAULT_GAS_LIMIT`: 默认 Gas 限制
- 自动 Gas 估算

## 🚨 错误处理策略

### 网络错误
- 连接超时重试
- 端点可用性检查
- 降级处理

### 数据错误
- 参数验证
- 格式检查
- 类型转换

### 业务错误
- 余额不足
- 地址格式错误
- 助记词无效

## 📊 日志和调试

### 详细日志
- 操作步骤追踪
- 错误详情记录
- 性能指标监控

### 调试支持
- 开发模式下的详细输出
- 错误堆栈跟踪
- 网络请求日志

## 🔄 实例化和使用

### 单例模式
```typescript
export const cosmosService = new CosmosService();
```

该服务以单例模式导出，确保整个应用中只有一个实例，避免重复连接和资源浪费。

### 使用示例
```typescript
// 获取区块高度
const height = await cosmosService.getChainHeight();

// 创建钱包
const wallet = await cosmosService.createWallet();

// 获取余额
const balances = await cosmosService.getBalance(address);

// 转账
const txHash = await cosmosService.transfer(mnemonic, transferForm);
```

## 🛠️ 扩展和定制

### 添加新功能
1. 在 CosmosService 类中添加新方法
2. 更新相关的类型定义
3. 添加错误处理逻辑
4. 更新文档

### 支持新网络
1. 更新网络配置
2. 调整地址前缀
3. 适配特定的 API 格式
4. 测试兼容性

## ⚠️ 注意事项

- 该服务仅用于开发和测试
- 助记词处理需要额外的安全措施
- 网络连接依赖外部服务
- 交易操作不可逆，请谨慎使用
