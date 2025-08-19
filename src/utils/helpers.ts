// 工具函数：清理和验证助记词
export const cleanMnemonic = (mnemonic: string): string => {
  return mnemonic
    .trim()                          // 去除首尾空格
    .replace(/\s+/g, ' ')           // 将多个空格替换为单个空格
    .toLowerCase();                  // 转换为小写
};

// 验证助记词格式
export const validateMnemonic = (mnemonic: string): boolean => {
  const cleaned = cleanMnemonic(mnemonic);
  const words = cleaned.split(' ');
  
  // 检查单词数量（应该是12、15、18、21或24个）
  const validLengths = [12, 15, 18, 21, 24];
  if (!validLengths.includes(words.length)) {
    return false;
  }
  
  // 检查是否有空单词
  return words.every(word => word.length > 0);
};

// 格式化余额显示
export const formatBalance = (amount: string, denom: string): string => {
  const value = parseInt(amount) / 1000000; // 转换为基本单位
  return `${value.toLocaleString()} ${denom}`;
};

// 格式化地址显示
export const formatAddress = (address: string, startChars = 10, endChars = 8): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// 验证Cosmos地址格式
export const validateCosmosAddress = (address: string): boolean => {
  // 基本格式检查
  if (!address.startsWith('cosmos')) {
    return false;
  }
  
  // 长度检查（cosmos地址通常是39或45字符）
  if (address.length < 39 || address.length > 45) {
    return false;
  }
  
  // 字符检查（应该只包含小写字母和数字）
  const regex = /^cosmos[0-9a-z]+$/;
  return regex.test(address);
};

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
};

// 延迟函数
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 重试函数
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await delay(delayMs * attempt); // 递增延迟
    }
  }
  
  throw lastError!;
};

// 错误消息映射
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // 常见错误映射
    if (message.includes('insufficient funds')) {
      return '余额不足';
    }
    if (message.includes('invalid address')) {
      return '无效的地址格式';
    }
    if (message.includes('base64') || message.includes('multiple of 4')) {
      return '数据编码错误，请检查助记词格式';
    }
    if (message.includes('network')) {
      return '网络连接错误，请检查网络状态';
    }
    if (message.includes('timeout')) {
      return '请求超时，请重试';
    }
    if (message.includes('gas')) {
      return 'Gas费用不足或设置错误';
    }
    if (message.includes('sequence')) {
      return '交易序号错误，请重试';
    }
    
    return error.message;
  }
  
  return '未知错误';
};