/**
 * 字段关系图谱类
 * Field Relationship Graph
 */
class FieldRelationshipGraph {
  /**
   * 构造函数
   */
  constructor() {
    this.nodes = new Map(); // 字段节点
    this.edges = new Map(); // 字段关系
  }
  
  /**
   * 发现字段间关联关系
   * @param {Array} formDataHistory - 表单数据历史
   * @returns {Object} 关系分析结果
   */
  discoverRelationships(formDataHistory) {
    // 1. 基于共现频率的关联发现
    const cooccurrence = this.calculateCooccurrence(formDataHistory);
    
    // 2. 基于填写顺序的时间关联
    const temporalRelations = this.analyzeTemporalPatterns(formDataHistory);
    
    // 3. 基于值依赖的逻辑关联
    const valueDependencies = this.findValueDependencies(formDataHistory);
    
    return { cooccurrence, temporalRelations, valueDependencies };
  }
  
  /**
   * 计算字段共现频率
   * @param {Array} history - 表单数据历史
   * @returns {Object} 共现矩阵
   */
  calculateCooccurrence(history) {
    const matrix = {};
    history.forEach(session => {
      const fields = Object.keys(session);
      fields.forEach(field1 => {
        fields.forEach(field2 => {
          if (field1 !== field2) {
            const key = `${field1}-${field2}`;
            matrix[key] = (matrix[key] || 0) + 1;
          }
        });
      });
    });
    return matrix;
  }
  
  /**
   * 分析时间模式
   * @param {Array} history - 表单数据历史
   * @returns {Object} 时间关联分析
   */
  analyzeTemporalPatterns(history) {
    // 简化实现，实际应该分析填写顺序和时间间隔
    const patterns = {};
    
    history.forEach(session => {
      const fields = Object.keys(session);
      for (let i = 0; i < fields.length - 1; i++) {
        const currentField = fields[i];
        const nextField = fields[i + 1];
        const key = `${currentField}->${nextField}`;
        patterns[key] = (patterns[key] || 0) + 1;
      }
    });
    
    return patterns;
  }
  
  /**
   * 查找值依赖关系
   * @param {Array} history - 表单数据历史
   * @returns {Object} 值依赖关系
   */
  findValueDependencies(history) {
    // 简化实现，实际应该分析字段值之间的逻辑关系
    const dependencies = {};
    
    // 示例：分析邮箱和用户名的关系
    history.forEach(session => {
      if (session.email && session.username) {
        // 简单的依赖模式检查
        const emailPrefix = session.email.split('@')[0];
        if (emailPrefix === session.username) {
          dependencies['username->email'] = (dependencies['username->email'] || 0) + 1;
        }
      }
    });
    
    return dependencies;
  }
  
  /**
   * 添加字段节点
   * @param {string} fieldName - 字段名
   */
  addNode(fieldName) {
    if (!this.nodes.has(fieldName)) {
      this.nodes.set(fieldName, {
        name: fieldName,
        type: this._inferFieldType(fieldName),
        connections: new Set()
      });
    }
  }
  
  /**
   * 推断字段类型
   * @param {string} fieldName - 字段名
   * @returns {string} 字段类型
   */
  _inferFieldType(fieldName) {
    const typePatterns = {
      'email': ['email', 'mail'],
      'phone': ['phone', 'tel', 'mobile'],
      'date': ['date', 'birthday', 'dob'],
      'name': ['name', 'first', 'last'],
      'address': ['address', 'street', 'addr'],
      'city': ['city'],
      'zip': ['zip', 'postal'],
      'country': ['country'],
      'number': ['number', 'count', 'qty']
    };
    
    for (const [type, patterns] of Object.entries(typePatterns)) {
      if (patterns.some(pattern => fieldName.toLowerCase().includes(pattern))) {
        return type;
      }
    }
    
    return 'text';
  }
  
  /**
   * 添加边（字段关系）
   * @param {string} fromField - 起始字段
   * @param {string} toField - 目标字段
   * @param {Object} relationData - 关系数据
   */
  addEdge(fromField, toField, relationData = {}) {
    this.addNode(fromField);
    this.addNode(toField);
    
    const edgeKey = `${fromField}-${toField}`;
    if (!this.edges.has(edgeKey)) {
      this.edges.set(edgeKey, {
        from: fromField,
        to: toField,
        ...relationData
      });
      
      // 更新节点连接信息
      this.nodes.get(fromField).connections.add(toField);
      this.nodes.get(toField).connections.add(fromField);
    }
  }
}

