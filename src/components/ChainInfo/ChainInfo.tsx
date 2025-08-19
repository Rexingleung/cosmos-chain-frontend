import React, { useEffect } from 'react';
import { useChainStore } from '../../stores/chainStore';
import './ChainInfo.css';

export const ChainInfo: React.FC = () => {
  const {
    height,
    blockInfo,
    isLoading,
    error,
    isConnected,
    getChainHeight,
    getBlockInfo,
    clearError,
    initializeChain
  } = useChainStore();

  useEffect(() => {
    initializeChain();
  }, [initializeChain]);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        getChainHeight();
        getBlockInfo();
      }, 5000); // 每5秒刷新一次

      return () => clearInterval(interval);
    }
  }, [isConnected, getChainHeight, getBlockInfo]);

  const handleRefresh = () => {
    clearError();
    getChainHeight();
    getBlockInfo();
  };

  return (
    <div className="chain-info">
      <div className="chain-info-header">
        <h2>链信息</h2>
        <button 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="refresh-btn"
        >
          {isLoading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>错误: {error}</span>
          <button onClick={clearError} className="close-btn">×</button>
        </div>
      )}

      <div className="connection-status">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '已连接' : '未连接'}
        </span>
      </div>

      <div className="chain-stats">
        <div className="stat-item">
          <label>当前高度:</label>
          <span className="stat-value">{height || '-'}</span>
        </div>

        {blockInfo && (
          <>
            <div className="stat-item">
              <label>区块哈希:</label>
              <span className="stat-value hash">{blockInfo.hash}</span>
            </div>
            
            <div className="stat-item">
              <label>区块时间:</label>
              <span className="stat-value">
                {new Date(blockInfo.time).toLocaleString('zh-CN')}
              </span>
            </div>
            
            <div className="stat-item">
              <label>交易数量:</label>
              <span className="stat-value">{blockInfo.txCount}</span>
            </div>
            
            <div className="stat-item">
              <label>提议者:</label>
              <span className="stat-value hash">{blockInfo.proposer}</span>
            </div>
          </>
        )}
      </div>

      <div className="chain-actions">
        <button 
          onClick={() => getBlockInfo(height - 1)}
          disabled={!height || height <= 1 || isLoading}
          className="action-btn"
        >
          查看上一区块
        </button>
        
        <button 
          onClick={() => getBlockInfo()}
          disabled={isLoading}
          className="action-btn"
        >
          查看最新区块
        </button>
      </div>
    </div>
  );
};