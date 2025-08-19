import React, { useState } from 'react';
import { ChainInfo } from './components/ChainInfo/ChainInfo';
import { WalletManager } from './components/WalletManager/WalletManager';
import { Transfer } from './components/Transfer/Transfer';
import { DataQuery } from './components/DataQuery/DataQuery';
import './App.css';

type TabType = 'chain' | 'wallet' | 'transfer' | 'query';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chain');

  const tabs = [
    { id: 'chain' as TabType, label: '链信息', icon: '🔗' },
    { id: 'wallet' as TabType, label: '钱包管理', icon: '👛' },
    { id: 'transfer' as TabType, label: '转账', icon: '💸' },
    { id: 'query' as TabType, label: '数据查询', icon: '🔍' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'chain':
        return <ChainInfo />;
      case 'wallet':
        return <WalletManager />;
      case 'transfer':
        return <Transfer />;
      case 'query':
        return <DataQuery />;
      default:
        return <ChainInfo />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="app-icon">🌌</span>
            Cosmos 链前端
          </h1>
          <p className="app-subtitle">基于 React + TypeScript + Zustand + Vite 的区块链交互界面</p>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-content">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <div className="main-content">
          {renderContent()}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 Cosmos 链前端. 使用 React + TypeScript + Zustand + Vite 构建</p>
          <div className="footer-links">
            <a href="https://cosmos.network/" target="_blank" rel="noopener noreferrer">
              Cosmos 官网
            </a>
            <a href="https://github.com/cosmos/cosmjs" target="_blank" rel="noopener noreferrer">
              CosmJS 文档
            </a>
            <a href="https://docs.ignite.com/" target="_blank" rel="noopener noreferrer">
              Ignite CLI
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;