/**
 * 字段预测模型类
 * Field Prediction Model
 */
class FieldPredictionModel {
  /**
   * 构造函数
   * @param {string} fieldType - 字段类型
   */
  constructor(fieldType) {
    this.fieldType = fieldType;
    this.trainingData = [];
    this.model = null;
    this.accuracy = 0;
  }
  
  /**
   * 训练预测模型
   * @param {Array} features - 特征数据
   * @param {Array} labels - 标签数据
   */
  async train(features, labels) {
    // 根据字段类型选择不同算法
    switch(this.fieldType) {
      case 'categorical':
        return this.trainDecisionTree(features, labels);
      case 'numerical':
        return this.trainRegression(features, labels);
      case 'text':
        return this.trainTextPrediction(features, labels);
      default:
        return this.trainGenericModel(features, labels);
    }
  }
  
  /**
   * 决策树训练（用于分类字段）
   * @param {Array} features - 特征数据
   * @param {Array} labels - 标签数据
   */
  trainDecisionTree(features, labels) {
    // 简化的决策树实现，适合浏览器环境
    this.model = {
      type: 'decisionTree',
      predict: (context) => {
        // 基于特征匹配的预测逻辑
        const matches = this.findSimilarContexts(context, features, labels);
        return this.majorityVote(matches);
      }
    };
    
    return this.model;
  }
  
  /**
   * 回归训练（用于数值字段）
   * @param {Array} features - 特征数据
   * @param {Array} labels - 标签数据
   */
  trainRegression(features, labels) {
    // 简化的线性回归实现
    this.model = {
      type: 'regression',
      coefficients: this.calculateRegressionCoefficients(features, labels),
      predict: (context) => {
        return this.applyRegression(context, this.model.coefficients);
      }
    };
    
    return this.model;
  }
  
  /**
   * 文本预测模型
   * @param {Array} features - 特征数据
   * @param {Array} labels - 标签数据
   */
  trainTextPrediction(features, labels) {
    // 构建字符级或词级的预测模型
    const markovChain = this.buildMarkovChain(labels);
    
    this.model = {
      type: 'markovChain',
      markovChain: markovChain,
      predict: (partialInput, context) => {
        return markovChain.predict(partialInput, context);
      }
    };
    
    return this.model;
  }
  
  /**
   * 通用模型训练
   * @param {Array} features - 特征数据
   * @param {Array} labels - 标签数据
   */
  trainGenericModel(features, labels) {
    // 使用简单的最近邻算法
    this.model = {
      type: 'knn',
      trainingFeatures: features,
      trainingLabels: labels,
      predict: (context) => {
        return this.kNearestNeighbors(context, features, labels);
      }
    };
    
    return this.model;
  }
  
  /**
   * 查找相似上下文
   * @param {Object} context - 当前上下文
   * @param {Array} features - 特征数据
   * @param {Array} labels - 标签数据
   * @returns {Array} 匹配的结果
   */
  findSimilarContexts(context, features, labels) {
    const matches = [];
    const threshold = 0.7; // 相似度阈值
    
    for (let i = 0; i < features.length; i++) {
      const similarity = this.calculateSimilarity(context, features[i]);
      if (similarity >= threshold) {
        matches.push({
          similarity: similarity,
          label: labels[i]
        });
      }
    }
    
    return matches;
  }
  
  /**
   * 计算相似度
   * @param {Object} context1 - 上下文1
   * @param {Object} context2 - 上下文2
   * @returns {number} 相似度分数
   */
  calculateSimilarity(context1, context2) {
    // 简化的相似度计算
    let matches = 0;
    let total = 0;
    
    for (const key in context1) {
      if (context1.hasOwnProperty(key) && context2.hasOwnProperty(key)) {
        total++;
        if (context1[key] === context2[key]) {
          matches++;
        }
      }
    }
    
    return total > 0 ? matches / total : 0;
  }
  
  /**
   * 多数投票
   * @param {Array} matches - 匹配结果
   * @returns {any} 投票结果
   */
  majorityVote(matches) {
    if (matches.length === 0) return null;
    
    // 按相似度加权投票
    const voteCount = {};
    let maxVotes = 0;
    let winner = null;
    
    for (const match of matches) {
      const label = match.label;
      const weight = match.similarity;
      voteCount[label] = (voteCount[label] || 0) + weight;
      
      if (voteCount[label] > maxVotes) {
        maxVotes = voteCount[label];
        winner = label;
      }
    }
    
    return winner;
  }
  
