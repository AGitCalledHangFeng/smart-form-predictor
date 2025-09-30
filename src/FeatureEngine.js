/**
 * 特征工程类
 * Feature Engineering Engine
 */
export class FeatureEngine {
  /**
   * 构造函数
   */
  constructor() {
    // 初始化时间跟踪
    this.typingStartTimes = new Map();
    this.fieldEntryTimes = new Map();
  }
  
  /**
   * 提取特征
   * @param {HTMLElement} field - 字段元素
   * @param {Object} formState - 表单状态
   * @param {Object} userContext - 用户上下文
   * @returns {Object} 特征对象
   */
  extractFeatures(field, formState, userContext = {}) {
    const features = {
      // 表单上下文特征
      formContext: {
        filledFields: this.getFilledFields(formState),
        fieldSequence: this.getFieldSequence(formState),
        timeSpent: this.getTimeSpentPerField(formState)
      },
      
      // 用户行为特征
      userBehavior: {
        typingSpeed: this.calculateTypingSpeed(field),
        correctionPattern: this.getCorrectionPattern(field),
        hesitationTime: this.getHesitationTime(field)
      },
      
      // 语义特征
      semantic: {
        fieldCategory: this.categorizeField(field),
        expectedFormat: this.detectExpectedFormat(field),
        relationshipStrength: this.getRelationshipStrength(field, formState)
      },
      
      // 用户上下文特征
      userContext: {
        deviceType: this.detectDeviceType(),
        timeOfDay: this.getTimeOfDay(),
        dayOfWeek: this.getDayOfWeek(),
        ...userContext
      }
    };
    
    return this.normalizeFeatures(features);
  }
  
  /**
   * 获取已填充字段
   * @param {Object} formState - 表单状态
   * @returns {Array} 已填充字段列表
   */
  getFilledFields(formState) {
    return Object.keys(formState).filter(fieldName => {
      const field = formState[fieldName];
      return field.value && field.value.toString().trim() !== '';
    });
  }
  
  /**
   * 获取字段填写顺序
   * @param {Object} formState - 表单状态
   * @returns {Array} 字段顺序列表
   */
  getFieldSequence(formState) {
    // 简化实现，实际应基于焦点变化历史
    return Object.keys(formState).filter(fieldName => {
      const field = formState[fieldName];
      return field.focused || (field.value && field.value.toString().trim() !== '');
    });
  }
  
  /**
   * 获取每个字段花费的时间
   * @param {Object} formState - 表单状态
   * @returns {Object} 时间分布
   */
  getTimeSpentPerField(formState) {
    const timeSpent = {};
    
    for (const [fieldName, field] of Object.entries(formState)) {
      if (field.focusStartTime) {
        const startTime = parseInt(field.focusStartTime);
        const currentTime = Date.now();
        timeSpent[fieldName] = currentTime - startTime;
      }
    }
    
    return timeSpent;
  }
  
  /**
   * 计算打字速度
   * @param {HTMLElement} field - 字段元素
   * @returns {number} 打字速度（字符/分钟）
   */
  calculateTypingSpeed(field) {
    // 简化实现，实际应跟踪按键事件
    const value = field.value || '';
    const startTime = this.typingStartTimes.get(field) || Date.now();
    const elapsedTime = (Date.now() - startTime) / 1000 / 60; // 转换为分钟
    
    if (elapsedTime > 0) {
      return value.length / elapsedTime;
    }
    
    return 0;
  }
  
  /**
   * 获取修正模式
   * @param {HTMLElement} field - 字段元素
   * @returns {string} 修正模式
   */
  getCorrectionPattern(field) {
    // 简化实现，实际应跟踪删除和修改操作
    return 'unknown';
  }
  
  /**
   * 获取犹豫时间
   * @param {HTMLElement} field - 字段元素
   * @returns {number} 犹豫时间（毫秒）
   */
  getHesitationTime(field) {
    // 简化实现，实际应测量首次输入前的延迟
    return 0;
  }
  
