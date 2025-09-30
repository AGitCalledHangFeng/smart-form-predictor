/**
 * 本地存储类
 * Local Storage Wrapper
 */
export class LocalStorage {
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