  /**
   * 构建马尔可夫链
   * @param {Array} labels - 标签数据
   * @returns {Object} 马尔可夫链模型
   */
  buildMarkovChain(labels) {
    // 简化的马尔可夫链实现
    const transitions = {};
    const starters = {};
    
    labels.forEach(label => {
      const parts = label.toString().split(/\s+/);
      
      // 记录起始词
      if (parts.length > 0) {
        starters[parts[0]] = (starters[parts[0]] || 0) + 1;
      }
      
      // 构建转移概率
      for (let i = 0; i < parts.length - 1; i++) {
        const current = parts[i];
        const next = parts[i + 1];
        
        if (!transitions[current]) {
          transitions[current] = {};
        }
        
        transitions[current][next] = (transitions[current][next] || 0) + 1;
      }
    });
    
    return {
      transitions: transitions,
      starters: starters,
      predict: (partialInput, context) => {
        // 简化的预测实现
        return this.predictWithMarkovChain(partialInput, transitions, starters);
      }
    };
  }
  
  /**
   * 使用马尔可夫链进行预测
   * @param {string} partialInput - 部分输入
   * @param {Object} transitions - 转移概率
   * @param {Object} starters - 起始词
   * @returns {string} 预测结果
   */
  predictWithMarkovChain(partialInput, transitions, starters) {
    if (!partialInput) {
      // 如果没有输入，随机选择一个起始词
      const starterWords = Object.keys(starters);
      if (starterWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * starterWords.length);
        return starterWords[randomIndex];
      }
      return '';
    }
    
    // 基于部分输入进行预测
    const words = partialInput.split(/\s+/);
    const lastWord = words[words.length - 1];
    
    if (transitions[lastWord]) {
      const nextWords = Object.keys(transitions[lastWord]);
      if (nextWords.length > 0) {
        // 选择最常见的下一个词
        let maxCount = 0;
        let mostCommon = '';
        
        for (const word of nextWords) {
          const count = transitions[lastWord][word];
          if (count > maxCount) {
            maxCount = count;
            mostCommon = word;
          }
        }
        
        return mostCommon;
      }
    }
    
    return '';
  }
  
  /**
   * 计算回归系数
   * @param {Array} features - 特征数据
   * @param {Array} labels - 标签数据
   * @returns {Array} 回归系数
   */
  calculateRegressionCoefficients(features, labels) {
    // 简化的线性回归实现
    // 在实际应用中，这会是一个更复杂的算法
    return [0.5, 0.3, 0.2]; // 示例系数
  }
  
  /**
   * 应用回归模型
   * @param {Object} context - 上下文
   * @param {Array} coefficients - 系数
   * @returns {number} 预测值
   */
  applyRegression(context, coefficients) {
    // 简化的线性组合
    let result = 0;
    const values = Object.values(context);
    
    for (let i = 0; i < Math.min(values.length, coefficients.length); i++) {
      result += values[i] * coefficients[i];
    }
    
    return result;
  }
  
  /**
   * K近邻算法
   * @param {Object} context - 当前上下文
   * @param {Array} features - 特征数据
   * @param {Array} labels - 标签数据
   * @returns {any} 预测标签
   */
  kNearestNeighbors(context, features, labels, k = 3) {
    // 计算所有训练样本与当前上下文的距离
    const distances = features.map((feature, index) => ({
      distance: this.euclideanDistance(context, feature),
      label: labels[index]
    }));
    
    // 按距离排序并取前k个
    distances.sort((a, b) => a.distance - b.distance);
    const kNearest = distances.slice(0, k);
    
    // 简化：返回最近邻的标签
    return kNearest.length > 0 ? kNearest[0].label : null;
  }
  
  /**
   * 计算欧几里得距离
   * @param {Object} point1 - 点1
   * @param {Object} point2 - 点2
   * @returns {number} 距离
   */
  euclideanDistance(point1, point2) {
    let sum = 0;
    const keys = [...new Set([...Object.keys(point1), ...Object.keys(point2)])];
    
    for (const key of keys) {
      const val1 = point1[key] || 0;
      const val2 = point2[key] || 0;
      sum += Math.pow(val1 - val2, 2);
    }
    
    return Math.sqrt(sum);
  }
}

/**
 * 特征工程类
 * Feature Engineering Engine
 */
class FeatureEngine {
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

/**
 * 跨会话学习类
 * Cross Session Learner
 */
class CrossSessionLearner {
  /**
   * 构造函数
   */
  constructor() {
    this.userProfile = {};
  }
  
