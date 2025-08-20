# Utils 工具函数

工具函数目录包含应用中使用的通用辅助函数，提供数据处理、验证和格式化等功能。

## 📂 文件说明

### helpers.ts
通用辅助函数集合，包含助记词处理、数据验证、错误处理等功能。

## 🛠️ 核心工具函数

### 助记词处理

#### cleanMnemonic
```typescript
function cleanMnemonic(mnemonic: string): string
```
**功能**: 清理助记词格式
- 移除首尾空白字符
- 规范化内部空格（多个空格合并为一个）
- 转换为小写
- 移除非字母字符

**使用场景**: 用户输入助记词时的预处理

#### validateMnemonic
```typescript
function validateMnemonic(mnemonic: string): boolean
```
**功能**: 验证助记词有效性
- 检查单词数量（支持12、15、18、21、24个单词）
- 验证每个单词是否为有效的英文单词
- 确保格式符合BIP39标准

**返回值**: 布尔值表示助记词是否有效

### 数据验证

#### validateAddress
```typescript
function validateAddress(address: string, prefix?: string): boolean
```
**功能**: 验证Cosmos地址格式
- 检查地址前缀（默认为'cosmos'）
- 验证地址长度和字符集
- 确保地址符合Bech32编码标准

**参数**:
- `address`: 要验证的地址
- `prefix`: 地址前缀（可选，默认'cosmos'）

#### validateAmount
```typescript
function validateAmount(amount: string): boolean
```
**功能**: 验证金额格式
- 检查是否为有效数字
- 确保为正数
- 验证小数位数限制
- 防止科学记数法输入

### 格式化函数

#### formatBalance
```typescript
function formatBalance(amount: string, denom: string, decimals?: number): string
```
**功能**: 格式化代币余额显示
- 将微单位转换为标准单位
- 添加千分位分隔符
- 保留指定小数位数
- 添加代币符号

**示例**:
```typescript
formatBalance('1000000', 'stake', 6) // "1.000000 stake"
formatBalance('1500000', 'atom', 6) // "1.500000 atom"
```

#### formatAddress
```typescript
function formatAddress(address: string, start?: number, end?: number): string
```
**功能**: 缩短地址显示
- 保留地址开头和结尾部分
- 中间用省略号连接
- 提高UI可读性

**示例**:
```typescript
formatAddress('cosmos1abc...xyz123', 10, 8) // "cosmos1abc...xyz123"
```

### 时间处理

#### formatTimestamp
```typescript
function formatTimestamp(timestamp: string, locale?: string): string
```
**功能**: 格式化时间戳显示
- 支持ISO 8601格式输入
- 本地化时间显示
- 相对时间计算（如"5分钟前"）

#### getRelativeTime
```typescript
function getRelativeTime(timestamp: string): string
```
**功能**: 获取相对时间描述
- 计算与当前时间的差值
- 返回友好的时间描述
- 支持多语言

### 错误处理

#### getErrorMessage
```typescript
function getErrorMessage(error: unknown): string
```
**功能**: 统一错误消息处理
- 提取Error对象的消息
- 处理不同类型的错误
- 返回用户友好的错误描述
- 避免敏感信息泄露

**错误类型处理**:
- `Error` 对象：提取message属性
- 字符串错误：直接返回
- 网络错误：转换为友好提示
- 未知错误：返回通用错误消息

#### isNetworkError
```typescript
function isNetworkError(error: unknown): boolean
```
**功能**: 检测是否为网络相关错误
- 识别连接超时
- 检测DNS解析失败
- 判断服务器响应错误

### 数据转换

#### convertUnits
```typescript
function convertUnits(amount: string, fromDecimals: number, toDecimals: number): string
```
**功能**: 在不同精度间转换数值
- 微单位到标准单位转换
- 保持数值精度
- 避免浮点数精度问题

#### parseCoins
```typescript
function parseCoins(coinString: string): Array<{amount: string, denom: string}>
```
**功能**: 解析代币字符串
- 支持多种代币格式
- 提取金额和代币类型
- 验证格式正确性

### 安全工具

#### sanitizeInput
```typescript
function sanitizeInput(input: string): string
```
**功能**: 清理用户输入
- 移除危险字符
- 防止XSS攻击
- 标准化输入格式

#### generateRandomId
```typescript
function generateRandomId(): string
```
**功能**: 生成随机ID
- 创建唯一标识符
- 用于临时数据标记
- 确保ID的唯一性

## 🎯 使用指南

### 导入函数
```typescript
import {
  cleanMnemonic,
  validateMnemonic,
  formatBalance,
  getErrorMessage
} from '../utils/helpers';
```

### 链式调用
```typescript
// 清理并验证助记词
const cleanedMnemonic = cleanMnemonic(userInput);
if (validateMnemonic(cleanedMnemonic)) {
  // 处理有效助记词
}
```

### 错误处理
```typescript
try {
  await someAsyncOperation();
} catch (error) {
  const friendlyMessage = getErrorMessage(error);
  showErrorToUser(friendlyMessage);
}
```

## ⚡ 性能优化

### 缓存机制
- 对计算密集型函数使用记忆化
- 缓存验证结果
- 避免重复计算

### 懒加载
- 按需导入工具函数
- 减少初始包大小
- 提高应用启动速度

### 防抖处理
```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

## 🔒 安全考虑

### 输入验证
- 所有用户输入都经过严格验证
- 防止注入攻击
- 限制输入长度和格式

### 敏感数据处理
- 助记词处理后立即清理内存
- 避免敏感信息日志输出
- 使用安全的随机数生成

### 错误信息
- 避免泄露系统内部信息
- 提供统一的错误格式
- 记录详细错误用于调试

## 🧪 测试策略

### 单元测试
```typescript
describe('validateMnemonic', () => {
  it('should accept valid 12-word mnemonic', () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    expect(validateMnemonic(mnemonic)).toBe(true);
  });
  
  it('should reject invalid word count', () => {
    const mnemonic = 'abandon abandon abandon';
    expect(validateMnemonic(mnemonic)).toBe(false);
  });
});
```

### 边界测试
- 空输入处理
- 极大数值处理
- 特殊字符处理
- 网络异常模拟

## 🔄 扩展指南

### 添加新工具函数
1. 在 `helpers.ts` 中定义函数
2. 添加完整的JSDoc注释
3. 导出函数供外部使用
4. 编写单元测试
5. 更新文档

### 模块化组织
- 按功能分类组织函数
- 使用命名导出
- 提供默认导出的工具对象
- 保持函数的纯净性

### 国际化支持
```typescript
function formatMessage(key: string, params?: Record<string, any>): string {
  // 国际化消息格式化
}
```

## 📊 使用统计

### 常用函数
- `getErrorMessage`: 错误处理（使用频率最高）
- `validateMnemonic`: 助记词验证
- `formatBalance`: 余额格式化
- `cleanMnemonic`: 输入清理

### 性能指标
- 函数执行时间监控
- 内存使用优化
- 缓存命中率统计

## ⚠️ 注意事项

### 浏览器兼容性
- 使用ES2017+语法
- 避免Node.js专有API
- 提供polyfill支持

### 类型安全
- 所有函数都有完整的类型定义
- 使用泛型提高复用性
- 严格的输入输出类型约束

### 最佳实践
- 函数保持纯净性
- 避免副作用
- 提供清晰的错误信息
- 使用一致的命名约定
