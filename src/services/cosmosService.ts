import { StargateClient, SigningStargateClient } from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { generateMnemonic } from 'bip39';
import { GasPrice, calculateFee } from '@cosmjs/stargate';
import { 
  Balance, 
  BlockInfo, 
  Transaction, 
  WalletInfo, 
  TransferForm 
} from '../types';
import { CHAIN_CONFIG, DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT } from '../config/network';

export class CosmosService {
  private stargateClient: StargateClient | null = null;
  private tmClient: Tendermint37Client | null = null;

  async initClients() {
    try {
      if (this.tmClient === null) {
        console.log(5);
        
        this.tmClient = await Tendermint37Client.connect(CHAIN_CONFIG.rpcEndpoint);
      }
      if (this.stargateClient === null) {
        console.log(7);
        this.stargateClient = await StargateClient.connect(CHAIN_CONFIG.rpcEndpoint);
      }
    } catch (error) {
      console.error('初始化客户端失败:', error);
      throw error;
    }
  }

  // 获取链高度
  async getChainHeight(): Promise<number> {
    if (!this.stargateClient) {
      await this.initClients();
    }
    const height = await this.stargateClient!.getHeight();
    return height;
  }

  // 获取区块信息
  async getBlockInfo(height?: number): Promise<BlockInfo> {
    if (!this.tmClient) {
      await this.initClients();
    }
    
    const block = height 
      ? await this.tmClient!.block(height)
      : await this.tmClient!.block();
    
    return {
      height: block.block.header.height,
      hash: block.blockId.hash.toString(),
      time: block.block.header.time.toISOString(),
      proposer: block.block.header.proposerAddress.toString(),
      txCount: block.block.txs.length
    };
  }

