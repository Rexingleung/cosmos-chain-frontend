import React, { useState, useEffect } from 'react';
import { ChainInfo } from './components/ChainInfo/ChainInfo';
import { WalletManager } from './components/WalletManager/WalletManager';
import { Faucet } from './components/Faucet/Faucet';
import { Transfer } from './components/Transfer/Transfer';
import { DataQuery } from './components/DataQuery/DataQuery';
import { DebugMnemonic } from './components/DebugMnemonic';
import { useChainStore } from './stores/chainStore';
import { useWalletStore } from './stores/walletStore';
import './App.css';

type TabType = 'chain' | 'wallet' | 'faucet' | 'transfer' | 'query' | 'debug';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chain');
  const { initializeChain } = useChainStore();
  const { loadWalletsFromStorage } = useWalletStore();

  useEffect(() => {
    // 初始化链连接和加载钱包
    initializeChain();
    loadWalletsFromStorage();
  }, [initializeChain, loadWalletsFromStorage]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chain':
        return <ChainInfo />;
      case 'wallet':
        return <WalletManager />;
      case 'faucet':
        return <Faucet />;
      case 'transfer':
        return <Transfer />;
      case 'query':
        return <DataQuery />;
      case 'debug':
        return <DebugMnemonic />;
      default:
        return <ChainInfo />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🌌 Cosmos 链前端交互界面</h1>
          <p>基于 React + TypeScript + CosmJS 的区块链交互工具</p>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-content">
          <button
            className={`nav-tab ${activeTab === 'chain' ? 'active' : ''}`}
            onClick={() => setActiveTab('chain')}
          >
            🔗 链信息
          </button>
          <button
            className={`nav-tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            👛 钱包管理
          </button>
          <button
            className={`nav-tab ${activeTab === 'faucet' ? 'active' : ''}`}
            onClick={() => setActiveTab('faucet')}
          >
            💧 水龙头
          </button>
          <button
            className={`nav-tab ${activeTab === 'transfer' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            💸 转账
          </button>
          <button
            className={`nav-tab ${activeTab === 'query' ? 'active' : ''}`}
            onClick={() => setActiveTab('query')}
          >
            🔍 数据查询
          </button>
          <button
            className={`nav-tab ${activeTab === 'debug' ? 'active' : ''}`}
            onClick={() => setActiveTab('debug')}
          >
            🔧 调试工具
          </button>
        </div>
      </nav>

      <main className="app-main">
        <div className="main-content">
          {renderTabContent()}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            🛠️ 开发工具 | 🚀 
            <a href="https://github.com/Rexingleung/cosmos-chain-frontend" target="_blank" rel="noopener noreferrer">
              GitHub 仓库
            </a> | 
            📚 <a href="https://docs.cosmos.network/" target="_blank" rel="noopener noreferrer">
              Cosmos 文档
            </a>
          </p>
          <p className="warning">
            ⚠️ 仅用于开发和测试，请勿在生产环境中使用真实资产
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;