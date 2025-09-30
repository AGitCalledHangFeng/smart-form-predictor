// 简单的测试文件来验证包的基本功能
import { SmartFormPredictor } from '../src/index.js';

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

console.log('All basic tests passed!');