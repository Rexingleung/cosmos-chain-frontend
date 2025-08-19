import { ChainInfo } from '../types';

export const CHAIN_CONFIG: ChainInfo = {
  chainId: 'aaa',
  rpcEndpoint: 'http://localhost:26657',
  restEndpoint: 'http://localhost:1317',
  faucetEndpoint: 'http://localhost:4500'
};

export const DEFAULT_GAS_PRICE = '0.025stake';
export const DEFAULT_GAS_LIMIT = 200000;

export const ALICE_ADDRESS = 'cosmos129t9tm3kd5ju9dgmdt5hp0mcm3wncann2arvl5';
export const BOB_ADDRESS = 'cosmos19hf4pd460t6s399pz0q5wthtzzkpl9v5reay47';
