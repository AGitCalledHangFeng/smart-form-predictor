// 测试包是否可以正确导入
import { SmartFormPredictor } from '../dist/smart-form-predictor.esm.js';

console.log('Testing ESM import...');

// 检查类是否正确定义
if (typeof SmartFormPredictor === 'function') {
  console.log('✓ SmartFormPredictor class is correctly exported');
} else {
  console.error('✗ SmartFormPredictor class is not correctly exported');
  process.exit(1);
}

// 检查是否可以创建实例
try {
  const predictor = new SmartFormPredictor();
  console.log('✓ SmartFormPredictor instance can be created');
} catch (error) {
  console.error('✗ Failed to create SmartFormPredictor instance:', error);
  process.exit(1);
}

console.log('All import tests passed!');