  /**
   * 学习跨会话模式
   * @param {Array} sessions - 会话数据
   * @returns {Object} 用户画像
   */
  learnCrossSessionPatterns(sessions) {
    const patterns = {
      // 用户个人信息的关联模式
      personalInfo: this.extractPersonalInfoPatterns(sessions),
      
      // 工作信息的填写习惯
      professionalPatterns: this.extractProfessionalPatterns(sessions),
      
      // 时间相关的填写模式
      temporalPatterns: this.extractTemporalPatterns(sessions),
      
      // 设备特定的填写行为
      deviceSpecific: this.analyzeDeviceSpecificBehavior(sessions)
    };
    
    // 构建个性化填写档案
    return this.buildUserProfile(patterns);
  }
  
  /**
   * 提取个人信息模式
   * @param {Array} sessions - 会话数据
   * @returns {Object} 个人信息模式
   */
  extractPersonalInfoPatterns(sessions) {
    return sessions.reduce((patterns, session) => {
      // 分析姓名、地址、联系方式之间的关联
      if (session.firstName && session.lastName) {
        const namePattern = `${session.firstName} ${session.lastName}`;
        patterns.names = patterns.names || new Set();
        patterns.names.add(namePattern);
      }
      
      // 分析地址组成模式
      if (session.address && session.city) {
        const locationKey = `${session.city}-${session.state || ''}`;
        patterns.locations = patterns.locations || new Map();
        patterns.locations.set(locationKey, 
          (patterns.locations.get(locationKey) || 0) + 1);
      }
      
      // 分析邮箱和姓名的关系
      if (session.email && session.firstName) {
        const emailPrefix = session.email.split('@')[0];
        const nameMatch = emailPrefix.toLowerCase() === session.firstName.toLowerCase();
        patterns.emailNameMatch = patterns.emailNameMatch || 0;
        if (nameMatch) {
          patterns.emailNameMatch++;
        }
      }
      
      return patterns;
    }, {});
  }
  
  /**
   * 提取工作信息模式
   * @param {Array} sessions - 会话数据
   * @returns {Object} 工作信息模式
   */
  extractProfessionalPatterns(sessions) {
    return sessions.reduce((patterns, session) => {
      // 分析公司和职位的关系
      if (session.company && session.title) {
        const key = `${session.company}-${session.title}`;
        patterns.companyTitle = patterns.companyTitle || new Map();
        patterns.companyTitle.set(key, (patterns.companyTitle.get(key) || 0) + 1);
      }
      
      return patterns;
    }, {});
  }
  
  /**
   * 提取时间相关模式
   * @param {Array} sessions - 会话数据
   * @returns {Object} 时间模式
   */
  extractTemporalPatterns(sessions) {
    return sessions.reduce((patterns, session) => {
      // 分析填写时间模式
      const timestamp = session.timestamp || Date.now();
      const date = new Date(timestamp);
      
      // 按小时分析
      const hour = date.getHours();
      patterns.hourly = patterns.hourly || {};
      patterns.hourly[hour] = (patterns.hourly[hour] || 0) + 1;
      
      // 按星期分析
      const day = date.getDay();
      patterns.weekly = patterns.weekly || {};
      patterns.weekly[day] = (patterns.weekly[day] || 0) + 1;
      
      return patterns;
    }, {});
  }
  
  /**
   * 分析设备特定行为
   * @param {Array} sessions - 会话数据
   * @returns {Object} 设备行为模式
   */
  analyzeDeviceSpecificBehavior(sessions) {
    return sessions.reduce((patterns, session) => {
      const device = session.deviceType || 'unknown';
      
      // 统计设备使用频率
      patterns.usage = patterns.usage || {};
      patterns.usage[device] = (patterns.usage[device] || 0) + 1;
      
      // 分析设备特定的填写速度
      if (session.fillDuration) {
        patterns.speed = patterns.speed || {};
        patterns.speed[device] = patterns.speed[device] || [];
        patterns.speed[device].push(session.fillDuration);
      }
      
      return patterns;
    }, {});
  }
  
  /**
   * 构建用户画像
   * @param {Object} patterns - 模式数据
   * @returns {Object} 用户画像
   */
  buildUserProfile(patterns) {
    const profile = {};
    
    // 个人信息偏好
    if (patterns.personalInfo.names) {
      profile.preferredNames = Array.from(patterns.personalInfo.names);
    }
    
    if (patterns.personalInfo.locations) {
      // 找出最常用的位置
      let mostFrequentLocation = '';
      let maxCount = 0;
      
      for (const [location, count] of patterns.personalInfo.locations.entries()) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentLocation = location;
        }
      }
      
