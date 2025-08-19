import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import './WalletManager.css';

export const WalletManager: React.FC = () => {
  const {
    currentWallet,
    wallets,
    balances,
    isLoading,
    error,
    faucetStatus,
    createWallet,
    importWallet,
    selectWallet,
    getBalances,
    requestFaucetTokens,
    checkFaucetStatus,
    clearError,
    loadWalletsFromStorage
  } = useWalletStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadWalletsFromStorage();
    checkFaucetStatus();
  }, [loadWalletsFromStorage, checkFaucetStatus]);

  useEffect(() => {
    if (currentWallet) {
      getBalances();
    }
  }, [currentWallet, getBalances]);

  const handleCreateWallet = async () => {
    await createWallet();
    setShowCreateModal(false);
    setShowMnemonic(true);
  };

  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      return;
    }
    await importWallet(importMnemonic.trim());
    setShowImportModal(false);
    setImportMnemonic('');
  };

  const handleRequestFaucet = async (denom: string = 'stake') => {
    try {
      const result = await requestFaucetTokens(denom);
      if (result.success) {
        setFaucetSuccess(`成功获取 ${denom} 代币！${result.txHash ? `交易哈希: ${result.txHash}` : ''}`);
        setTimeout(() => setFaucetSuccess(null), 5000);
      }
    } catch (error) {
      console.error('水龙头请求失败:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatBalance = (amount: string, denom: string) => {
    const value = parseInt(amount) / 1000000; // 假设是微单位
    return `${value.toLocaleString()} ${denom}`;
  };

  return (
    <div className="wallet-manager">
      <div className="wallet-header">
        <h2>钱包管理</h2>
        <div className="wallet-actions">
          <button 
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
            className="create-btn"
          >
            创建钱包
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            disabled={isLoading}
            className="import-btn"
          >
            导入钱包
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={clearError} className="close-btn">×</button>
        </div>
      )}

      {faucetSuccess && (
        <div className="success-message">
          <span>{faucetSuccess}</span>
          <button onClick={() => setFaucetSuccess(null)} className="close-btn">×</button>
        </div>
      )}

      {/* 水龙头状态显示 */}
      {faucetStatus && (
        <div className="faucet-status">
          <div className={`status-indicator ${faucetStatus.available ? 'available' : 'unavailable'}`}>
            💧 水龙头状态: {faucetStatus.message}
          </div>
        </div>
      )}

      {currentWallet && (
        <div className="current-wallet">
          <h3>当前钱包</h3>
          <div className="wallet-info">
            <div className="wallet-address">
              <label>地址:</label>
              <span className="address">{currentWallet.address}</span>
              <button 
                onClick={() => copyToClipboard(currentWallet.address)}
                className="copy-btn"
                title="复制地址"
              >
                📋
              </button>
            </div>
            
            <div className="wallet-balances">
              <h4>余额</h4>
              {isLoading ? (
                <div className="loading">加载中...</div>
              ) : balances.length > 0 ? (
                <div className="balance-list">
                  {balances.map((balance, index) => (
                    <div key={index} className="balance-item">
                      <span className="balance-amount">
                        {formatBalance(balance.amount, balance.denom)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-balance">暂无余额</div>
              )}
              
              <div className="balance-actions">
                <button 
                  onClick={getBalances}
                  disabled={isLoading}
                  className="refresh-balance-btn"
                >
                  刷新余额
                </button>
                
                {/* 水龙头按钮 */}
                {faucetStatus?.available && (
                  <div className="faucet-actions">
                    <button 
                      onClick={() => handleRequestFaucet('stake')}
                      disabled={isLoading}
                      className="faucet-btn"
                      title="从水龙头获取 stake 代币"
                    >
                      💧 获取 stake
                    </button>
                    <button 
                      onClick={() => handleRequestFaucet('token')}
                      disabled={isLoading}
                      className="faucet-btn"
                      title="从水龙头获取 token 代币"
                    >
                      💧 获取 token
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {wallets.length > 0 && (
        <div className="wallet-list">
          <h3>钱包列表</h3>
          <div className="wallets">
            {wallets.map((wallet, index) => (
              <div 
                key={index} 
                className={`wallet-item ${currentWallet?.address === wallet.address ? 'active' : ''}`}
                onClick={() => selectWallet(wallet)}
              >
                <div className="wallet-address-short">
                  {`${wallet.address.slice(0, 10)}...${wallet.address.slice(-8)}`}
                </div>
                {currentWallet?.address === wallet.address && (
                  <span className="active-indicator">当前</span>
                )}
                {faucetStatus?.available && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      selectWallet(wallet);
                      setTimeout(() => handleRequestFaucet('stake'), 100);
                    }}
                    disabled={isLoading}
                    className="mini-faucet-btn"
                    title="获取代币"
                  >
                    💧
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 创建钱包模态框 */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>创建新钱包</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>点击下面的按钮创建一个新的钱包。系统将为您生成一个新的地址和助记词。</p>
              <p className="warning">⚠️ 请妥善保管您的助记词，它是恢复钱包的唯一方式。</p>
              {faucetStatus?.available && (
                <p className="faucet-info">💧 创建钱包后可以使用水龙头功能获取测试代币。</p>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)} className="cancel-btn">
                取消
              </button>
              <button onClick={handleCreateWallet} disabled={isLoading} className="confirm-btn">
                {isLoading ? '创建中...' : '创建钱包'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导入钱包模态框 */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>导入钱包</h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <label>助记词:</label>
              <textarea
                value={importMnemonic}
                onChange={(e) => setImportMnemonic(e.target.value)}
                placeholder="请输入12或24个单词的助记词，用空格分隔"
                rows={4}
                className="mnemonic-input"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowImportModal(false)} className="cancel-btn">
                取消
              </button>
              <button 
                onClick={handleImportWallet} 
                disabled={isLoading || !importMnemonic.trim()} 
                className="confirm-btn"
              >
                {isLoading ? '导入中...' : '导入钱包'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 显示助记词模态框 */}
      {showMnemonic && currentWallet && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>钱包创建成功</h3>
              <button 
                onClick={() => setShowMnemonic(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>您的钱包已成功创建！</p>
              <div className="wallet-details">
                <div className="detail-item">
                  <label>地址:</label>
                  <div className="detail-value">
                    <span>{currentWallet.address}</span>
                    <button 
                      onClick={() => copyToClipboard(currentWallet.address)}
                      className="copy-btn"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className="detail-item">
                  <label>助记词:</label>
                  <div className="detail-value mnemonic">
                    <span>{currentWallet.mnemonic}</span>
                    <button 
                      onClick={() => copyToClipboard(currentWallet.mnemonic)}
                      className="copy-btn"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
              <p className="warning">
                ⚠️ 请将助记词保存在安全的地方。这是恢复您钱包的唯一方式，丢失后无法找回！
              </p>
              {faucetStatus?.available && (
                <p className="faucet-info">
                  💧 钱包创建完成后，您可以点击"获取代币"按钮从水龙头获取测试代币。
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowMnemonic(false)} className="confirm-btn">
                我已保存
              </button>
              {faucetStatus?.available && (
                <button 
                  onClick={() => {
                    setShowMnemonic(false);
                    handleRequestFaucet('stake');
                  }}
                  className="faucet-btn"
                >
                  💧 立即获取代币
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};