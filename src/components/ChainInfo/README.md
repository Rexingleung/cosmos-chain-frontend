# ChainInfo 组件

链信息展示组件，用于显示和监控 Cosmos 区块链的实时状态信息。

## 📂 文件说明

### ChainInfo.tsx
主要的 React 组件文件，负责：

**核心功能：**
- 显示区块链连接状态
- 实时获取和显示当前区块高度
- 展示最新区块的详细信息
- 提供区块浏览功能
- 自动刷新机制（每5秒）

**主要状态：**
- `height`: 当前区块链高度
- `blockInfo`: 区块详细信息（哈希、时间、交易数量、提议者）
- `isLoading`: 加载状态
- `error`: 错误信息
- `isConnected`: 连接状态

**用户交互：**
- 手动刷新按钮
- 查看上一区块
- 查看最新区块
- 错误信息清除

### ChainInfo.css
组件样式文件，定义了：

**视觉设计：**
- 链信息卡片布局
- 连接状态指示器样式（已连接/未连接）
- 统计信息网格布局
- 操作按钮样式
- 错误消息展示
- 响应式设计

**样式特点：**
- 现代化的卡片设计
- 清晰的层次结构
- 状态颜色区分（绿色表示连接，红色表示断开）
- 悬停和交互效果

## 🔧 技术实现

### 状态管理
使用 `useChainStore` Hook 获取链状态：
```typescript
const {
  height,
  blockInfo,
  isLoading,
  error,
  isConnected,
  getChainHeight,
  getBlockInfo,
  clearError,
  initializeChain
} = useChainStore();
```

### 自动刷新机制
```typescript
useEffect(() => {
  if (isConnected) {
    const interval = setInterval(() => {
      getChainHeight();
      getBlockInfo();
    }, 5000); // 每5秒刷新一次

    return () => clearInterval(interval);
  }
}, [isConnected, getChainHeight, getBlockInfo]);
```

### 数据展示
- **区块高度**: 实时显示当前链的最新区块号
- **区块哈希**: 显示区块的唯一标识符
- **区块时间**: 格式化显示区块生成时间
- **交易数量**: 显示该区块包含的交易数量
- **提议者**: 显示区块的验证者/提议者地址

## 🎯 使用场景

1. **开发调试**: 监控本地测试链或开发网络状态
2. **网络监控**: 实时查看区块链网络运行状况
3. **区块浏览**: 快速查看最新区块信息
4. **连接诊断**: 检查前端与区块链节点的连接状态

## 🔍 依赖关系

- **chainStore**: 获取链状态和操作方法
- **cosmosService**: 底层区块链数据获取服务
- **React Hooks**: useState, useEffect 进行状态和生命周期管理

## 📱 响应式设计

组件支持多种屏幕尺寸：
- 桌面端：完整的网格布局
- 移动端：堆叠式布局，优化触摸交互
- 平板端：适应性中等尺寸布局

## ⚡ 性能优化

- 使用 `useEffect` 依赖数组避免不必要的重新渲染
- 定时器清理机制防止内存泄漏
- 错误边界处理确保组件稳定性
- 按钮禁用状态防止重复请求

## 🚨 错误处理

- 网络连接错误提示
- API 请求失败处理
- 用户友好的错误信息展示
- 一键清除错误功能