      profile.preferredLocation = mostFrequentLocation;
    }
    
    // 工作信息偏好
    if (patterns.professionalPatterns.companyTitle) {
      // 找出最常用的公司-职位组合
      let mostFrequentCombo = '';
      let maxCount = 0;
      
      for (const [combo, count] of patterns.professionalPatterns.companyTitle.entries()) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentCombo = combo;
        }
      }
      
      profile.preferredWorkInfo = mostFrequentCombo;
    }
    
    // 时间偏好
    if (patterns.temporalPatterns.hourly) {
      // 找出最活跃的时段
      let mostActiveHour = 0;
      let maxCount = 0;
      
      for (const [hour, count] of Object.entries(patterns.temporalPatterns.hourly)) {
        if (count > maxCount) {
          maxCount = count;
          mostActiveHour = parseInt(hour);
        }
      }
      
      profile.preferredHour = mostActiveHour;
    }
    
    // 设备偏好
    if (patterns.deviceSpecific.usage) {
      // 找出最常用的设备
      let preferredDevice = '';
      let maxUsage = 0;
      
      for (const [device, count] of Object.entries(patterns.deviceSpecific.usage)) {
        if (count > maxUsage) {
          maxUsage = count;
          preferredDevice = device;
        }
      }
      
      profile.preferredDevice = preferredDevice;
    }
    
    this.userProfile = profile;
    return profile;
  }
  
  /**
   * 获取用户画像
   * @returns {Object} 用户画像
   */
  getUserProfile() {
    return this.userProfile;
  }
  
  /**
   * 更新用户画像
   * @param {Object} newPatterns - 新模式
   */
  updateUserProfile(newPatterns) {
    // 简化实现，实际应考虑权重和衰减
    Object.assign(this.userProfile, this.buildUserProfile(newPatterns));
  }
}

/**
 * 实时预测引擎类
 * Real-time Prediction Engine
 */
class RealTimePredictionEngine {
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

/**
 * 隐私保护学习类
 * Privacy Preserving Learner
 */
class PrivacyPreservingLearner {
  /**
   * 构造函数
   */
  constructor() {
    // 隐私预算管理
    this.privacyBudget = 1.0;
    this.usedBudget = 0;
  }
  
  /**
   * 使用隐私保护方式学习
   * @param {Array} rawData - 原始数据
   * @param {number} privacyBudget - 隐私预算
   * @returns {Array} 处理后的数据
   */
  learnWithPrivacy(rawData, privacyBudget) {
    // 检查隐私预算
    if (this.usedBudget + privacyBudget > this.privacyBudget) {
      console.warn('Privacy budget exceeded, reducing budget allocation');
      privacyBudget = this.privacyBudget - this.usedBudget;
      if (privacyBudget <= 0) {
        return rawData; // 隐私预算耗尽，不进行隐私保护处理
      }
    }
    
    // 更新已使用的预算
    this.usedBudget += privacyBudget;
    
    // 添加噪声保护隐私
    const noisyData = this.addLaplaceNoise(rawData, privacyBudget);
    
    // 数据泛化防止个人信息泄露
    const generalizedData = this.generalizeSensitiveFields(noisyData);
    
    // 联邦学习风格的本地更新
    return this.updateLocalModel(generalizedData);
  }
  
  /**
   * 添加拉普拉斯噪声
   * @param {Array} data - 数据
   * @param {number} epsilon - 隐私预算参数
   * @returns {Array} 添加噪声后的数据
   */
  addLaplaceNoise(data, epsilon) {
    // 拉普拉斯机制实现差分隐私
    const scale = 1 / epsilon;
    
    return data.map(record => {
      if (typeof record === 'object' && record !== null) {
        const noisyRecord = {};
        for (const [key, value] of Object.entries(record)) {
          if (typeof value === 'number') {
            const noise = this.generateLaplaceNoise(scale);
            noisyRecord[key] = value + noise;
          } else {
            noisyRecord[key] = value; // 非数值字段不添加噪声
          }
        }
        return noisyRecord;
      } else if (typeof record === 'number') {
        const noise = this.generateLaplaceNoise(scale);
        return record + noise;
      }
      return record; // 非数值数据不添加噪声
    });
  }
  
  /**
   * 生成拉普拉斯噪声
   * @param {number} scale - 噪声尺度
   * @returns {number} 拉普拉斯噪声
   */
  generateLaplaceNoise(scale) {
    // 使用Box-Muller变换生成拉普拉斯分布噪声的简化实现
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }
  
