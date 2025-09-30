import { FieldRelationshipGraph } from './FieldRelationshipGraph.js';
import { FieldPredictionModel } from './FieldPredictionModel.js';
import { FeatureEngine } from './FeatureEngine.js';
import { CrossSessionLearner } from './CrossSessionLearner.js';
import { RealTimePredictionEngine } from './RealTimePredictionEngine.js';
import { PrivacyPreservingLearner } from './PrivacyPreservingLearner.js';
import { LocalStorage } from './LocalStorage.js';
import { FieldValidator } from './FieldValidator.js';

/**
 * 智能表单预测主类
 * Smart Form Predictor Main Class
 */
export class SmartFormPredictor {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    this.models = new Map();      // 字段预测模型
    this.patterns = new Map();    // 用户行为模式
    this.storage = new LocalStorage(); // 本地数据存储
    this.validator = new FieldValidator(); // 字段验证器
    
    // 默认配置
    this.config = {
      learning: true,
      privacy: {
        localOnly: true,
        autoForget: true,
        anonymize: true
      },
      prediction: {
        confidenceThreshold: 0.7,
        maxSuggestions: 3,
        autoComplete: 'smart'
      },
      ui: {
        highlightPredictions: true,
        showConfidence: false,
        animation: 'smooth'
      },
      ...options
    };
    
