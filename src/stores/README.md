# Stores 状态管理

状态管理层使用 Zustand 实现，负责管理应用的全局状态，包括区块链连接状态和钱包管理状态。

## 📂 文件说明

### chainStore.ts
区块链状态管理，负责链连接、区块信息和交易查询的状态管理。

### walletStore.ts  
钱包状态管理，负责钱包创建、导入、选择和余额管理的状态管理。

## 🔗 chainStore 详解

### 状态定义
```typescript
interface ChainState {
  height: number;                    // 当前区块高度
  blockInfo: BlockInfo | null;       // 当前区块信息
  transactions: Transaction[];       // 交易历史记录
  isLoading: boolean;                // 加载状态
  error: string | null;              // 错误信息
  isConnected: boolean;              // 连接状态
}
```

### 核心操作方法

#### 获取链高度
```typescript
getChainHeight: () => Promise<void>
```
- 调用 cosmosService 获取最新区块高度
- 更新连接状态
- 处理网络错误

#### 获取区块信息
```typescript
getBlockInfo: (height?: number) => Promise<void>
```
- 获取指定高度或最新区块的详细信息
- 包含区块哈希、时间、提议者、交易数量
- 支持历史区块查询

#### 获取交易详情
```typescript
getTransaction: (txHash: string) => Promise<void>
```
- 根据交易哈希获取交易详情
- 自动去重，避免重复添加
- 维护交易历史列表

#### 初始化链连接
```typescript
initializeChain: () => Promise<void>
```
- 初始化 RPC 客户端
- 获取初始区块高度和信息
- 建立连接状态

### 错误处理
- 统一的错误消息格式
- 网络连接失败处理
- 用户友好的错误提示
- 一键清除错误功能

## 👛 walletStore 详解

### 状态定义
```typescript
interface WalletState {
  currentWallet: WalletInfo | null;           // 当前选中的钱包
  wallets: WalletInfo[];                      // 所有钱包列表
  balances: Balance[];                        // 当前钱包余额
  isLoading: boolean;                         // 加载状态
  error: string | null;                       // 错误信息
  faucetStatus: FaucetStatus | null;          // 水龙头状态
}
```

### 钱包管理操作

#### 创建新钱包
```typescript
createWallet: () => Promise<void>
```
- 生成新的助记词和地址
- 自动设置为当前钱包
- 保存到本地存储
- 更新钱包列表

#### 导入现有钱包
```typescript
importWallet: (mnemonic: string) => Promise<void>
```
- 验证助记词格式（支持12、15、18、21、24个单词）
- 检查钱包是否已存在
- 从助记词恢复钱包
- 自动获取余额信息

#### 选择钱包
```typescript
selectWallet: (wallet: WalletInfo) => void
```
- 切换当前活跃钱包
- 自动获取新钱包的余额
- 更新UI状态

### 余额管理

#### 获取余额
```typescript
getBalances: () => Promise<void>
```
- 获取当前钱包的所有代币余额
- 支持多种代币类型
- 实时更新余额显示

### 水龙头功能

#### 请求测试代币
```typescript
requestFaucetTokens: (denom?: string, amount?: string) => Promise<FaucetResult>
```
- 从水龙头获取测试代币
- 支持不同代币类型（stake、token等）
- 自动延迟刷新余额
- 返回详细的操作结果

#### 检查水龙头状态
```typescript
checkFaucetStatus: () => Promise<void>
```
- 检查水龙头服务可用性
- 更新水龙头状态指示器
- 处理服务不可用情况

### 本地存储管理

#### 保存钱包到存储
```typescript
saveWalletToStorage: (wallet: WalletInfo) => void
```
- 将钱包信息保存到 localStorage
- 避免重复保存
- 错误处理和数据验证

#### 从存储加载钱包
```typescript
loadWalletsFromStorage: () => void
```
- 应用启动时自动加载钱包
- 验证存储数据的完整性
- 清理损坏的数据

## 🔧 状态管理模式

### Zustand 特性
- **简洁的 API**: 无需 Provider 包装
- **TypeScript 支持**: 完整的类型安全
- **中间件支持**: 可扩展的功能
- **性能优化**: 只重渲染需要的组件

### 订阅模式
```typescript
// 在组件中使用
const { height, isLoading, getChainHeight } = useChainStore();
const { currentWallet, createWallet } = useWalletStore();
```

### 选择性订阅
```typescript
// 只订阅需要的状态
const height = useChainStore(state => state.height);
const isLoading = useWalletStore(state => state.isLoading);
```

## 🔄 状态同步机制

### 自动同步
- 钱包切换时自动获取余额
- 水龙头操作后延迟刷新余额
- 链连接状态实时更新

### 持久化存储
- 钱包信息持久化到 localStorage
- 应用重启后自动恢复状态
- 数据完整性验证

### 错误恢复
- 网络错误自动重试
- 数据损坏时清理和重置
- 用户友好的错误提示

## 🛠️ 工具函数集成

### 助记词处理
```typescript
import { cleanMnemonic, validateMnemonic, getErrorMessage } from '../utils/helpers';
```
- 助记词格式清理
- 助记词有效性验证
- 统一的错误消息处理

### 服务层集成
```typescript
import { cosmosService } from '../services/cosmosService';
```
- 调用底层区块链服务
- 统一的错误处理
- 异步操作管理

## 📊 状态流转图

```
用户操作 → Store Action → Service 调用 → 状态更新 → UI 重渲染
    ↑                                               ↓
错误处理 ← 错误状态 ← Service 错误 ← 网络/业务错误
```

## ⚡ 性能优化

### 状态分离
- 按功能模块分离状态
- 减少不必要的重渲染
- 独立的错误和加载状态

### 异步处理
- Promise 基础的异步操作
- 加载状态管理
- 错误边界处理

### 内存管理
- 及时清理无用状态
- 避免内存泄漏
- 合理的数据结构

## 🚨 错误处理策略

### 分层错误处理
1. **Service 层**: 网络和业务错误
2. **Store 层**: 状态更新和验证错误  
3. **Component 层**: UI 展示和用户交互错误

### 错误类型
- **网络错误**: 连接失败、超时
- **业务错误**: 余额不足、地址无效
- **数据错误**: 格式错误、类型不匹配
- **用户错误**: 输入无效、操作冲突

### 错误恢复
- 自动重试机制
- 降级处理方案
- 用户手动恢复选项

## 🔒 安全考虑

### 敏感数据处理
- 助记词临时存储
- 本地存储加密（可扩展）
- 内存中的数据清理

### 输入验证
- 助记词格式验证
- 地址格式检查
- 数量范围验证

### 状态隔离
- 不同钱包状态隔离
- 错误状态隔离
- 权限控制（可扩展）

## 🔄 扩展指南

### 添加新状态
1. 在接口中定义新的状态字段
2. 在 create 函数中初始化
3. 添加相应的 action 方法
4. 更新相关组件

### 添加中间件
```typescript
import { subscribeWithSelector } from 'zustand/middleware';

export const useChainStore = create(
  subscribeWithSelector<ChainState>((set, get) => ({
    // ... state and actions
  }))
);
```

### 持久化扩展
```typescript
import { persist } from 'zustand/middleware';

export const useWalletStore = create(
  persist<WalletState>(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ wallets: state.wallets }),
    }
  )
);
```
