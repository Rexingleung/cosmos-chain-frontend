import { create } from 'zustand';
import { BlockInfo, Transaction } from '../types';
import { cosmosService } from '../services/cosmosService';

interface ChainState {
  height: number;
  blockInfo: BlockInfo | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  getChainHeight: () => Promise<void>;
  getBlockInfo: (height?: number) => Promise<void>;
  getTransaction: (txHash: string) => Promise<void>;
  clearError: () => void;
  initializeChain: () => Promise<void>;
}

export const useChainStore = create<ChainState>((set, get) => ({
  height: 0,
  blockInfo: null,
  transactions: [],
  isLoading: false,
  error: null,
  isConnected: false,

  getChainHeight: async () => {
    set({ isLoading: true, error: null });
    try {
      const height = await cosmosService.getChainHeight();
      set({ height, isLoading: false, isConnected: true });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取链高度失败',
        isLoading: false,
        isConnected: false
      });
    }
  },

  getBlockInfo: async (height?: number) => {
    set({ isLoading: true, error: null });
    try {
      const blockInfo = await cosmosService.getBlockInfo(height);
      set({ blockInfo, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取区块信息失败',
        isLoading: false 
      });
    }
  },

  getTransaction: async (txHash: string) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await cosmosService.getTransaction(txHash);
      if (transaction) {
        const { transactions } = get();
        const exists = transactions.some(tx => tx.hash === transaction.hash);
        if (!exists) {
          set({ 
            transactions: [transaction, ...transactions],
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
        }
      } else {
        set({ 
          error: '交易未找到',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取交易失败',
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  initializeChain: async () => {
    try {
      await cosmosService.initClients();
      await get().getChainHeight();
      await get().getBlockInfo();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '初始化链连接失败',
        isConnected: false
      });
    }
  }
}));