import { create } from 'zustand';
import { WalletInfo, Balance } from '../types';
import { cosmosService } from '../services/cosmosService';

interface WalletState {
  currentWallet: WalletInfo | null;
  wallets: WalletInfo[];
  balances: Balance[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createWallet: () => Promise<void>;
  importWallet: (mnemonic: string) => Promise<void>;
  selectWallet: (wallet: WalletInfo) => void;
  getBalances: () => Promise<void>;
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
        error: error instanceof Error ? error.message : '创建钱包失败',
        isLoading: false 
      });
    }
  },

  importWallet: async (mnemonic: string) => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await cosmosService.importWallet(mnemonic);
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
        error: error instanceof Error ? error.message : '导入钱包失败',
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
        error: error instanceof Error ? error.message : '获取余额失败',
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  saveWalletToStorage: (wallet: WalletInfo) => {
    const { wallets } = get();
    const updatedWallets = wallets.some(w => w.address === wallet.address) 
      ? wallets 
      : [...wallets, wallet];
    localStorage.setItem('cosmos_wallets', JSON.stringify(updatedWallets));
  },

  loadWalletsFromStorage: () => {
    try {
      const stored = localStorage.getItem('cosmos_wallets');
      if (stored) {
        const wallets = JSON.parse(stored);
        set({ wallets });
      }
    } catch (error) {
      console.error('加载钱包失败:', error);
    }
  }
}));