import React, { useState } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { cosmosService } from '../../services/cosmosService';
import { TransferForm } from '../../types';
import { ALICE_ADDRESS, BOB_ADDRESS } from '../../config/network';
import { validateCosmosAddress, getErrorMessage, cleanMnemonic, validateMnemonic } from '../../utils/helpers';
import './Transfer.css';

type WalletSource = 'current' | 'mnemonic';

export const Transfer: React.FC = () => {
  const { currentWallet, balances, getBalances } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletSource, setWalletSource] = useState<WalletSource>('current');
  const [inputMnemonic, setInputMnemonic] = useState('');
  
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
    if (success) setSuccess(null);
  };

  const handleQuickFill = (address: string) => {
    setForm(prev => ({
      ...prev,
      toAddress: address
    }));
  };

  const handleWalletSourceChange = (source: WalletSource) => {
    setWalletSource(source);
    setError(null);
    setSuccess(null);
    if (source === 'mnemonic') {
      setInputMnemonic('');
    }
  };

  const validateForm = (): boolean => {
    // 验证钱包来源
    if (walletSource === 'current' && !currentWallet) {
      setError('请先创建或选择钱包，或选择使用助记词转账');
      return false;
    }

    if (walletSource === 'mnemonic') {
      if (!inputMnemonic.trim()) {
        setError('请输入助记词');
        return false;
      }
      
      const cleanedMnemonic = cleanMnemonic(inputMnemonic);
      if (!validateMnemonic(cleanedMnemonic)) {
        setError('无效的助记词格式。请确保输入12、15、18、21或24个单词，用空格分隔');
        return false;
      }
    }

    const trimmedAddress = form.toAddress.trim();
    if (!trimmedAddress) {
      setError('请输入接收地址');
      return false;
    }

    if (!validateCosmosAddress(trimmedAddress)) {
      setError('无效的Cosmos地址格式');
      return false;
    }

    // 如果使用当前钱包，检查是否向自己转账
    if (walletSource === 'current' && trimmedAddress === currentWallet!.address) {
      setError('不能向自己转账');
      return false;
    }

    const amount = parseFloat(form.amount);
    if (!form.amount.trim() || isNaN(amount) || amount <= 0) {
      setError('请输入有效的转账金额');
      return false;
    }

    if (!form.denom.trim()) {
      setError('请选择代币类型');
      return false;
    }

    // 只有使用当前钱包时才检查余额
    if (walletSource === 'current') {
      const balance = balances.find(b => b.denom === form.denom);
      if (!balance) {
        setError(`您没有 ${form.denom} 代币`);
        return false;
      }

      const balanceAmount = parseInt(balance.amount) / 1000000;
      const transferAmount = amount;
      
      if (transferAmount > balanceAmount) {
        setError(`余额不足。当前余额: ${balanceAmount.toLocaleString()} ${form.denom}`);
        return false;
      }

      // 检查是否保留足够的代币用于手续费
      if (form.denom === 'stake' && transferAmount > balanceAmount - 0.01) {
        setError('请保留一些代币用于支付手续费');
        return false;
      }
    }

    return true;
  };

  const handleTransfer = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 将金额转换为微单位
      const amountInMicroUnits = (parseFloat(form.amount) * 1000000).toString();
      console.log(form, 'form');
      
      const transferForm: TransferForm = {
        ...form,
        toAddress: form.toAddress.trim(),
        amount: amountInMicroUnits,
        memo: form.memo.trim()
      };

      console.log('开始转账:', transferForm);
      console.log('转账模式:', walletSource);

      // 根据选择的钱包来源获取助记词
      let mnemonic: string;
      let fromAddress: string;

      if (walletSource === 'current') {
        // 使用当前钱包模式
        if (!currentWallet) {
          throw new Error('当前钱包不存在');
        }
        mnemonic = cleanMnemonic(currentWallet.mnemonic);
        fromAddress = currentWallet.address;
        
        console.log('使用当前钱包:', fromAddress);
      } else {
        // 使用助记词模式
        if (!inputMnemonic.trim()) {
          throw new Error('助记词不能为空');
        }
        
        const cleanedMnemonic = cleanMnemonic(inputMnemonic);
        console.log('清理后的助记词长度:', cleanedMnemonic.split(' ').length);
        
        // 再次验证助记词格式
        if (!validateMnemonic(cleanedMnemonic)) {
          throw new Error('助记词格式验证失败');
        }
        
        mnemonic = cleanedMnemonic;
        
        // 临时创建钱包以获取地址
        try {
          const tempWallet = await cosmosService.importWallet(mnemonic);
          fromAddress = tempWallet.address;
          console.log('从助记词计算的地址:', fromAddress);
        } catch (importError) {
          console.error('助记词导入失败:', importError);
          throw new Error(`助记词无效: ${getErrorMessage(importError)}`);
        }
        
        // 检查是否向自己转账
        if (fromAddress === form.toAddress.trim()) {
          throw new Error('不能向自己转账');
        }
      }

      // 执行转账
      console.log('执行转账，使用助记词长度:', mnemonic.split(' ').length);
      const txHash = await cosmosService.transfer(mnemonic, transferForm);

      setSuccess(`转账成功！\n交易哈希: ${txHash}\n发送方: ${fromAddress}\n接收方: ${form.toAddress}\n金额: ${form.amount} ${form.denom}`);
      
      // 重置表单
      setForm({
        toAddress: '',
        amount: '',
        denom: 'stake',
        memo: ''
      });

      if (walletSource === 'mnemonic') {
        setInputMnemonic('');
      }

      // 如果使用当前钱包，延迟刷新余额
      if (walletSource === 'current') {
        setTimeout(async () => {
          await getBalances();
        }, 3000);
      }
      
    } catch (error) {
      console.error('转账失败详细信息:', error);
      
      // 更详细的错误处理
      let errorMessage = getErrorMessage(error);
      
      // 特别处理助记词相关错误
      if (walletSource === 'mnemonic') {
        if (errorMessage.includes('Base64') || errorMessage.includes('multiple of 4')) {
          errorMessage = '助记词格式错误。请检查：\n1. 确保单词数量正确（12或24个）\n2. 单词之间用单个空格分隔\n3. 没有多余的换行符或特殊字符\n4. 所有单词都是小写英文';
        } else if (errorMessage.includes('invalid mnemonic')) {
          errorMessage = '无效的助记词。请确保助记词正确且完整';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableBalance = (denom: string): string => {
    if (walletSource !== 'current') return '使用助记词时无法显示余额';
    const balance = balances.find(b => b.denom === denom);
    if (!balance) return '0';
    return (parseInt(balance.amount) / 1000000).toLocaleString();
  };

  const handleMaxAmount = () => {
    if (walletSource !== 'current') {
      setError('使用助记词时无法自动计算最大金额，请手动输入');
      return;
    }

    const balance = balances.find(b => b.denom === form.denom);
    if (balance) {
      const maxAmount = parseInt(balance.amount) / 1000000;
      // 保留一些代币用于手续费
      const transferAmount = Math.max(0, maxAmount - (form.denom === 'stake' ? 0.01 : 0));
      setForm(prev => ({
        ...prev,
        amount: transferAmount.toString()
      }));
    }
  };

  return (
    <div className="transfer">
      <div className="transfer-header">
        <h2>转账</h2>
      </div>

      {error && (
        <div className="error-message">
          <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span style={{ whiteSpace: 'pre-line' }}>{success}</span>
          <button onClick={() => setSuccess(null)} className="close-btn">×</button>
        </div>
      )}

      <div className="transfer-form">
        {/* 钱包来源选择 */}
        <div className="form-group">
          <label>转账方式:</label>
          <div className="wallet-source-selector">
            <select
              value={walletSource}
              onChange={(e) => handleWalletSourceChange(e.target.value as WalletSource)}
              className="wallet-source-select"
            >
              <option value="current">使用当前钱包</option>
              <option value="mnemonic">输入助记词</option>
            </select>
          </div>
          <div className="wallet-source-info">
            {walletSource === 'current' 
              ? '使用已选择的钱包进行转账，可查看余额和自动验证'
              : '通过输入助记词进行转账，适合临时或其他钱包转账'
            }
          </div>
        </div>

        {/* 发送方信息 */}
        <div className="form-group">
          <label>发送地址:</label>
          {walletSource === 'current' ? (
            currentWallet ? (
              <div className="sender-address">
                <span>{currentWallet.address}</span>
                <span className="wallet-label">当前钱包</span>
              </div>
            ) : (
              <div className="no-current-wallet">
                <p>未选择钱包，请先创建或导入钱包，或选择使用助记词转账</p>
              </div>
            )
          ) : (
            <div className="mnemonic-input-section">
              <textarea
                value={inputMnemonic}
                onChange={(e) => setInputMnemonic(e.target.value)}
                placeholder="请输入12或24个单词的助记词，用空格分隔&#10;&#10;示例格式：&#10;word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                rows={4}
                className="mnemonic-input"
              />
              <div className="mnemonic-hint">
                💡 提示: 请确保助记词格式正确 - 12或24个单词，用空格分隔，无多余字符
              </div>
              {inputMnemonic.trim() && (
                <div className="mnemonic-validation">
                  <span>单词数量: {inputMnemonic.trim().split(/\s+/).length}</span>
                  <span className={validateMnemonic(cleanMnemonic(inputMnemonic)) ? 'valid' : 'invalid'}>
                    {validateMnemonic(cleanMnemonic(inputMnemonic)) ? '✅ 格式正确' : '❌ 格式错误'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 接收地址 */}
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

        {/* 代币类型 */}
        <div className="form-group">
          <label>代币类型:</label>
          <select
            value={form.denom}
            onChange={(e) => handleInputChange('denom', e.target.value)}
            className="denom-select"
          >
            {walletSource === 'current' && balances.length > 0 ? (
              balances.map((balance, index) => (
                <option key={index} value={balance.denom}>
                  {balance.denom}
                </option>
              ))
            ) : (
              <>
                <option value="stake">stake</option>
                <option value="token">token</option>
                <option value="uatom">uatom</option>
                <option value="ucosm">ucosm</option>
              </>
            )}
          </select>
          <div className="balance-info">
            {walletSource === 'current' ? (
              `可用余额: ${getAvailableBalance(form.denom)} ${form.denom}`
            ) : (
              '使用助记词时无法显示余额，请确保有足够代币'
            )}
          </div>
        </div>

        {/* 转账金额 */}
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
              disabled={walletSource !== 'current'}
              title={walletSource !== 'current' ? '使用助记词时无法自动计算最大值' : '使用最大可用金额'}
            >
              最大值
            </button>
          </div>
        </div>

        {/* 备注 */}
        <div className="form-group">
          <label>备注 (可选):</label>
          <input
            type="text"
            value={form.memo}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            placeholder="输入交易备注"
            className="memo-input"
            maxLength={256}
          />
        </div>

        {/* 转账按钮 */}
        <div className="form-actions">
          <button
            onClick={handleTransfer}
            disabled={
              isLoading || 
              !form.toAddress.trim() || 
              !form.amount.trim() ||
              (walletSource === 'current' && !currentWallet) ||
              (walletSource === 'mnemonic' && (!inputMnemonic.trim() || !validateMnemonic(cleanMnemonic(inputMnemonic))))
            }
            className="transfer-btn"
          >
            {isLoading ? '转账中...' : '确认转账'}
          </button>
        </div>

        {/* 转账信息 */}
        <div className="transfer-info">
          <h4>转账信息</h4>
          <div className="info-item">
            <span>转账方式:</span>
            <span>{walletSource === 'current' ? '当前钱包' : '助记词输入'}</span>
          </div>
          <div className="info-item">
            <span>预估手续费:</span>
            <span>~0.005 stake</span>
          </div>
          <div className="info-item">
            <span>预计到账时间:</span>
            <span>~6秒</span>
          </div>
          <div className="info-item">
            <span>网络:</span>
            <span>本地测试网</span>
          </div>
          {form.amount && form.denom && (
            <div className="info-item">
              <span>微单位数量:</span>
              <span>{(parseFloat(form.amount || '0') * 1000000).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 转账提示 */}
        <div className="transfer-tips">
          <h4>转账提示</h4>
          <ul>
            <li>🔍 请仔细检查接收地址，转账不可撤销</li>
            <li>💰 请确保账户有足够的代币支付手续费</li>
            <li>⏰ 交易通常在几秒钟内完成</li>
            <li>📋 建议保存交易哈希用于查询</li>
            <li>🔐 使用助记词时请确保环境安全</li>
            <li>🛡️ 测试网络仅用于开发和测试</li>
            {walletSource === 'mnemonic' && (
              <li>📝 助记词必须是12或24个英文单词，用空格分隔</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};