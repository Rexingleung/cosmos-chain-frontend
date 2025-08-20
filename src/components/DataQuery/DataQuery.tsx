import React, { useState } from 'react';
import { useChainStore } from '../../stores/chainStore';
import { useWalletStore } from '../../stores/walletStore';
import { cosmosService } from '../../services/cosmosService';
import { Transaction } from '../../types';
import './DataQuery.css';

export const DataQuery: React.FC = () => {
  const { blockInfo, transactions, getBlockInfo, getTransaction } = useChainStore();
  const { balances, getBalances } = useWalletStore();
  
  const [queryType, setQueryType] = useState<'block' | 'transaction' | 'balance'>('block');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<any>(null);

  const handleQuery = async () => {
    if (!inputValue.trim()) {
      setError('请输入查询参数');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQueryResult(null);

    try {
      switch (queryType) {
        case 'block':
          const height = parseInt(inputValue);
          if (isNaN(height) || height < 1) {
            setError('请输入有效的区块高度');
            setIsLoading(false);
            return;
          }
          await getBlockInfo(height);
          setQueryResult(blockInfo);
          break;

        case 'transaction':
          await getTransaction(inputValue.trim());
          const tx = transactions.find(t => t.hash === inputValue.trim());
          if (tx) {
            setQueryResult(tx);
          } else {
            setError('交易未找到');
          }
          break;

        case 'balance':
          const address = inputValue.trim();
          if (!address.startsWith('cosmos')) {
            setError('请输入有效的Cosmos地址');
            setIsLoading(false);
            return;
          }
          const balances = await cosmosService.getBalance(address);
          setQueryResult({ address, balances });
          break;

        default:
          setError('未知的查询类型');
      }
    } catch (error) {
      console.error('查询失败:', error);
      setError(error instanceof Error ? error.message : '查询失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setError(null);
    setQueryResult(null);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const formatBalance = (amount: string, denom: string) => {
    const value = parseInt(amount) / 1000000;
    return `${value.toLocaleString()} ${denom}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderBlockResult = (block: any) => (
    <div className="query-result">
      <h4>区块信息</h4>
      <div className="result-grid">
        <div className="result-item">
          <label>高度:</label>
          <span>{block.height}</span>
        </div>
        <div className="result-item">
          <label>哈希:</label>
          <div className="">
            <span>{block.hash}</span>
            <button onClick={() => copyToClipboard(block.hash)} className="copy-btn">📋</button>
          </div>
        </div>
        <div className="result-item">
          <label>时间:</label>
          <span>{formatTimestamp(block.time)}</span>
        </div>
        <div className="result-item">
          <label>交易数量:</label>
          <span>{block.txCount}</span>
        </div>
        <div className="result-item">
          <label>提议者:</label>
          <div className="">
            <span>{block.proposer}</span>
            <button onClick={() => copyToClipboard(block.proposer)} className="copy-btn">📋</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactionResult = (tx: Transaction) => (
    <div className="query-result">
      <h4>交易信息</h4>
      <div className="result-grid">
        <div className="result-item">
          <label>哈希:</label>
          <div className="hash-value">
            <span>{tx.hash}</span>
            <button onClick={() => copyToClipboard(tx.hash)} className="copy-btn">📋</button>
          </div>
        </div>
        <div className="result-item">
          <label>区块高度:</label>
          <span>{tx.height}</span>
        </div>
        <div className="result-item">
          <label>时间戳:</label>
          <span>{formatTimestamp(tx.timestamp)}</span>
        </div>
        <div className="result-item">
          <label>状态:</label>
          <span className={`status ${tx.success ? 'success' : 'failed'}`}>
            {tx.success ? '成功' : '失败'}
          </span>
        </div>
        <div className="result-item">
          <label>手续费:</label>
          <span>{tx.fee} gas</span>
        </div>
        <div className="result-item">
          <label>Gas使用:</label>
          <span>{tx.gas}</span>
        </div>
        {tx.memo && (
          <div className="result-item">
            <label>备注:</label>
            <span>{tx.memo}</span>
          </div>
        )}
      </div>
      
      {tx.messages && tx.messages.length > 0 && (
        <div className="messages-section">
          <h5>交易消息</h5>
          {tx.messages.map((msg, index) => (
            <div key={index} className="message-item">
              <div className="message-type">{msg.type}</div>
              {msg.from && <div>发送方: {msg.from}</div>}
              {msg.to && <div>接收方: {msg.to}</div>}
              {msg.amount && <div>金额: {formatBalance(msg.amount, msg.denom || 'stake')}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBalanceResult = (result: { address: string; balances: any[] }) => (
    <div className="query-result">
      <h4>余额信息</h4>
      <div className="result-grid">
        <div className="result-item">
          <label>地址:</label>
          <div className="hash-value">
            <span>{result.address}</span>
            <button onClick={() => copyToClipboard(result.address)} className="copy-btn">📋</button>
          </div>
        </div>
      </div>
      
      <div className="balances-section">
        <h5>代币余额</h5>
        {result.balances.length > 0 ? (
          <div className="balance-list">
            {result.balances.map((balance, index) => (
              <div key={index} className="balance-item">
                <span className="balance-amount">
                  {formatBalance(balance.amount, balance.denom)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-balance">该地址暂无余额</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="data-query">
      <div className="query-header">
        <h2>数据查询</h2>
      </div>

      <div className="query-form">
        <div className="query-type-selector">
          <label>查询类型:</label>
          <div className="type-buttons">
            <button
              className={`type-btn ${queryType === 'block' ? 'active' : ''}`}
              onClick={() => setQueryType('block')}
            >
              区块查询
            </button>
            <button
              className={`type-btn ${queryType === 'transaction' ? 'active' : ''}`}
              onClick={() => setQueryType('transaction')}
            >
              交易查询
            </button>
            <button
              className={`type-btn ${queryType === 'balance' ? 'active' : ''}`}
              onClick={() => setQueryType('balance')}
            >
              余额查询
            </button>
          </div>
        </div>

        <div className="query-input-section">
          <label>
            {queryType === 'block' && '区块高度:'}
            {queryType === 'transaction' && '交易哈希:'}
            {queryType === 'balance' && '钱包地址:'}
          </label>
          <div className="input-group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                queryType === 'block' ? '输入区块高度 (例: 100)' :
                queryType === 'transaction' ? '输入交易哈希' :
                '输入Cosmos地址 (cosmos...)'
              }
              className="query-input"
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            />
            <button
              onClick={handleQuery}
              disabled={isLoading || !inputValue.trim()}
              className="query-btn"
            >
              {isLoading ? '查询中...' : '查询'}
            </button>
            <button
              onClick={handleClear}
              className="clear-btn"
            >
              清除
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-btn">×</button>
          </div>
        )}
      </div>

      {queryResult && (
        <div className="query-results">
          {queryType === 'block' && renderBlockResult(queryResult)}
          {queryType === 'transaction' && renderTransactionResult(queryResult)}
          {queryType === 'balance' && renderBalanceResult(queryResult)}
        </div>
      )}

      <div className="query-examples">
        <h4>查询示例</h4>
        <div className="examples-grid">
          <div className="example-item">
            <h5>区块查询</h5>
            <p>输入区块高度，例如: 1, 100, 1000</p>
          </div>
          <div className="example-item">
            <h5>交易查询</h5>
            <p>输入完整的交易哈希值</p>
          </div>
          <div className="example-item">
            <h5>余额查询</h5>
            <p>输入Cosmos地址查看该地址的所有代币余额</p>
          </div>
        </div>
      </div>
    </div>
  );
};