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
      this.stargateClient = await StargateClient.connectWithSigner(
        CHAIN_CONFIG.rpcEndpoint,
        null as any
      );
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
      
      return {
        hash: tx.hash,
        height: tx.height,
        timestamp: new Date().toISOString(), // 实际实现中需要从区块获取时间戳
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