  /**
   * 敏感字段泛化
   * @param {Array} data - 数据
   * @returns {Array} 泛化后的数据
   */
  generalizeSensitiveFields(data) {
    return data.map(record => {
      if (typeof record === 'object' && record !== null) {
        const generalizedRecord = { ...record };
        
        // 对需要保护的敏感字段进行泛化
        // 采用不同的策略：
        // 1. 功能性字段（email, phone等）保持原始数据用于UI显示
        // 2. 统计性字段（age, income等）可以适度泛化用于模型训练
        // 3. 高度敏感字段（身份证等）严格保护

        // 年龄字段进行适度泛化
        if (record.age !== undefined) {
          generalizedRecord.age = this.generalizeAge(record.age);
        }
        
        // 收入字段进行适度泛化
        if (record.income !== undefined) {
          generalizedRecord.income = this.generalizeIncome(record.income);
        }
        
        // 身份证字段进行严格泛化
        if (record.idCard !== undefined) {
          generalizedRecord.idCard = this.generalizeIdCard(record.idCard);
        }
        
        // 地址字段进行泛化（保留城市级别信息）
        if (record.address !== undefined) {
          generalizedRecord.address = this.generalizeLocation(record.address);
        }
        
        return generalizedRecord;
      }
      return record;
    });
  }
  
  /**
   * 年龄泛化
   * @param {any} age - 年龄
   * @returns {string|any} 泛化后的年龄
   */
  generalizeAge(age) {
    if (typeof age === 'number') {
      if (age < 18) return 'minor';
      if (age < 30) return 'young-adult';
      if (age < 50) return 'middle-aged';
      if (age < 65) return 'senior';
      return 'elderly';
    }
    return age;
  }
  
  /**
   * 收入泛化
   * @param {any} income - 收入
   * @returns {string|any} 泛化后的收入
   */
  generalizeIncome(income) {
    if (typeof income === 'number') {
      if (income < 30000) return 'low';
      if (income < 60000) return 'medium';
      if (income < 100000) return 'high';
      return 'very-high';
    }
    return income;
  }
  
  /**
   * 位置泛化
   * @param {any} location - 位置
   * @returns {string|any} 泛化后的位置
   */
  generalizeLocation(location) {
    if (typeof location === 'string') {
      // 只保留城市级别信息，移除具体地址
      const parts = location.split(',');
      if (parts.length > 1) {
        return parts[0].trim(); // 只返回城市名
      }
      return location;
    }
    return location;
  }
  
  /**
   * 电话号码泛化
   * @param {any} phone - 电话号码
   * @returns {string|any} 泛化后的电话号码
   */
  generalizePhone(phone) {
    if (typeof phone === 'string') {
      // 移除详细号码信息，只保留区号
      const matches = phone.match(/\(\d{3}\)/); // 匹配区号格式 (XXX)
      if (matches && matches[0]) {
        return matches[0]; // 只返回区号
      }
      return '***';
    }
    return phone;
  }
  
  /**
   * 邮箱泛化
   * @param {any} email - 邮箱
   * @returns {string|any} 泛化后的邮箱
   */
  generalizeEmail(email) {
    if (typeof email === 'string' && email.includes('@')) {
      const [username, domain] = email.split('@');
      // 隐藏用户名详细信息
      const hiddenUsername = username.charAt(0) + '***' + username.charAt(username.length - 1);
      return `${hiddenUsername}@${domain}`;
    }
    return email;
  }
  
  /**
   * 身份证号泛化（示例）
   * @param {any} idCard - 身份证号
   * @returns {string|any} 泛化后的身份证号
   */
  generalizeIdCard(idCard) {
    if (typeof idCard === 'string' && idCard.length >= 18) {
      // 保留前6位（地区码）和后1位（校验码），中间用*代替
      return idCard.substring(0, 6) + '**********' + idCard.substring(17);
    }
    return idCard;
  }
  
  /**
   * 更新本地模型
   * @param {Array} data - 数据
   * @returns {Array} 更新后的数据
   */
  updateLocalModel(data) {
    // 在实际实现中，这里会更新本地预测模型
    // 简化实现，直接返回数据
    console.log('Updating local model with privacy-preserving data');
    return data;
  }
  
  /**
   * 重置隐私预算
   */
  resetPrivacyBudget() {
    this.usedBudget = 0;
  }
  