  /**
   * 字段分类
   * @param {HTMLElement} field - 字段元素
   * @returns {string} 字段类别
   */
  categorizeField(field) {
    const fieldName = field.name || '';
    const fieldType = field.type || '';
    
    const patterns = {
      personal: ['name', 'email', 'phone', 'address', 'firstName', 'lastName'],
      professional: ['company', 'title', 'department', 'position'],
      temporal: ['date', 'time', 'birthday', 'dob', 'year'],
      location: ['city', 'state', 'country', 'zipcode', 'postal', 'location'],
      financial: ['card', 'credit', 'payment', 'price', 'cost'],
      identification: ['id', 'passport', 'ssn', 'social']
    };
    
    // 基于字段名分类
    for (const [category, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => 
        fieldName.toLowerCase().includes(keyword) || 
        fieldType.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    
    // 基于字段类型分类
    const typeCategories = {
      'email': 'personal',
      'tel': 'personal',
      'date': 'temporal',
      'number': 'financial'
    };
    
    if (typeCategories[fieldType]) {
      return typeCategories[fieldType];
    }
    
    return 'generic';
  }
  
  /**
   * 检测预期格式
   * @param {HTMLElement} field - 字段元素
   * @returns {string} 预期格式
   */
  detectExpectedFormat(field) {
    const fieldName = field.name || '';
    const fieldType = field.type || '';
    
    // 基于字段类型判断
    if (fieldType === 'email') return 'email';
    if (fieldType === 'tel') return 'phone';
    if (fieldType === 'date') return 'date';
    if (fieldType === 'number') return 'number';
    
    // 基于字段名判断
    if (fieldName.includes('email')) return 'email';
    if (fieldName.includes('phone') || fieldName.includes('tel')) return 'phone';
    if (fieldName.includes('date') || fieldName.includes('birthday')) return 'date';
    if (fieldName.includes('zip') || fieldName.includes('postal')) return 'zipcode';
    
    // 基于pattern属性判断
    if (field.pattern) {
      // 简化实现，实际应解析pattern
      return 'custom';
    }
    
    return 'text';
  }
  
  /**
   * 获取关系强度
   * @param {HTMLElement} field - 字段元素
   * @param {Object} formState - 表单状态
   * @returns {number} 关系强度
   */
  getRelationshipStrength(field, formState) {
    // 简化实现，实际应基于字段关系图谱
    const fieldName = field.name || '';
    const filledFields = this.getFilledFields(formState);
    
    // 简单的相关性计算
    if (filledFields.length === 0) return 0;
    
    // 基于字段名相似度计算关系强度
    let strength = 0;
    for (const filledField of filledFields) {
      if (filledField !== fieldName) {
        const similarity = this.calculateStringSimilarity(fieldName, filledField);
        strength = Math.max(strength, similarity);
      }
    }
    
    return strength;
  }
  
  /**
   * 计算字符串相似度
   * @param {string} str1 - 字符串1
   * @param {string} str2 - 字符串2
   * @returns {number} 相似度
   */
  calculateStringSimilarity(str1, str2) {
    // 使用简单的Jaccard相似度
    const set1 = new Set(str1.toLowerCase().split(''));
    const set2 = new Set(str2.toLowerCase().split(''));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * 检测设备类型
   * @returns {string} 设备类型
   */
  detectDeviceType() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // 检测移动设备
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'ios';
    }
    
    // 检测桌面设备
    if (/Win/.test(userAgent)) {
      return 'windows';
    }
    
    if (/Mac/.test(userAgent)) {
      return 'mac';
    }
    
    if (/Linux/.test(userAgent)) {
      return 'linux';
    }
    
    return 'desktop';
  }
  
  /**
   * 获取一天中的时间
   * @returns {string} 时间段
   */
  getTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 18) {
      return 'afternoon';
    } else if (hour >= 18 && hour < 22) {
      return 'evening';
    } else {
      return 'night';
    }
  }
  
  /**
   * 获取星期几
   * @returns {string} 星期几
   */
  getDayOfWeek() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }
  
  /**
   * 归一化特征
   * @param {Object} features - 特征对象
   * @returns {Object} 归一化后的特征
   */
  normalizeFeatures(features) {
    // 简化实现，实际应对数值特征进行归一化处理
    return features;
  }
}