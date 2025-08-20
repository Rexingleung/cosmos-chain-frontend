# Config 配置管理

配置管理目录包含应用的各种配置文件，包括网络设置、环境变量、常量定义等。

## 📂 文件说明

### network.ts
网络相关配置文件，定义区块链网络连接参数、RPC端点、Gas设置等。

## 🔧 网络配置详解

### CHAIN_CONFIG
主要的区块链网络配置对象：

```typescript
export const CHAIN_CONFIG = {
  chainId: string;           // 链ID标识符
  rpcEndpoint: string;       // RPC节点地址
  restEndpoint: string;      // REST API端点
  faucetEndpoint?: string;   // 水龙头服务地址
  prefix: string;            // 地址前缀
  denom: string;             // 基础代币名称
  decimals: number;          // 代币精度
}
```

### Gas 配置

#### DEFAULT_GAS_PRICE
```typescript
export const DEFAULT_GAS_PRICE = '0.025uatom';
```
**功能**: 默认Gas价格设置
- 用于交易费用计算
- 影响交易确认速度
- 可根据网络拥堵情况调整

#### DEFAULT_GAS_LIMIT
```typescript
export const DEFAULT_GAS_LIMIT = 200000;
```
**功能**: 默认Gas限制
- 交易的最大Gas使用量
- 防止无限循环消耗

### 网络端点配置

#### RPC 端点
- **功能**: 区块链节点直接通信
- **用途**: 交易广播、状态查询、事件监听
- **协议**: HTTP/HTTPS, WebSocket

#### REST 端点
- **功能**: RESTful API访问
- **用途**: 账户查询、历史数据获取
- **协议**: HTTP/HTTPS

#### 水龙头端点
- **功能**: 测试代币获取
- **用途**: 开发和测试环境
- **协议**: HTTP/HTTPS

## 🌐 多网络支持

### 网络配置模板
```typescript
interface NetworkConfig {
  name: string;
  chainId: string;
  rpcEndpoint: string;
  restEndpoint: string;
  faucetEndpoint?: string;
  prefix: string;
  denom: string;
  decimals: number;
  gasPrice: string;
  gasLimit: number;
}
```

### 预定义网络
支持主网、测试网和本地开发网络，每个网络都有独立的配置参数。

### 动态网络切换
```typescript
export function switchNetwork(networkName: string): NetworkConfig {
  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Unknown network: ${networkName}`);
  }
  return network;
}
```

## 🔒 安全配置

### 端点验证
- HTTPS优先：生产环境强制使用HTTPS
- 端点白名单：限制可连接的RPC端点
- 超时设置：防止长时间连接占用
- 重试机制：网络故障时的自动重试

## 🌛️ 环境变量支持

### 环境配置
```typescript
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  RPC_ENDPOINT: process.env.VITE_RPC_ENDPOINT,
  REST_ENDPOINT: process.env.VITE_REST_ENDPOINT,
  FAUCET_ENDPOINT: process.env.VITE_FAUCET_ENDPOINT,
  NETWORK: process.env.VITE_NETWORK || 'testnet'
};
```

### .env 文件示例
```bash
# 网络配置
VITE_NETWORK=testnet
VITE_RPC_ENDPOINT=https://rpc.cosmos.network:443
VITE_REST_ENDPOINT=https://rest.cosmos.network
VITE_FAUCET_ENDPOINT=https://faucet.cosmos.network

# Gas 配置
VITE_GAS_PRICE=0.025uatom
VITE_GAS_LIMIT=200000

# 调试选项
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### 配置加载优先级
1. 环境变量
2. .env 文件
3. 默认配置
4. 网络预设

## 📊 配置验证

### 配置检查器
```typescript
export function validateConfig(config: NetworkConfig): boolean {
  const required = ['chainId', 'rpcEndpoint', 'prefix', 'denom'];
  
  for (const field of required) {
    if (!config[field]) {
      console.error(`Missing required config field: ${field}`);
      return false;
    }
  }
  
  return true;
}
```

### 运行时检查
在应用启动时验证配置的完整性和有效性。

## 🔄 配置热更新

### 动态配置更新
```typescript
export class ConfigManager {
  private config: NetworkConfig;
  private listeners: Array<(config: NetworkConfig) => void> = [];
  
  updateConfig(newConfig: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.notifyListeners();
  }
  
  subscribe(listener: (config: NetworkConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }
}
```

## 🛠️ 开发工具

### 配置调试
```typescript
export function debugConfig(): void {
  console.group('Current Configuration');
  console.log('Network:', ENV_CONFIG.NETWORK);
  console.log('Chain ID:', CHAIN_CONFIG.chainId);
  console.log('RPC Endpoint:', CHAIN_CONFIG.rpcEndpoint);
  console.log('Gas Price:', DEFAULT_GAS_PRICE);
  console.groupEnd();
}
```

### 健康检查
```typescript
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${CHAIN_CONFIG.rpcEndpoint}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
```

## ⚡ 性能优化

### 配置缓存
- 避免重复的配置验证
- 缓存网络连接状态
- 预加载常用配置

### 懒加载
- 按需加载网络配置
- 延迟初始化非关键配置
- 减少应用启动时间

## 🚨 故障排除

### 常见问题
1. **RPC连接失败**: 检查网络配置和防火墙设置
2. **Gas估算错误**: 调整Gas价格和限制
3. **水龙头不可用**: 验证端点地址和服务状态
4. **配置冲突**: 检查环境变量优先级

### 诊断工具
```typescript
export async function diagnoseNetwork(): Promise<void> {
  console.log('🔍 Network Diagnosis');
  
  // 检查RPC连接
  try {
    const rpcHealth = await healthCheck();
    console.log('✅ RPC Health:', rpcHealth ? 'OK' : 'FAILED');
  } catch (error) {
    console.log('❌ RPC Error:', error);
  }
  
  // 检查配置有效性
  const configValid = validateConfig(CHAIN_CONFIG);
  console.log('⚙️ Config Valid:', configValid ? 'YES' : 'NO');
}
```

## 📝 最佳实践

### 配置管理
- 使用类型安全的配置定义
- 提供配置验证和错误处理
- 支持多环境配置切换
- 实现配置的版本控制

### 安全考虑
- 敏感配置使用环境变量
- 验证外部端点的安全性
- 实现配置访问权限控制
- 记录配置变更审计日志

### 可维护性
- 使用清晰的配置命名
- 提供详细的配置文档
- 实现配置的向后兼容
- 支持配置的渐进式迁移

## 🔍 使用指南

### 基本用法
```typescript
import { CHAIN_CONFIG, DEFAULT_GAS_PRICE } from '../config/network';

// 使用配置
const rpcUrl = CHAIN_CONFIG.rpcEndpoint;
const gasPrice = DEFAULT_GAS_PRICE;
```

### 环境切换
```typescript
// 通过环境变量切换网络
process.env.VITE_NETWORK = 'mainnet';

// 或使用配置管理器
const configManager = new ConfigManager(CHAIN_CONFIG);
configManager.updateConfig({ chainId: 'cosmoshub-4' });
```

### 配置验证
```typescript
if (!validateConfig(CHAIN_CONFIG)) {
  throw new Error('Invalid configuration');
}
```

这个配置系统为整个应用提供了灵活、安全、可扩展的配置管理能力，支持多环境部署和动态配置更新。
