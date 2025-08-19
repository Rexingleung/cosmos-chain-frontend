import React, { useState } from 'react';
import { cleanMnemonic, validateMnemonic, getMnemonicWordCount } from '../utils/helpers';
import './DebugMnemonic.css';

export const DebugMnemonic: React.FC = () => {
  const [inputMnemonic, setInputMnemonic] = useState('');
  
  const handleInputChange = (value: string) => {
    setInputMnemonic(value);
  };

  const cleanedMnemonic = cleanMnemonic(inputMnemonic);
  const wordCount = getMnemonicWordCount(inputMnemonic);
  const isValid = validateMnemonic(inputMnemonic);
  const words = cleanedMnemonic.split(' ').filter(word => word.length > 0);

  return (
    <div className="debug-mnemonic">
      <div className="debug-header">
        <h3>🔧 助记词调试工具</h3>
        <p>用于检查和验证助记词格式</p>
      </div>

      <div className="debug-form">
        <div className="form-group">
          <label>输入助记词:</label>
          <textarea
            value={inputMnemonic}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="在此输入助记词进行检查..."
            rows={4}
            className="debug-input"
          />
        </div>

        {inputMnemonic.trim() && (
          <div className="debug-results">
            <h4>分析结果:</h4>
            
            <div className="result-item">
              <span className="label">原始输入长度:</span>
              <span className="value">{inputMnemonic.length} 字符</span>
            </div>

            <div className="result-item">
              <span className="label">清理后长度:</span>
              <span className="value">{cleanedMnemonic.length} 字符</span>
            </div>

            <div className="result-item">
              <span className="label">单词数量:</span>
              <span className={`value ${[12, 15, 18, 21, 24].includes(wordCount) ? 'valid' : 'invalid'}`}>
                {wordCount} 个单词
              </span>
            </div>

            <div className="result-item">
              <span className="label">格式验证:</span>
              <span className={`value ${isValid ? 'valid' : 'invalid'}`}>
                {isValid ? '✅ 通过' : '❌ 失败'}
              </span>
            </div>

            <div className="result-item">
              <span className="label">清理后的助记词:</span>
              <div className="mnemonic-display">
                {cleanedMnemonic || '(空)'}
              </div>
            </div>

            <div className="result-item">
              <span className="label">单词列表:</span>
              <div className="words-list">
                {words.map((word, index) => (
                  <span 
                    key={index} 
                    className={`word ${/^[a-z]{2,8}$/.test(word) ? 'valid-word' : 'invalid-word'}`}
                  >
                    {index + 1}. {word}
                  </span>
                ))}
              </div>
            </div>

            {!isValid && wordCount > 0 && (
              <div className="validation-issues">
                <h5>❌ 发现的问题:</h5>
                <ul>
                  {!([12, 15, 18, 21, 24].includes(wordCount)) && (
                    <li>单词数量错误：当前 {wordCount} 个，应该是 12、15、18、21 或 24 个</li>
                  )}
                  {words.some(word => word.length < 2 || word.length > 8) && (
                    <li>存在长度异常的单词（正常长度为2-8个字符）</li>
                  )}
                  {words.some(word => !/^[a-z]+$/.test(word)) && (
                    <li>存在非英文字母的单词或包含数字/特殊字符</li>
                  )}
                </ul>
              </div>
            )}

            {isValid && (
              <div className="validation-success">
                <h5>✅ 助记词格式正确!</h5>
                <p>可以用于转账功能</p>
              </div>
            )}
          </div>
        )}

        <div className="debug-tips">
          <h4>💡 助记词格式要求:</h4>
          <ul>
            <li>必须包含 12、15、18、21 或 24 个英文单词</li>
            <li>单词之间用单个空格分隔</li>
            <li>所有单词必须是小写英文字母</li>
            <li>不能包含数字、特殊字符或中文</li>
            <li>每个单词长度通常在 2-8 个字符之间</li>
          </ul>
        </div>

        <div className="example-section">
          <h4>📝 正确格式示例:</h4>
          <div className="example-mnemonic">
            abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
          </div>
          <p className="example-note">
            * 这是一个测试助记词，请勿用于实际交易
          </p>
        </div>
      </div>
    </div>
  );
};