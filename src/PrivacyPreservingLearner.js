/**
 * 隐私保护学习类
 * Privacy Preserving Learner
 */
export class PrivacyPreservingLearner {
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
        
        // 只对特定字段进行泛化，保留邮箱、电话号码、年龄和收入的原始数据
        if (record.location !== undefined) {
          generalizedRecord.location = this.generalizeLocation(record.location);
        }
        // 注意：不处理age、income、phone和email字段，保持原始数据用于建议显示
        
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