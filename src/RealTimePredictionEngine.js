/**
 * 实时预测引擎类
 * Real-time Prediction Engine
 */
export class RealTimePredictionEngine {
  /**
   * 构造函数
   */
  constructor() {
    this.confidenceThreshold = 0.7;
    this.predictionCache = new Map(); // 简化的LRU缓存
    this.cacheSizeLimit = 100;
    
    // 初始化训练数据存储
    this.trainingData = new Map();
    
    // 从本地存储加载训练数据
    this._loadTrainingData();
  }
  
  /**
   * 添加训练数据
   * @param {Object} formData - 表单数据
   */
  addTrainingData(formData) {
    // 为每个字段添加训练数据
    for (const [fieldName, value] of Object.entries(formData)) {
      if (!this.trainingData.has(fieldName)) {
        this.trainingData.set(fieldName, []);
      }
      
      // 添加数据到训练集
      this.trainingData.get(fieldName).push({
        value: value,
        timestamp: Date.now()
      });
    }
    
    // 保存训练数据到本地存储
    this._saveTrainingData();
  }
  
  /**
   * 保存训练数据到本地存储
   */
  _saveTrainingData() {
    try {
      if (typeof localStorage !== 'undefined') {
        // 转换Map为可序列化的对象
        const serializableData = {};
        for (const [key, value] of this.trainingData.entries()) {
          serializableData[key] = value;
        }
        
        localStorage.setItem('smart-form-training-data', JSON.stringify(serializableData));
      }
    } catch (error) {
      console.warn('Failed to save training data:', error);
    }
  }
  
  /**
   * 从本地存储加载训练数据
   */
  _loadTrainingData() {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedData = localStorage.getItem('smart-form-training-data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          
          // 恢复训练数据
          Object.keys(parsedData).forEach(fieldName => {
            this.trainingData.set(fieldName, parsedData[fieldName]);
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load training data:', error);
    }
  }
  
  /**
   * 实时预测字段值
   * @param {HTMLElement} field - 字段元素
   * @param {Object} context - 上下文信息
   * @returns {Promise<Object>} 预测结果
   */
  async predictFieldValue(field, context) {
    // 检查字段是否存在
    if (!field) {
      return {
        value: null,
        confidence: 0,
        alternatives: [],
        source: 'unknown'
      };
    }
    
    const cacheKey = this.generateCacheKey(field, context);
    
    // 缓存优化
    if (this.predictionCache.has(cacheKey)) {
      return this.predictionCache.get(cacheKey);
    }
    
    // 基于训练数据进行预测
    const prediction = this._predictFromTrainingData(field, context);
    
    // 缓存结果
    this._setCache(cacheKey, prediction);
    return prediction;
  }
  
  /**
   * 基于训练数据进行预测
   * @param {HTMLElement} field - 字段元素
   * @param {Object} context - 上下文信息
   * @returns {Object} 预测结果
   */
  _predictFromTrainingData(field, context) {
    const fieldName = field.name;
    
    // 检查是否有训练数据
    if (!this.trainingData.has(fieldName) || this.trainingData.get(fieldName).length === 0) {
      // 如果没有训练数据，返回通用预测
      return this._getGenericPrediction(field, context);
    }
    
    const trainingData = this.trainingData.get(fieldName);
    
    // 如果是文本字段且有部分输入，使用前缀匹配
    if (field.value && field.value.length > 0) {
      const partialValue = field.value;
      const matches = trainingData.filter(item => 
        item.value && item.value.toString().toLowerCase().startsWith(partialValue.toLowerCase())
      );
      
      if (matches.length > 0) {
        // 返回最常用的匹配值
        const valueCounts = {};
        matches.forEach(match => {
          const value = match.value.toString();
          valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        
        let mostFrequentValue = '';
        let maxCount = 0;
        
        for (const [value, count] of Object.entries(valueCounts)) {
          if (count > maxCount) {
            maxCount = count;
            mostFrequentValue = value;
          }
        }
        
        return {
          value: mostFrequentValue,
          confidence: Math.min(0.95, maxCount / matches.length),
          alternatives: Object.keys(valueCounts).slice(0, 5),
          source: 'training-data'
        };
      }
    }
    
    // 如果没有部分匹配，返回最常用的值
    const valueCounts = {};
    trainingData.forEach(item => {
      const value = item.value.toString();
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });
    
    let mostFrequentValue = '';
    let maxCount = 0;
    
    for (const [value, count] of Object.entries(valueCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentValue = value;
      }
    }
    
    return {
      value: mostFrequentValue,
      confidence: Math.min(0.9, maxCount / trainingData.length),
      alternatives: Object.keys(valueCounts).slice(0, 5),
      source: 'training-data'
    };
  }
  
  /**
   * 通用预测（当没有训练数据时使用）
   * @param {HTMLElement} field - 字段元素
   * @param {Object} context - 上下文信息
   * @returns {Object} 预测结果
   */
  _getGenericPrediction(field, context) {
    const fieldName = field.name;
    
    // 基于字段名的通用预测
    if (fieldName.includes('email')) {
      return {
        value: 'user@example.com',
        confidence: 0.3,
        alternatives: ['user@example.com', 'person@gmail.com'],
        source: 'generic'
      };
    }
    
    if (fieldName.includes('phone')) {
      return {
        value: '(555) 123-4567',
        confidence: 0.3,
        alternatives: ['(555) 123-4567', '(555) 987-6543'],
        source: 'generic'
      };
    }
    
    if (fieldName.includes('fullName')) {
      return {
        value: 'John Doe',
        confidence: 0.2,
        alternatives: ['John Doe', 'Jane Smith', 'Michael Johnson'],
        source: 'generic'
      };
    }
    
    // 默认返回空预测
    return {
      value: null,
      confidence: 0,
      alternatives: [],
      source: 'generic'
    };
  }
  
  /**
   * 生成缓存键
   * @param {HTMLElement} field - 字段元素
   * @param {Object} context - 上下文信息
   * @returns {string} 缓存键
   */
  generateCacheKey(field, context) {
    // 检查字段是否存在
    if (!field) return 'unknown';
    
    // 简化实现，实际应更复杂
    return `${field.name}-${JSON.stringify(context)}`;
  }
  
  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   */
  _setCache(key, value) {
    // 简单的LRU实现
    if (this.predictionCache.size >= this.cacheSizeLimit) {
      // 删除第一个（最旧的）条目
      const firstKey = this.predictionCache.keys().next().value;
      this.predictionCache.delete(firstKey);
    }
    
    this.predictionCache.set(key, value);
  }
}