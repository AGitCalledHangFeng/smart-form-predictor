/**
 * 字段关系图谱类
 * Field Relationship Graph
 */
export class FieldRelationshipGraph {
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