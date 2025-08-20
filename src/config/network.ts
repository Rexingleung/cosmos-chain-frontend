import { ChainInfo } from '../types';

export const CHAIN_CONFIG: ChainInfo = {
  chainId: 'aaa',
  rpcEndpoint: 'http://localhost:26657',
  restEndpoint: 'http://localhost:1317',
  faucetEndpoint: 'http://localhost:4500'
};

export const DEFAULT_GAS_PRICE = '0.0025stake';  // 降低Gas价格
export const DEFAULT_GAS_LIMIT = 200000;

// 测试账户地址
export const ALICE_ADDRESS = 'cosmos129t9tm3kd5ju9dgmdt5hp0mcm3wncann2arvl5';
export const BOB_ADDRESS = 'cosmos19hf4pd460t6s399pz0q5wthtzzkpl9v5reay47';

// 链配置选项
export const CHAIN_OPTIONS = {
  prefix: 'cosmos',
  gasPrice: DEFAULT_GAS_PRICE,
  gasLimit: DEFAULT_GAS_LIMIT,
};