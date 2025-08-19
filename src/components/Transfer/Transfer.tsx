import React, { useState } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { cosmosService } from '../../services/cosmosService';
import { TransferForm } from '../../types';
import { ALICE_ADDRESS, BOB_ADDRESS } from '../../config/network';
import './Transfer.css';

export const Transfer: React.FC = () => {
  const { currentWallet, balances, getBalances } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [form, setForm] = useState<TransferForm>({
    toAddress: '',
    amount: '',
    denom: 'stake',
    memo: ''
  });

  const handleInputChange = (field: keyof TransferForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除错误信息
    if (error) setError(null);
  };

  const handleQuickFill = (address: string) => {
    setForm(prev => ({
      ...prev,
      toAddress: address
    }));
  };

  const validateForm = (): boolean => {
    if (!currentWallet) {
      setError('请先连接钱包');
      return false;
    }

    if (!form.toAddress.trim()) {
      setError('请输入接收地址');
      return false;
    }

    if (!form.toAddress.startsWith('cosmos')) {
      setError('无效的Cosmos地址');
      return false;
    }

    if (form.toAddress === currentWallet.address) {
      setError('不能向自己转账');
      return false;
    }

    if (!form.amount.trim() || parseFloat(form.amount) <= 0) {
      setError('请输入有效的转账金额');
      return false;
    }

    if (!form.denom.trim()) {
      setError('请选择代币类型');
      return false;
    }

    // 检查余额是否足够
    const balance = balances.find(b => b.denom === form.denom);
    if (!balance) {
      setError(`您没有 ${form.denom} 代币`);
      return false;
    }

    const balanceAmount = parseInt(balance.amount) / 1000000; // 转换为基本单位
    const transferAmount = parseFloat(form.amount);
    
    if (transferAmount > balanceAmount) {
      setError(`余额不足。当前余额: ${balanceAmount} ${form.denom}`);
      return false;
    }

    return true;
  };

  const handleTransfer = async () => {
    if (!validateForm() || !currentWallet) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 将金额转换为微单位
      const amountInMicroUnits = (parseFloat(form.amount) * 1000000).toString();
      
      const transferForm: TransferForm = {
        ...form,
        amount: amountInMicroUnits
      };

      const txHash = await cosmosService.transfer(
        currentWallet.mnemonic,
        transferForm
      );

      setSuccess(`转账成功！交易哈希: ${txHash}`);
      
      // 重置表单
      setForm({
        toAddress: '',
        amount: '',
        denom: 'stake',
        memo: ''
      });

      // 刷新余额
      await getBalances();
      
    } catch (error) {
      console.error('转账失败:', error);
      setError(error instanceof Error ? error.message : '转账失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableBalance = (denom: string): string => {
    const balance = balances.find(b => b.denom === denom);
    if (!balance) return '0';
    return (parseInt(balance.amount) / 1000000).toLocaleString();
  };

  const handleMaxAmount = () => {
    const balance = balances.find(b => b.denom === form.denom);
    if (balance) {
      const maxAmount = parseInt(balance.amount) / 1000000;
      // 保留一些代币用于手续费
      const transferAmount = Math.max(0, maxAmount - 0.01);
      setForm(prev => ({
        ...prev,
        amount: transferAmount.toString()
      }));
    }
  };

  if (!currentWallet) {
    return (
      <div className="transfer">
        <div className="transfer-header">
          <h2>转账</h2>
        </div>
        <div className="no-wallet">
          <p>请先创建或导入钱包以使用转账功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transfer">
      <div className="transfer-header">
        <h2>转账</h2>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="close-btn">×</button>
        </div>
      )}

      <div className="transfer-form">
        <div className="form-group">
          <label>发送地址:</label>
          <div className="sender-address">
            <span>{currentWallet.address}</span>
          </div>
        </div>

        <div className="form-group">
          <label>接收地址:</label>
          <input
            type="text"
            value={form.toAddress}
            onChange={(e) => handleInputChange('toAddress', e.target.value)}
            placeholder="输入Cosmos地址 (cosmos...)"
            className="address-input"
          />
          <div className="quick-fill">
            <span>快速填入:</span>
            <button 
              onClick={() => handleQuickFill(ALICE_ADDRESS)}
              className="quick-fill-btn"
              type="button"
            >
              Alice
            </button>
            <button 
              onClick={() => handleQuickFill(BOB_ADDRESS)}
              className="quick-fill-btn"
              type="button"
            >
              Bob
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>代币类型:</label>
          <select
            value={form.denom}
            onChange={(e) => handleInputChange('denom', e.target.value)}
            className="denom-select"
          >
            {balances.length > 0 ? (
              balances.map((balance, index) => (
                <option key={index} value={balance.denom}>
                  {balance.denom}
                </option>
              ))
            ) : (
              <option value="stake">stake</option>
            )}
          </select>
          <div className="balance-info">
            可用余额: {getAvailableBalance(form.denom)} {form.denom}
          </div>
        </div>

        <div className="form-group">
          <label>转账金额:</label>
          <div className="amount-input-group">
            <input
              type="number"
              value={form.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.000001"
              className="amount-input"
            />
            <button 
              onClick={handleMaxAmount}
              className="max-btn"
              type="button"
            >
              最大值
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>备注 (可选):</label>
          <input
            type="text"
            value={form.memo}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            placeholder="输入交易备注"
            className="memo-input"
          />
        </div>

        <div className="form-actions">
          <button
            onClick={handleTransfer}
            disabled={isLoading}
            className="transfer-btn"
          >
            {isLoading ? '转账中...' : '确认转账'}
          </button>
        </div>

        <div className="transfer-info">
          <h4>转账信息</h4>
          <div className="info-item">
            <span>预估手续费:</span>
            <span>0.005 stake</span>
          </div>
          <div className="info-item">
            <span>预计到账时间:</span>
            <span>~6秒</span>
          </div>
        </div>
      </div>
    </div>
  );
};