  // 创建钱包
  async createWallet(): Promise<WalletInfo> {
    const mnemonic = generateMnemonic();
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'cosmos'
    });
    const [account] = await wallet.getAccounts();
    
    return {
      address: account.address,
      mnemonic: mnemonic
    };
  }

  // 从助记词导入钱包
  async importWallet(mnemonic: string): Promise<WalletInfo> {
    try {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: 'cosmos'
      });
      const [account] = await wallet.getAccounts();
      
      return {
        address: account.address,
        mnemonic: mnemonic
      };
    } catch (error) {
      console.error('导入钱包失败:', error);
      throw new Error('无效的助记词');
    }
  }

  // 获取账户余额
  async getBalance(address: string): Promise<Balance[]> {
    if (!this.stargateClient) {
      await this.initClients();
    }
    
    const balances = await this.stargateClient!.getAllBalances(address);
    return balances.map(balance => ({
      denom: balance.denom,
      amount: balance.amount
    }));
  }

  // 获取交易详情
  async getTransaction(txHash: string): Promise<Transaction | null> {
    if (!this.stargateClient) {
      await this.initClients();
    }
    
    try {
      const tx = await this.stargateClient!.getTx(txHash);
      if (!tx) return null;
      
      // 获取区块信息来获取时间戳
      let timestamp = new Date().toISOString();
      try {
        const blockInfo = await this.getBlockInfo(tx.height);
        timestamp = blockInfo.time;
      } catch (error) {
        console.warn('获取区块时间失败:', error);
      }
      return {
        hash: tx.hash,
        height: tx.height,
        timestamp: timestamp,
        fee: tx.gasUsed.toString(),
        gas: tx.gasWanted.toString(),
        memo: '',
        success: tx.code === 0,
        messages: [] as any[]
      };
    } catch (error) {
      console.error('获取交易失败:', error);
      return null;
    }
  }

  // 转账 - 修复 sendTokens Base64 错误
  async transfer(
    mnemonic: string, 
    transferForm: TransferForm
  ): Promise<string> {
    let wallet: DirectSecp256k1HdWallet | null = null;
    let client: SigningStargateClient | null = null;
    
    try {
      console.log('=== 开始转账流程 ===');
      console.log('转账参数:', {
        toAddress: transferForm.toAddress,
        amount: transferForm.amount,
        denom: transferForm.denom,
        memo: transferForm.memo
      });
      
      // 第一步：创建钱包
      console.log('步骤1: 创建钱包');
      try {
        // 确保助记词格式正确
        const cleanMnemonic = mnemonic.trim().replace(/\s+/g, ' ');
        wallet = await DirectSecp256k1HdWallet.fromMnemonic(cleanMnemonic, {
          prefix: 'cosmos'
        });
        console.log('✅ 钱包创建成功');
      } catch (walletError) {
        console.error('❌ 钱包创建失败:', walletError);
        throw new Error('助记词无效或格式错误');
      }
      
      // 第二步：获取账户信息
      console.log('步骤2: 获取账户信息');
      const [account] = await wallet.getAccounts();
      console.log('✅ 发送方地址:', account.address);
      
      // 第三步：创建签名客户端
      console.log('步骤3: 创建签名客户端');
      try {
        const gasPrice = GasPrice.fromString(DEFAULT_GAS_PRICE);
        console.log(DEFAULT_GAS_PRICE, 'DEFAULT_GAS_PRICE');
        
        client = await SigningStargateClient.connectWithSigner(
          CHAIN_CONFIG.rpcEndpoint,
          wallet,
          {
            gasPrice,
          }
        );
        console.log('✅ 签名客户端创建成功');
      } catch (clientError) {
        console.error('❌ 签名客户端创建失败:', clientError);
        throw new Error('无法连接到区块链网络');
      }
      
      // 第四步：验证和准备参数
      console.log('步骤4: 验证和准备转账参数');
      
      // 验证地址格式
      if (!transferForm.toAddress.startsWith('cosmos')) {
        throw new Error('无效的接收地址格式');
      }
      // 确保参数类型正确
      const fromAddress = account.address;
      const toAddress = transferForm.toAddress.trim();
      const amount = [{
        denom: transferForm.denom.trim(),
        amount: transferForm.amount.toString()
      }];
      
      console.log('✅ 参数验证通过:', {
        fromAddress,
        toAddress,
        amount,
      });
      
      // 第六步：执行转账（修复版本）
      console.log('步骤6: 执行转账交易');
      let result;
      try {
        // 方法1：使用固定手续费
        console.log('使用固定手续费');
        result = await client.sendTokens(
          fromAddress,
          toAddress,
          amount,
          "auto",
        );
        console.log('✅ 方法1成功'); // 这里无法打印
      } catch (sendError1) {
        console.log("sendError1", sendError1);
        
      }
      
      // 第七步：验证结果
      console.log('步骤7: 验证交易结果');
      console.log('交易结果详情:', {
        code: result?.code,
        transactionHash: result?.transactionHash,
        gasUsed: result?.gasUsed,
        gasWanted: result?.gasWanted
      });
      
      if (result?.code !== 0) {
        console.error('❌ 交易执行失败，错误代码:', result?.code);
        throw new Error(`转账失败: ${result?.rawLog || '交易被区块链拒绝'}`);
      }
      
      console.log('✅ 转账成功！交易哈希:', result.transactionHash);
      console.log('=== 转账流程完成 ===');
      
      return result.transactionHash;
      
    } catch (error) {
      console.error('=== 转账流程发生错误 ===');
      console.error('错误详情:', error);
      
      // 确保客户端资源被清理
      try {
        if (client) {
          // 断开客户端连接（如果有这样的方法）
          // client.disconnect?.();
        }
      } catch (cleanupError) {
        console.warn('客户端清理时发生错误:', cleanupError);
      }
      
      // 处理和重新抛出错误
      if (error instanceof Error) {
        // 如果是我们已经处理过的友好错误，直接抛出
        if (error.message.includes('助记词无效') || 
            error.message.includes('余额不足') || 
            error.message.includes('无效的地址格式') ||
            error.message.includes('无法连接到区块链网络') ||
            error.message.includes('数据编码错误')) {
          throw error;
        }
        
        // 处理其他类型的错误
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('base64') || errorMessage.includes('multiple of 4')) {
          throw new Error('数据编码错误，请检查助记词和地址格式');
        } else if (errorMessage.includes('invalid mnemonic')) {
          throw new Error('无效的助记词');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          throw new Error('网络连接错误，请检查网络状态');
        } else if (errorMessage.includes('timeout')) {
          throw new Error('请求超时，请重试');
        } else {
          throw new Error(`转账失败: ${error.message}`);
        }
      }
      
      throw new Error('转账失败，请检查网络连接和参数');
    }
  }

  // 水龙头功能 - 请求代币
  async requestFromFaucet(
    address: string, 
    denom: string = 'stake', 
    amount?: string
  ): Promise<{ success: boolean; message: string; txHash?: string }> {
    if (!CHAIN_CONFIG.faucetEndpoint) {
      throw new Error('水龙头端点未配置');
    }

    try {
      // 方法1: 标准的 REST API 调用
      const faucetUrl = `${CHAIN_CONFIG.faucetEndpoint}`;
      
      // 不同的水龙头可能有不同的 API 格式，这里提供几种常见的格式
      const requestBody = {
        address: address,
        denom: denom,
        amount: amount || '10000000' // 默认 10 个代币（微单位）
      };

      console.log('正在请求水龙头代币...', { address, denom, amount });

      // 尝试不同的 API 格式
      const apiFormats = [
        // 格式1: POST /credit
        {
          url: `${faucetUrl}/credit`,
          method: 'POST',
          body: requestBody
        },
        // 格式2: POST /faucet
        {
          url: `${faucetUrl}/faucet`,
          method: 'POST',
          body: { address }
        },
        // 格式3: GET 参数格式
        {
          url: `${faucetUrl}?address=${address}&denom=${denom}`,
          method: 'GET'
        },
        // 格式4: POST /request
        {
          url: `${faucetUrl}/request`,
          method: 'POST',
          body: { 
            address,
            coins: [`${amount || '10000000'}${denom}`]
          }
        }
      ];

      let lastError: any = null;

      for (const format of apiFormats) {
        try {
          const response = await fetch(format.url, {
            method: format.method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: format.method === 'POST' ? JSON.stringify(format.body) : undefined
          });

          if (response.ok) {
            const result = await response.json();
            console.log('水龙头响应:', result);
            
            return {
              success: true,
              message: `成功从水龙头获取代币！`,
              txHash: result.txhash || result.tx_hash || result.hash
            };
          } else {
            const errorText = await response.text();
            console.warn(`水龙头 API 格式 ${format.url} 失败:`, response.status, errorText);
            lastError = new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (error) {
          console.warn(`水龙头 API 格式 ${format.url} 异常:`, error);
          lastError = error;
        }
      }

      // 如果所有格式都失败，抛出最后一个错误
      throw lastError || new Error('所有水龙头 API 格式都失败');

    } catch (error) {
      console.error('水龙头请求失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '水龙头请求失败'
      };
    }
  }

  // 检查水龙头状态
  async checkFaucetStatus(): Promise<{ available: boolean; message: string }> {
    if (!CHAIN_CONFIG.faucetEndpoint) {
      return {
        available: false,
        message: '水龙头端点未配置'
      };
    }

    try {
      const response = await fetch(CHAIN_CONFIG.faucetEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return {
          available: true,
          message: '水龙头服务可用'
        };
      } else {
        return {
          available: false,
          message: `水龙头服务不可用 (HTTP ${response.status})`
        };
      }
    } catch (error) {
      return {
        available: false,
        message: '无法连接到水龙头服务'
      };
    }
  }

  // 获取网络状态
  async getNetworkStatus() {
    if (!this.tmClient) {
      await this.initClients();
    }
    
    const status = await this.tmClient!.status();
    return {
      nodeInfo: status.nodeInfo,
      syncInfo: status.syncInfo,
      validatorInfo: status.validatorInfo
    };
  }
}

export const cosmosService = new CosmosService();