  /**
   * 获取剩余隐私预算
   * @returns {number} 剩余预算
   */
  getRemainingBudget() {
    return this.privacyBudget - this.usedBudget;
  }
}

/**
 * 本地存储类
 * Local Storage Wrapper
 */
class LocalStorage {
  /**
   * 构造函数
   * @param {string} prefix - 存储键前缀
   */
  constructor(prefix = 'smart-form-') {
    this.prefix = prefix;
    this.isEnabled = this._testStorageAvailability();
  }
  
  /**
   * 测试存储可用性
   * @returns {boolean} 是否可用
   */
  _testStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('Local storage is not available:', e);
      return false;
    }
  }
  
  /**
   * 设置存储项
   * @param {string} key - 键
   * @param {any} value - 值
   */
  setItem(key, value) {
    if (!this.isEnabled) return;
    
    try {
      const fullKey = this.prefix + key;
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(fullKey, serializedValue);
    } catch (e) {
      console.error('Failed to set item in localStorage:', e);
    }
  }
  
  /**
   * 获取存储项
   * @param {string} key - 键
   * @returns {any} 值
   */
  getItem(key) {
    if (!this.isEnabled) return null;
    
    try {
      const fullKey = this.prefix + key;
      const serializedValue = window.localStorage.getItem(fullKey);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue);
    } catch (e) {
      console.error('Failed to get item from localStorage:', e);
      return null;
    }
  }
  
  /**
   * 删除存储项
   * @param {string} key - 键
   */
  removeItem(key) {
    if (!this.isEnabled) return;
    
    try {
      const fullKey = this.prefix + key;
      window.localStorage.removeItem(fullKey);
    } catch (e) {
      console.error('Failed to remove item from localStorage:', e);
    }
  }
  
  /**
   * 清空所有存储项
   */
  clear() {
    if (!this.isEnabled) return;
    
    try {
      // 只清空带前缀的项
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        window.localStorage.removeItem(key);
      });
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
  }
  
  /**
   * 获取所有带前缀的键
   * @returns {Array} 键数组
   */
  getAllKeys() {
    if (!this.isEnabled) return [];
    
    try {
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (e) {
      console.error('Failed to get keys from localStorage:', e);
      return [];
    }
  }
}

/**
 * 字段验证器类
 * Field Validator
 */
class FieldValidator {
  /**
   * 构造函数
   */
  constructor() {
    // 预定义的验证规则
    this.rules = {
      email: this._validateEmail,
      phone: this._validatePhone,
      url: this._validateUrl,
      number: this._validateNumber,
      date: this._validateDate,
      required: this._validateRequired
    };
  }
  
  /**
   * 验证字段
   * @param {HTMLElement} field - 字段元素
   * @param {any} value - 字段值
   * @returns {Object} 验证结果
   */
  validate(field, value) {
    const fieldName = field.name || field.id || 'unknown';
    const fieldType = field.type || 'text';
    const validations = [];
    
    // 检查HTML5验证属性
    if (field.required) {
      validations.push({
        rule: 'required',
        valid: this.rules.required(value),
        message: `${fieldName} is required`
      });
    }
    
    if (field.pattern) {
      validations.push({
        rule: 'pattern',
        valid: this._validatePattern(value, field.pattern),
        message: `${fieldName} does not match the required pattern`
      });
    }
    
    if (field.minLength) {
      validations.push({
        rule: 'minLength',
        valid: this._validateMinLength(value, field.minLength),
        message: `${fieldName} must be at least ${field.minLength} characters`
      });
    }
    
    if (field.maxLength) {
      validations.push({
        rule: 'maxLength',
        valid: this._validateMaxLength(value, field.maxLength),
        message: `${fieldName} must be no more than ${field.maxLength} characters`
      });
    }
    
    // 基于字段类型验证
    if (this.rules[fieldType]) {
      validations.push({
        rule: fieldType,
        valid: this.rules[fieldType](value),
        message: `${fieldName} is not a valid ${fieldType}`
      });
    }
    
    // 基于字段名称验证
    const nameBasedValidation = this._getNameBasedValidation(fieldName, value);
    if (nameBasedValidation) {
      validations.push(nameBasedValidation);
    }
    
    // 检查是否有任何验证失败
    const isValid = validations.every(validation => validation.valid);
    
    return {
      valid: isValid,
      validations: validations,
      errors: validations.filter(v => !v.valid).map(v => v.message)
    };
  }
  
