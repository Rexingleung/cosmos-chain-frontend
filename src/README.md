# 源代码目录说明

这是 Cosmos Chain Frontend 项目的核心源代码目录。该项目是一个基于 React + TypeScript + CosmJS 的区块链交互前端应用，用于与 Cosmos 生态系统的区块链进行交互。

## 📁 目录结构

```
src/
├── components/          # React 组件
├── config/             # 配置文件
├── services/           # 服务层 - 区块链交互逻辑
├── stores/             # 状态管理 - Zustand stores
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
├── App.tsx             # 主应用组件
├── App.css             # 应用样式
├── main.tsx            # 应用入口文件
├── index.css           # 全局样式
└── vite-env.d.ts       # Vite 环境类型定义
```

## 🔧 核心文件说明

### 入口文件
- **main.tsx**: 应用的入口点，负责初始化 React 应用并处理浏览器兼容性
- **App.tsx**: 主应用组件，包含路由逻辑和整体布局
- **App.css**: 主应用组件的样式文件
- **index.css**: 全局样式定义
- **vite-env.d.ts**: Vite 开发环境的 TypeScript 类型声明

### 功能目录
- **components/**: 包含所有 React 组件，按功能模块组织
- **services/**: 业务逻辑层，主要包含与 Cosmos 区块链的交互服务
- **stores/**: 使用 Zustand 的状态管理，包含链状态和钱包状态
- **types/**: TypeScript 类型定义，确保类型安全
- **utils/**: 通用工具函数
- **config/**: 应用配置文件

## 🚀 主要功能

该前端应用提供以下核心功能：

1. **链信息查询** - 显示区块链网络状态和基本信息
2. **钱包管理** - 创建、导入、管理多个钱包
3. **水龙头** - 从测试网获取测试代币
4. **代币转账** - 在地址间转移代币
5. **数据查询** - 查询区块链上的各种数据
6. **调试工具** - 开发者调试和测试功能

## 🛠️ 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **CosmJS** - Cosmos 区块链交互库
- **Zustand** - 轻量级状态管理
- **Vite** - 现代前端构建工具
- **CSS3** - 样式和布局

## 📖 开发指南

### 组件开发
- 所有组件都放在 `components/` 目录下
- 每个主要功能组件都有独立的文件夹
- 组件使用 TypeScript 编写，确保类型安全

### 状态管理
- 使用 Zustand 进行状态管理
- 链相关状态在 `chainStore` 中管理
- 钱包相关状态在 `walletStore` 中管理

### 区块链交互
- 所有区块链交互逻辑都在 `services/cosmosService.ts` 中
- 使用 CosmJS 库与 Cosmos SDK 区块链交互
- 支持多种操作：查询、转账、智能合约调用等

## ⚠️ 注意事项

- 该应用仅用于开发和测试目的
- 不要在生产环境中使用真实资产
- 所有私钥和助记词都存储在浏览器本地，请注意安全
- 建议在测试网络上进行所有操作

## 🔍 详细文档

每个子目录都包含详细的 README.md 文件，说明该模块的具体功能和使用方法。
