/**
 * 跨会话学习类
 * Cross Session Learner
 */
export class CrossSessionLearner {
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