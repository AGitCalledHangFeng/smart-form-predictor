# Smart Form Predictor - 智能表单预测库

一个基于本地机器学习的前端库，能够学习用户的表单填写习惯，在用户输入时提供智能预测和自动完成，**所有数据处理均在本地进行，确保隐私安全**。

## 在线示例

- [基础示例](https://github.com/AGitCalledHangFeng/smart-form-predictor/blob/main/example/index.html)
- [Element UI 集成示例](https://github.com/AGitCalledHangFeng/smart-form-predictor/blob/main/example/element-ui-example.html)

## 核心特性

- **完全本地化** - 所有数据处理在浏览器完成
- **零配置学习** - 自动适应用户填写习惯
- **隐私安全** - 个人信息永不离开用户设备
- **框架无关** - 兼容React、Vue、Angular及原生JS
- **轻量高效** - 核心库小于50KB，预测响应<100ms

## 技术架构

### 核心模块设计

```javascript
class SmartFormPredictor {
  constructor(options) {
    this.models = new Map();      // 字段预测模型
    this.patterns = new Map();    // 用户行为模式
    this.storage = new LocalStorage(); // 本地数据存储
    this.validator = new FieldValidator(); // 字段验证器
  }
  
  // 公共API
  async init(formSelector) { /* 初始化表单监控 */ }
  async predict(field, context) { /* 预测字段值 */ }
  async learnFromSubmission(formData) { /* 从提交中学习 */ }
  getSuggestions(field, partialValue) { /* 获取输入建议 */ }
}
```

### 数据流架构

```
用户输入 → 模式识别 → 预测生成 → 建议展示 → 用户反馈 → 模型更新
    ↓         ↓           ↓          ↓          ↓         ↓
 事件监听 → 特征提取 → 机器学习 → UI渲染 → 选择记录 → 再训练
```

## 安装

```bash
npm install smart-form-predictor
```

## 基本使用

### 1. 引入库

```javascript
import { SmartFormPredictor } from 'smart-form-predictor';
```

### 2. 初始化

```javascript
// 初始化
const predictor = await SmartFormPredictor.init({
  forms: ['#registration-form', '#checkout-form'],
  learning: true,
  privacy: {
    localOnly: true,
    autoForget: true, // 定期清理旧数据
    anonymize: true   // 匿名化处理
  }
});

// 自动开始监控和学习
```

### 3. 高级配置

```javascript
const advancedPredictor = await SmartFormPredictor.init({
  forms: 'form[data-smart]',
  features: {
    crossSiteLearning: true,  // 跨网站学习（同域名下）
    behavioralAnalysis: true, // 分析用户行为模式
    contextAware: true        // 考虑设备、时间等上下文
  },
  prediction: {
    confidenceThreshold: 0.8,
    maxSuggestions: 3,
    autoComplete: 'smart'     // 智能自动完成
  },
  ui: {
    highlightPredictions: true,
    showConfidence: false,    // 不显示置信度以免干扰用户
    animation: 'smooth'
  }
});
```

## 与UI组件库集成

Smart Form Predictor 设计为与各种UI组件库兼容，包括 Element UI、Ant Design Vue 等。

### Element UI 集成示例

请查看 [Element UI 集成示例](https://github.com/AGitCalledHangFeng/smart-form-predictor/blob/main/example/element-ui-example.html) 了解如何将 Smart Form Predictor 与 Element UI 组件集成。

关键步骤：
1. 为每个表单字段添加事件监听器（input、focus、blur）
2. 在事件处理函数中调用 `predictor.getSuggestions()` 获取建议
3. 创建自定义建议容器并显示建议
4. 监听 `smart-form-suggestion` 自定义事件以获取实时预测建议

```javascript
// 监听自定义事件
field.addEventListener('smart-form-suggestion', (event) => {
  const { prediction } = event.detail;
  if (prediction && prediction.alternatives && prediction.alternatives.length > 0) {
    showSuggestionsWithAlternatives(field, prediction.alternatives);
  }
});
```

## 核心技术实现

### 1. 字段关系图谱构建

通过分析用户填写表单的历史数据，构建字段间的关联关系图谱，包括：
- 基于共现频率的关联发现
- 基于填写顺序的时间关联
- 基于值依赖的逻辑关联

### 2. 本地机器学习模型

针对不同类型的字段采用不同的机器学习算法：
- 决策树模型（分类字段）
- 线性回归模型（数值字段）
- 马尔可夫链模型（文本字段）
- K近邻算法（通用模型）

### 3. 特征工程系统

提取多维度特征用于预测：
- 表单上下文特征
- 用户行为特征
- 语义特征
- 用户上下文特征（设备、时间等）

### 4. 跨会话模式学习

识别用户在不同表单间的填写一致性，建立个性化填写档案。

### 5. 实时预测引擎

并行运行多个轻量级预测模型，基于置信度进行预测结果融合。

## API 参考

### SmartFormPredictor.init(options)

初始化智能表单预测器。

**参数:**
- `options` (Object): 配置选项
  - `forms` (string|Array): 表单选择器
  - `learning` (boolean): 是否启用学习功能
  - `privacy` (Object): 隐私设置
  - `prediction` (Object): 预测设置
  - `ui` (Object): UI设置

### predictor.predict(field, context)

预测字段值。

### predictor.learnFromSubmission(formData)

从提交数据中学习。

### predictor.getSuggestions(field, partialValue)

获取输入建议。

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 隐私声明

Smart Form Predictor 严格遵守隐私保护原则：
1. 所有数据处理均在用户本地浏览器中进行
2. 不会将任何个人数据发送到外部服务器

## 许可证

MIT License