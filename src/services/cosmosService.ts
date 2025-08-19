import { StargateClient, SigningStargateClient } from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { generateMnemonic } from 'bip39';
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
      this.tmClient = await Tendermint37Client.connect(CHAIN_CONFIG.rpcEndpoint);
      this.stargateClient = await StargateClient.connect(CHAIN_CONFIG.rpcEndpoint);
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
        memo: tx.tx.memo,
        success: tx.code === 0,
        messages: tx.tx.body.messages.map(msg => ({
          type: msg.typeUrl,
          // 根据实际消息类型解析更多字段
        }))
      };
    } catch (error) {
      console.error('获取交易失败:', error);
      return null;
    }
  }

  // 转账
  async transfer(
    mnemonic: string, 
    transferForm: TransferForm
  ): Promise<string> {
    try {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: 'cosmos'
      });
      
      const client = await SigningStargateClient.connectWithSigner(
        CHAIN_CONFIG.rpcEndpoint,
        wallet,
        { gasPrice: DEFAULT_GAS_PRICE }
      );
      
      const [account] = await wallet.getAccounts();
      
      const result = await client.sendTokens(
        account.address,
        transferForm.toAddress,
        [{ denom: transferForm.denom, amount: transferForm.amount }],
        {
          amount: [{ denom: 'stake', amount: '5000' }],
          gas: DEFAULT_GAS_LIMIT.toString()
        },
        transferForm.memo || ''
      );
      
      return result.transactionHash;
    } catch (error) {
      console.error('转账失败:', error);
      throw error;
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