    // 初始化子模块
    this.relationshipGraph = new FieldRelationshipGraph();
    this.featureEngine = new FeatureEngine();
    this.crossSessionLearner = new CrossSessionLearner();
    this.predictionEngine = new RealTimePredictionEngine();
    this.privacyLearner = new PrivacyPreservingLearner();
  }
  
  /**
   * 初始化表单监控
   * @param {string|Array} formSelector - 表单选择器
   */
  async init(formSelector) {
    console.log('Initializing SmartFormPredictor...');
    
    // 支持单个或多个表单选择器
    const selectors = Array.isArray(formSelector) ? formSelector : [formSelector];
    
    // 为每个表单添加监控
    for (const selector of selectors) {
      const forms = document.querySelectorAll(selector);
      forms.forEach(form => this._attachFormListeners(form));
    }
    
    // 加载已保存的模型和模式
    await this._loadStoredData();
    
    console.log('SmartFormPredictor initialized successfully.');
    return this;
  }
  
  /**
   * 为表单添加事件监听器
   * @param {HTMLElement} form - 表单元素
   */
  _attachFormListeners(form) {
    // 监听输入事件用于实时预测
    form.addEventListener('input', (event) => {
      this._handleInput(event);
    });
    
    // 监听表单提交事件用于学习
    form.addEventListener('submit', (event) => {
      this._handleFormSubmit(event);
    });
    
    // 监听焦点事件
    form.addEventListener('focusin', (event) => {
      this._handleFocusIn(event);
    });
    
    form.addEventListener('focusout', (event) => {
      this._handleFocusOut(event);
    });
  }
  
  /**
   * 处理输入事件
   * @param {Event} event - 输入事件
   */
  async _handleInput(event) {
    const field = event.target;
    if (field.tagName !== 'INPUT' && field.tagName !== 'TEXTAREA' && field.tagName !== 'SELECT') {
      return;
    }
    
    // 获取当前表单状态
    const form = field.closest('form');
    const formState = this._getFormState(form);
    
    // 提取特征
    const features = this.featureEngine.extractFeatures(field, formState);
    
    // 进行预测
    const prediction = await this.predictionEngine.predictFieldValue(field, features);
    
    // 显示建议（如果置信度足够高）
    if (prediction.confidence >= this.config.prediction.confidenceThreshold) {
      this._showSuggestions(field, prediction);
    }
  }
  
  /**
   * 处理表单提交事件
   * @param {Event} event - 提交事件
   */
  async _handleFormSubmit(event) {
    const form = event.target;
    const formData = new FormData(form);
    const formDataObj = {};
    
    // 将FormData转换为普通对象
    for (const [key, value] of formData.entries()) {
      formDataObj[key] = value;
    }
    
    // 从提交中学习
    await this.learnFromSubmission(formDataObj);
  }
  
  /**
   * 处理焦点进入事件
   * @param {Event} event - 焦点事件
   */
  _handleFocusIn(event) {
    // 记录用户开始编辑时间
    const field = event.target;
    field.dataset.focusStartTime = Date.now();
  }
  
  /**
   * 处理焦点离开事件
   * @param {Event} event - 焦点事件
   */
  _handleFocusOut(event) {
    // 可以在这里分析用户的编辑行为
  }
  
  /**
   * 获取表单状态
   * @param {HTMLElement} form - 表单元素
   * @returns {Object} 表单状态对象
   */
  _getFormState(form) {
    const state = {};
    const fields = form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
      if (field.name) {
        state[field.name] = {
          value: field.value,
          type: field.type,
          tagName: field.tagName,
          focused: document.activeElement === field,
          focusStartTime: field.dataset.focusStartTime || null
        };
      }
    });
    
    return state;
  }
  
  /**
   * 显示预测建议
   * @param {HTMLElement} field - 字段元素
   * @param {Object} prediction - 预测结果
   */
  _showSuggestions(field, prediction) {
    // 在控制台显示预测建议
    console.log(`Suggestion for ${field.name}: ${prediction.value} (confidence: ${prediction.confidence})`);
    
    // 如果有替代建议，也在控制台显示
    if (prediction.alternatives && prediction.alternatives.length > 0) {
      console.log(`Alternatives for ${field.name}:`, prediction.alternatives);
    }
    
    // 触发自定义事件，让UI层可以监听并显示建议
    const event = new CustomEvent('smart-form-suggestion', {
      detail: {
        field: field,
        fieldName: field.name,
        fieldValue: field.value,
        prediction: prediction
      }
    });
    field.dispatchEvent(event);
  }
  
  /**
   * 预测字段值
   * @param {HTMLElement} field - 字段元素
   * @param {Object} context - 上下文信息
   * @returns {Promise<Object>} 预测结果
   */
  async predict(field, context) {
    const features = this.featureEngine.extractFeatures(field, context);
    return await this.predictionEngine.predictFieldValue(field, features);
  }
  
  /**
   * 从提交中学习
   * @param {Object} formData - 表单数据
   */
  async learnFromSubmission(formData) {
    if (!this.config.learning) return;
    
    // 使用隐私保护方式学习
    const privateData = this.config.privacy.anonymize ? 
      this.privacyLearner.learnWithPrivacy([formData], 0.1) : 
      [formData];
    
    // 更新模型
    await this._updateModels(privateData[0]);
    
    // 将数据添加到预测引擎的训练数据中
    this.predictionEngine.addTrainingData(privateData[0]);
    
    // 保存学习到的模式
    await this._savePatterns();
  }
  
  /**
   * 更新预测模型
   * @param {Object} formData - 表单数据
   */
  async _updateModels(formData) {
    // 更新字段关系图谱
    this.relationshipGraph.discoverRelationships([formData]);
    
    // 跨会话学习
    this.crossSessionLearner.learnCrossSessionPatterns([formData]);
    
    // 更新模式数据
    this._updatePatterns(formData);
    
    // 为每个字段更新预测模型
    for (const [fieldName, value] of Object.entries(formData)) {
      if (!this.models.has(fieldName)) {
        // 根据字段类型创建模型
        const fieldType = this._detectFieldType(fieldName, value);
        this.models.set(fieldName, new FieldPredictionModel(fieldType));
      }
      
      // 更新模型（简化实现）
      const model = this.models.get(fieldName);
      // 在实际实现中，这里会有更多的训练逻辑
    }
  }
  
  /**
   * 更新模式数据
   * @param {Object} formData - 表单数据
   */
  _updatePatterns(formData) {
    // 为每个字段更新模式数据
    for (const [fieldName, value] of Object.entries(formData)) {
      // 如果该字段还没有模式数据，创建一个新的Set
      if (!this.patterns.has(fieldName)) {
        this.patterns.set(fieldName, new Set());
      }
      
      // 将值添加到模式数据中
      const fieldPatterns = this.patterns.get(fieldName);
      fieldPatterns.add(value);
    }
  }
  
  /**
   * 检测字段类型
   * @param {string} fieldName - 字段名称
   * @param {any} value - 字段值
   * @returns {string} 字段类型
   */
  _detectFieldType(fieldName, value) {
    // 基于字段名和值的启发式检测
    if (typeof value === 'number') return 'numerical';
    if (typeof value === 'string') {
      if (fieldName.includes('email')) return 'email';
      if (fieldName.includes('phone')) return 'phone';
      if (fieldName.includes('date')) return 'date';
      return 'text';
    }
    return 'generic';
  }
  
  /**
   * 获取输入建议
   * @param {string} field - 字段名
   * @param {string} partialValue - 部分输入值
   * @returns {Array} 建议列表
   */
  getSuggestions(field, partialValue) {
    // 简化实现，实际应该基于模型预测
    const suggestions = [];
    if (this.patterns.has(field)) {
      const fieldPatterns = this.patterns.get(field);
      // 基于历史模式生成建议
      for (const pattern of fieldPatterns) {
        if (pattern.startsWith(partialValue)) {
          suggestions.push(pattern);
        }
      }
    }
    return suggestions.slice(0, this.config.prediction.maxSuggestions);
  }
  
  /**
   * 加载存储的数据
   */
  async _loadStoredData() {
    try {
      const storedModels = this.storage.getItem('smart-form-models');
      const storedPatterns = this.storage.getItem('smart-form-patterns');
      
      if (storedModels) {
        // 恢复模型（简化实现）
        Object.keys(storedModels).forEach(fieldName => {
          const modelData = storedModels[fieldName];
          const model = new FieldPredictionModel(modelData.fieldType);
          // 恢复模型状态
          this.models.set(fieldName, model);
        });
      }
      
      if (storedPatterns) {
        // 恢复模式
        Object.keys(storedPatterns).forEach(fieldName => {
          this.patterns.set(fieldName, new Set(storedPatterns[fieldName]));
        });
      }
    } catch (error) {
      console.warn('Failed to load stored data:', error);
    }
  }
  
  /**
   * 保存模式数据
   */
  async _savePatterns() {
    try {
      // 转换Map为可序列化的对象
      const serializablePatterns = {};
      for (const [key, value] of this.patterns.entries()) {
        serializablePatterns[key] = Array.from(value);
      }
      
      this.storage.setItem('smart-form-patterns', serializablePatterns);
    } catch (error) {
      console.warn('Failed to save patterns:', error);
    }
  }
  
  /**
   * 静态初始化方法
   * @param {Object} options - 配置选项
   * @returns {Promise<SmartFormPredictor>} 初始化后的实例
   */
  static async init(options) {
    const predictor = new SmartFormPredictor(options);
    // 如果提供了表单选择器，则自动初始化
    if (options && options.forms) {
      await predictor.init(options.forms);
    }
    return predictor;
  }
}