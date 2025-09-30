/**
 * 字段验证器类
 * Field Validator
 */
export class FieldValidator {
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