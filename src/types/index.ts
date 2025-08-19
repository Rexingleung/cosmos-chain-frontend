export interface WalletInfo {
  address: string;
  mnemonic: string;
  name?: string;
}

export interface ChainInfo {
  chainId: string;
  rpcEndpoint: string;
  restEndpoint: string;
  faucetEndpoint?: string;
}

export interface Balance {
  denom: string;
  amount: string;
}

export interface BlockInfo {
  height: number;
  hash: string;
  time: string;
  proposer: string;
  txCount: number;
}

export interface Transaction {
  hash: string;
  height: number;
  timestamp: string;
  fee: string;
  gas: string;
  memo?: string;
  success: boolean;
  messages: TxMessage[];
}

export interface TxMessage {
  type: string;
  from?: string;
  to?: string;
  amount?: string;
  denom?: string;
}

export interface TransferForm {
  toAddress: string;
  amount: string;
  denom: string;
  memo?: string;
}
