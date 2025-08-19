import { create } from 'zustand';
import { WalletInfo, Balance } from '../types';
import { cosmosService } from '../services/cosmosService';
import { cleanMnemonic, validateMnemonic, getErrorMessage } from '../utils/helpers';

interface WalletState {
  currentWallet: WalletInfo | null;
  wallets: WalletInfo[];
  balances: Balance[];
  isLoading: boolean;
  error: string | null;
  faucetStatus: { available: boolean; message: string } | null;
  
  // Actions
  createWallet: () => Promise<void>;
  importWallet: (mnemonic: string) => Promise<void>;
  selectWallet: (wallet: WalletInfo) => void;
  getBalances: () => Promise<void>;
  requestFaucetTokens: (denom?: string, amount?: string) => Promise<{ success: boolean; message: string; txHash?: string }>;
  checkFaucetStatus: () => Promise<void>;
  clearError: () => void;
  saveWalletToStorage: (wallet: WalletInfo) => void;
  loadWalletsFromStorage: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  currentWallet: null,
  wallets: [],
  balances: [],
  isLoading: false,
  error: null,
  faucetStatus: null,

  createWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await cosmosService.createWallet();
      const { wallets } = get();
      const updatedWallets = [...wallets, wallet];
      
      set({ 
        currentWallet: wallet,
        wallets: updatedWallets,
        isLoading: false 
      });
      
      get().saveWalletToStorage(wallet);
    } catch (error) {
      set({ 
        error: getErrorMessage(error),
        isLoading: false 
      });
    }
  },

  importWallet: async (mnemonic: string) => {
    set({ isLoading: true, error: null });
    try {
      // 清理和验证助记词
      const cleanedMnemonic = cleanMnemonic(mnemonic);
      
      if (!validateMnemonic(cleanedMnemonic)) {
        set({ 
          error: '无效的助记词格式。请确保输入12、15、18、21或24个单词，用空格分隔',
          isLoading: false 
        });
        return;
      }

      const wallet = await cosmosService.importWallet(cleanedMnemonic);
      const { wallets } = get();
      
      // 检查钱包是否已存在
      const exists = wallets.some(w => w.address === wallet.address);
      if (exists) {
        set({ 
          error: '钱包已存在',
          isLoading: false 
        });
        return;
      }
      
      const updatedWallets = [...wallets, wallet];
      set({ 
        currentWallet: wallet,
        wallets: updatedWallets,
        isLoading: false 
      });
      
      get().saveWalletToStorage(wallet);
    } catch (error) {
      set({ 
        error: getErrorMessage(error),
        isLoading: false 
      });
    }
  },

  selectWallet: (wallet: WalletInfo) => {
    set({ currentWallet: wallet });
    get().getBalances();
  },

  getBalances: async () => {
    const { currentWallet } = get();
    if (!currentWallet) return;
    
    set({ isLoading: true, error: null });
    try {
      const balances = await cosmosService.getBalance(currentWallet.address);
      set({ balances, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error),
        isLoading: false 
      });
    }
  },

  requestFaucetTokens: async (denom: string = 'stake', amount?: string) => {
    const { currentWallet } = get();
    if (!currentWallet) {
      throw new Error('请先选择钱包');
    }
    
    set({ isLoading: true, error: null });
    try {
      const result = await cosmosService.requestFromFaucet(
        currentWallet.address,
        denom,
        amount
      );
      
      set({ isLoading: false });
      
      if (result.success) {
        // 等待一段时间后刷新余额
        setTimeout(() => {
          get().getBalances();
        }, 3000);
      } else {
        set({ error: result.message });
      }
      
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  checkFaucetStatus: async () => {
    try {
      const status = await cosmosService.checkFaucetStatus();
      set({ faucetStatus: status });
    } catch (error) {
      set({ 
        faucetStatus: {
          available: false,
          message: '检查水龙头状态失败'
        }
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  saveWalletToStorage: (wallet: WalletInfo) => {
    try {
      const { wallets } = get();
      const updatedWallets = wallets.some(w => w.address === wallet.address) 
        ? wallets 
        : [...wallets, wallet];
      localStorage.setItem('cosmos_wallets', JSON.stringify(updatedWallets));
    } catch (error) {
      console.error('保存钱包到本地存储失败:', error);
    }
  },

  loadWalletsFromStorage: () => {
    try {
      const stored = localStorage.getItem('cosmos_wallets');
      if (stored) {
        const wallets = JSON.parse(stored);
        // 验证加载的钱包数据
        const validWallets = wallets.filter((wallet: any) => 
          wallet.address && 
          wallet.mnemonic && 
          typeof wallet.address === 'string' &&
          typeof wallet.mnemonic === 'string'
        );
        set({ wallets: validWallets });
      }
    } catch (error) {
      console.error('从本地存储加载钱包失败:', error);
      // 清除损坏的数据
      localStorage.removeItem('cosmos_wallets');
    }
  }
}));