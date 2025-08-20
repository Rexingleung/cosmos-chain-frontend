import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { cosmosService } from '../../services/cosmosService';
import './Faucet.css';

export const Faucet: React.FC = () => {
  const { 
    currentWallet, 
    faucetStatus, 
    requestFaucetTokens, 
    checkFaucetStatus,
    getBalances 
  } = useWalletStore();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [customAmount, setCustomAmount] = useState('10');
  const [selectedDenom, setSelectedDenom] = useState('stake');

  useEffect(() => {
    checkFaucetStatus();
  }, [checkFaucetStatus]);

  const handleRequest = async (denom: string, amount?: string) => {
    if (!currentWallet) {
      setMessage('请先创建或选择钱包');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const requestAmount = amount ? (parseInt(amount) * 1000000).toString() : undefined;
      const result = await requestFaucetTokens(denom, requestAmount);
      
      if (result.success) {
        setMessage(`成功获取 ${amount || '10'} ${denom} 代币！${result.txHash ? `\n交易哈希: ${result.txHash}` : ''}`);
        setMessageType('success');
        
        // 延迟刷新余额
        setTimeout(() => {
          getBalances();
        }, 3000);
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '请求失败');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomRequest = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('请输入有效的代币数量');
      setMessageType('error');
      return;
    }
    
    await handleRequest(selectedDenom, customAmount);
  };

  if (!faucetStatus) {
    return (
      <div className="faucet">
        <div className="faucet-header">
          <h2>💧 水龙头</h2>
        </div>
        <div className="loading">检查水龙头状态中...</div>
      </div>
    );
  }

  if (!faucetStatus.available) {
    return (
      <div className="faucet">
        <div className="faucet-header">
          <h2>💧 水龙头</h2>
        </div>
        <div className="faucet-unavailable">
          <div className="unavailable-message">
            <h3>水龙头服务不可用</h3>
            <p>{faucetStatus.message}</p>
            <button 
              onClick={checkFaucetStatus}
              className="retry-btn"
            >
              重新检查
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faucet">
      <div className="faucet-header">
        <h2>💧 水龙头</h2>
        <div className="faucet-status-indicator available">
          水龙头服务可用
        </div>
      </div>

      {!currentWallet && (
        <div className="no-wallet">
          <p>请先创建或导入钱包以使用水龙头功能</p>
        </div>
      )}

      {message && (
        <div className={`message ${messageType}`}>
          <span style={{ whiteSpace: 'pre-line' }}>{message}</span>
          <button onClick={() => setMessage(null)} className="close-btn">×</button>
        </div>
      )}

      {currentWallet && (
        <div className="faucet-content">
          <div className="current-wallet-info">
            <h3>当前钱包</h3>
            <div className="wallet-address">
              {`${currentWallet.address}`}
            </div>
          </div>

          <div className="quick-actions">
            <h3>快速获取代币</h3>
            <div className="quick-buttons">
              <button
                onClick={() => handleRequest('stake', '10')}
                disabled={isLoading}
                className="quick-btn stake"
              >
                <span className="emoji">⚡</span>
                <span className="text">获取 10 stake</span>
              </button>
              
              <button
                onClick={() => handleRequest('token', '10')}
                disabled={isLoading}
                className="quick-btn token"
              >
                <span className="emoji">🪙</span>
                <span className="text">获取 10 token</span>
              </button>

              <button
                onClick={() => handleRequest('stake', '100')}
                disabled={isLoading}
                className="quick-btn large"
              >
                <span className="emoji">💎</span>
                <span className="text">获取 100 stake</span>
              </button>
            </div>
          </div>

          <div className="custom-request">
            <h3>自定义请求</h3>
            <div className="custom-form">
              <div className="form-row">
                <div className="form-group">
                  <label>代币类型:</label>
                  <select
                    value={selectedDenom}
                    onChange={(e) => setSelectedDenom(e.target.value)}
                    className="denom-select"
                  >
                    <option value="stake">stake</option>
                    <option value="token">token</option>
                    <option value="uatom">uatom</option>
                    <option value="ucosm">ucosm</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>数量:</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="1"
                    max="1000"
                    className="amount-input"
                  />
                </div>
              </div>

              <button
                onClick={handleCustomRequest}
                disabled={isLoading}
                className="custom-request-btn"
              >
                {isLoading ? '请求中...' : `获取 ${customAmount} ${selectedDenom}`}
              </button>
            </div>
          </div>

          <div className="faucet-info">
            <h3>使用说明</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="icon">ℹ️</span>
                <span>每个地址每24小时可以请求一次代币</span>
              </div>
              <div className="info-item">
                <span className="icon">⏰</span>
                <span>代币发放通常需要几秒钟时间</span>
              </div>
              <div className="info-item">
                <span className="icon">🔄</span>
                <span>请求成功后余额会自动刷新</span>
              </div>
              <div className="info-item">
                <span className="icon">🛡️</span>
                <span>仅限测试网络使用，请勿用于生产环境</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};