  /**
   * 验证邮箱
   * @param {any} value - 值
   * @returns {boolean} 是否有效
   */
  _validateEmail(value) {
    if (value === null || value === undefined || value === '') return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
  
  /**
   * 验证电话号码
   * @param {any} value - 值
   * @returns {boolean} 是否有效
   */
  _validatePhone(value) {
    if (value === null || value === undefined || value === '') return true;
    // 简化的电话号码验证
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(value);
  }
  
  /**
   * 验证URL
   * @param {any} value - 值
   * @returns {boolean} 是否有效
   */
  _validateUrl(value) {
    if (value === null || value === undefined || value === '') return true;
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * 验证数字
   * @param {any} value - 值
   * @returns {boolean} 是否有效
   */
  _validateNumber(value) {
    if (value === null || value === undefined || value === '') return true;
    return !isNaN(Number(value));
  }
  
  /**
   * 验证日期
   * @param {any} value - 值
   * @returns {boolean} 是否有效
   */
  _validateDate(value) {
    if (value === null || value === undefined || value === '') return true;
    // 简化的日期验证
    return !isNaN(Date.parse(value));
  }
  
  /**
   * 验证必填字段
   * @param {any} value - 值
   * @returns {boolean} 是否有效
   */
  _validateRequired(value) {
    if (value === null || value === undefined) return false;
    return value.toString().trim() !== '';
  }
  
  /**
   * 验证正则表达式模式
   * @param {any} value - 值
   * @param {string} pattern - 正则表达式
   * @returns {boolean} 是否有效
   */
  _validatePattern(value, pattern) {
    if (value === null || value === undefined || value === '') return true;
    try {
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch (e) {
      console.warn('Invalid pattern regex:', pattern);
      return true; // 如果正则表达式无效，跳过验证
    }
  }
  
  /**
   * 验证最小长度
   * @param {any} value - 值
   * @param {number} minLength - 最小长度
   * @returns {boolean} 是否有效
   */
  _validateMinLength(value, minLength) {
    if (value === null || value === undefined || value === '') return true;
    return value.toString().length >= minLength;
  }
  
  /**
   * 验证最大长度
   * @param {any} value - 值
   * @param {number} maxLength - 最大长度
   * @returns {boolean} 是否有效
   */
  _validateMaxLength(value, maxLength) {
    if (value === null || value === undefined || value === '') return true;
    return value.toString().length <= maxLength;
  }
  
  /**
   * 基于字段名称的验证
   * @param {string} fieldName - 字段名称
   * @param {any} value - 值
   * @returns {Object|null} 验证结果或null
   */
  _getNameBasedValidation(fieldName, value) {
    const lowerName = fieldName.toLowerCase();
    
    // 邮箱验证
    if (lowerName.includes('email')) {
      return {
        rule: 'email',
        valid: this._validateEmail(value),
        message: 'Please enter a valid email address'
      };
    }
    
    // 电话验证
    if (lowerName.includes('phone') || lowerName.includes('tel')) {
      return {
        rule: 'phone',
        valid: this._validatePhone(value),
        message: 'Please enter a valid phone number'
      };
    }
    
    // URL验证
    if (lowerName.includes('url') || lowerName.includes('website')) {
      return {
        rule: 'url',
        valid: this._validateUrl(value),
        message: 'Please enter a valid URL'
      };
    }
    
    // 数字验证
    if (lowerName.includes('number') || lowerName.includes('count') || lowerName.includes('amount')) {
      return {
        rule: 'number',
        valid: this._validateNumber(value),
        message: 'Please enter a valid number'
      };
    }
    
    return null;
  }
  
  /**
   * 添加自定义验证规则
   * @param {string} ruleName - 规则名称
   * @param {Function} validator - 验证函数
   */
  addRule(ruleName, validator) {
    if (typeof validator === 'function') {
      this.rules[ruleName] = validator;
    } else {
      throw new Error('Validator must be a function');
    }
  }
  
  /**
   * 批量验证表单数据
   * @param {Object} formData - 表单数据
   * @param {Object} fieldElements - 字段元素映射
   * @returns {Object} 验证结果
   */
  validateForm(formData, fieldElements = {}) {
    const results = {};
    let isFormValid = true;
    
    for (const [fieldName, value] of Object.entries(formData)) {
      const fieldElement = fieldElements[fieldName] || { name: fieldName };
      const fieldResult = this.validate(fieldElement, value);
      
      results[fieldName] = fieldResult;
      if (!fieldResult.valid) {
        isFormValid = false;
      }
    }
    
    return {
      valid: isFormValid,
      fields: results
    };
  }
}

/**
 * 智能表单预测主类
 * Smart Form Predictor Main Class
 */
class SmartFormPredictor {
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
      this.models.get(fieldName);
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

export { SmartFormPredictor };
//# sourceMappingURL=smart-form-predictor.esm.js.map
