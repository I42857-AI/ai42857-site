---
name: DouBao-ShengTu
description: 豆包生图多屏设计技能。基于豆包Seedream 5.0模型，支持漫画/电商详情页/产品展示/品牌故事等多屏设计，角色一致性通过提示词前缀锚定，分图生成+网页预览展示。当用户要求创建漫画、四格漫画、电商详情页、产品展示图、品牌故事、连载漫画时使用。
metadata:
  priority: P1
  version: 2.0.0
  model: Doubao-Seedream-5.0
  api: text_to_image
  triggers:
    - 漫画
    - 四格漫画
    - 电商详情页
    - 产品展示图
    - 品牌故事
    - 连载漫画
    - 豆包生图
    - 多屏设计
    - 分镜设计
---

# 豆包生图（DouBao-ShengTu）

基于豆包 Seedream 5.0 的多屏设计技能，融合 baoyu-comic 叙事体系与 WenShengTu 提示词工程。

**适用场景**（非仅漫画）：
- 🎬 漫画/四格漫画/连载漫画/知识漫画
- 🛒 电商详情页（每一屏=一个分镜）
- 📦 产品展示图套组（多角度/拆解/场景）
- 🏷️ 品牌故事（多屏叙事）
- 📱 App引导页/Onboarding流程
- 🖼️ 任何需要多张独立图+网页排列展示的设计

**核心机制**：每个"分镜"=一张独立图，N张图+CSS Grid排列=完整作品。

**核心差异**（vs 原 baoyu-comic）：
- 默认后端：豆包 Seedream 5.0（TRAE text_to_image API），非 baoyu-imagine
- 角色一致性：提示词前缀锚定，非 --ref 参考图
- 展示方式：HTML 网页预览，非 PDF 合并
- 多格布局：N张独立图 + CSS Grid/Flexbox 排列，非单张多格
- 提示词语言：中文原文，非英文

## API 信息

- **URL**：`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={URL编码的提示词}&image_size={image_size}`
- **模型**：豆包 Seedream 5.0
- **认证**：需 TRAE 内部认证，外部脚本无法直接调用
- **CDN**：aka.doubaocdn.com，短链接快速过期，需即时保存

### image_size 分辨率对照表

| image_size | 实际分辨率 | 适用场景 |
|------------|-----------|----------|
| square_hd | 1024×1024 | 单格漫画/图标/商标 |
| landscape_16_9 | 1368×768 | 场景/海报/横版全景 |
| landscape_4_3 | 1216×912 | 横版漫画页 |
| portrait_4_3 | 912×1216 | 竖版漫画页 |
| portrait_16_9 | 768×1368 | 竖版人物特写 |

⚠️ 非官方参数全部回退为 1024×1024

## 提示词铁律（P0 强制）

1. **中文原文不翻译**：提示词使用中文，一字不改直接使用，不翻译不精简
2. **必须指定模型**：尾部追加"使用豆包Seedream 5.0模型生成"
3. **分图生成**：每格/每页独立生成一张图，不做合图构图指令（豆包无法执行多格布局）
4. **无文字例外**：漫画对话需加"无文字（""引号内文字除外）"
5. **超详细 > 精简**：角色核心特征描述200字 > 3-5关键词，豆包会偷懒
6. **每格必须自包含**：禁止"同上场景""同车库场景"等跨格引用，每格必须完整写出环境+光线+构图——豆包每次生成是独立上下文，无法理解引用
7. **角色外貌不可精简**：每格出现角色时必须写完整外貌描述（含年代造型），如"乔布斯（1980年代造型：短发，圆框眼镜，深色西装外套+蝴蝶结领带）"而非仅"乔布斯"；但描述范围需与景别匹配——近景特写不写鞋子，远景全身不省略全身搭配

## 角色一致性策略

豆包每次生成是独立上下文，无法使用参考图片（--ref）。角色一致性通过**提示词前缀锚定**实现。

**⚠️ 自包含原则**：每格提示词对豆包来说是唯一的输入，它不知道其他格的内容。因此：
- 禁止使用"同上场景""同车库场景"等跨格引用
- 每格必须完整写出环境、光线、构图
- 角色外貌每格必须完整描述（含年代造型），不可省略为"乔布斯"三个字
- 年代造型变化必须在角色锚定中体现（如"青年期长发及肩赤脚"vs"后期黑高领衫圆框眼镜"）

**景别自适应原则**：角色描述的详细程度必须与景别匹配，避免矛盾：
- **近景特写**（头部/肩部）：仅描述脸型+发型+眼睛+眼镜+表情+领口/面料纹理
- **中景半身**（腰部以上）：脸型+发型+眼睛+眼镜+表情+上半身服装款式/面料/纹理
- **远景全身**：脸型+发型+体型+全身搭配+鞋子+整体轮廓
- ⚠️ 近景特写不应出现鞋子/下半身描述，远景不应省略全身搭配——描述范围与画面范围矛盾会导致AI混乱

### 三层锚定结构

```
[角色锚定前缀]（每张图相同） + [分格场景描述]（每张图不同） + [品质参数后缀]（每张图相同）
```

**角色锚定前缀**包含：
- 画风锚定：画风名称 + 线条处理 + 色彩方法
- 角色视觉特征：脸型/发型/眼睛/体型/辨识特征
- 服装配色：默认着装/颜色方案/配饰

**分格场景描述**包含：
- 叙事角色（起/承/转/合）
- 角色姿势/表情/动作
- 对话文字（引号内）
- 环境提示（极简/详细视画风而定）

**品质参数后缀**包含：
- 无文字例外声明
- image_size
- 4K分辨率
- 模型指定

### 一致性提示词模板

```
{画风}风格漫画，{线条处理}，{色彩方法}。{角色名}：{脸型}，{发型}，{眼睛}，{体型}，{辨识特征}，穿{服装}，{配色}。{分格场景描述}，{对话}，{环境}，无文字（""引号内文字除外），{image_size}，4K分辨率。使用豆包Seedream 5.0模型生成
```

### 多角色场景

当一格中出现多个角色时，前缀中列出所有角色的视觉特征：

```
{画风}风格漫画。角色A：{特征}，穿{服装}。角色B：{特征}，穿{服装}。{场景描述}...
```

## 微表情图标系统（通用情感化设计）

在提示词描述中嵌入**小型情感化图标/简笔头像**，极大提升整个项目的亲切度和设计感。这不是装饰，是**信息传达的加速器**——纯文字描述情绪太抽象，小图标一眼传达。

### 核心原则

1. **图标即信息**：每个图标必须承载具体语义（情绪/动作/发言人），不做纯装饰
2. **风格统一**：同一项目内图标风格一致（简约线条/扁平色块/手绘风），在项目注册表中声明
3. **位置固定**：图标出现在固定位置（对话气泡左侧/卡片角落/标签旁），形成视觉节奏
4. **与主体区分**：图标用简化/抽象风格，与主画面写实/漫画风格形成层次对比

### 跨项目类型应用

| 项目类型 | 图标用法 | 示例 |
|---------|---------|------|
| 详情页 | 表情图标+动作图标，配在功能卡片/信息标签旁 | ①摸头图标→屏幕笑眯眯 ②拥抱图标→安心闭眼 ③摇晃图标→转圈眼 |
| 漫画 | 简笔头像气泡，标识发言人+当前情绪 | 对话气泡左侧简笔乔布斯头像（圆框眼镜+微笑） |
| 海报 | 情绪标签图标，强化核心信息 | 心形图标+文字"热爱"，闪电图标+文字"突破" |
| 品牌故事 | IP形象微动作图标，串联叙事 | IP耳朵竖起图标→开心段落，IP耳朵垂下图标→感动段落 |
| App引导页 | 步骤图标+状态表情 | ①设置图标（认真脸）→ ②连接图标（期待脸）→ ③完成图标（开心脸） |

### 提示词描述规范

在提示词中描述微表情图标时，使用**固定句式**：

```
{位置}{图标风格}图标：{图标内容}，配文字"{标签文字}"
```

**详情页示例**：
```
画面左下角薰衣草紫卡片，卡片上排列四个简约风格图标：
①摸头图标→屏幕笑眯眯
②拥抱图标→屏幕安心闭眼微笑
③摇晃图标→屏幕转圈眼
④冷落图标→屏幕嘟嘴
```

**漫画示例**：
```
对话气泡左侧简笔头像图标（圆框眼镜+微笑表情），气泡内文字"我们改变世界"
```

**海报示例**：
```
标题右侧心形简约图标，配文字"热爱"
```

### 项目注册表声明

每个项目在注册表中声明图标风格：

```yaml
微表情图标:
  风格: "简约线条" | "扁平色块" | "手绘风"
  用途: ["表情图标配功能卡片", "简笔头像配对话气泡", "情绪标签配标题"]
  配色: 跟随项目辅色（薰衣草紫/品牌辅色）
```

## 画风 × 氛围系统

### 画风（6种）

| 画风 | 特征 | 豆包适配度 | 详见 |
|------|------|-----------|------|
| minimalist | 极简线条+点缀色，简笔角色 | ★★★★ | CanKao/huabi-fengge/minimalist.md |
| manga | 日漫风格，大眼细线 | ★★★★ | CanKao/huabi-fengge/manga.md |
| ligne-claire | 清线风格，平涂色彩 | ★★★ | CanKao/huabi-fengge/ligne-claire.md |
| realistic | 写实风格，光影细节 | ★★★ | CanKao/huabi-fengge/realistic.md |
| ink-brush | 水墨风格，留白意境 | ★★★ | CanKao/huabi-fengge/ink-brush.md |
| chalk | 粉笔风格，纹理质感 | ★★ | CanKao/huabi-fengge/chalk.md |

### 氛围（7种）

| 氛围 | 特征 | 详见 |
|------|------|------|
| neutral | 中性/商业/教育 | CanKao/fenwei/neutral.md |
| warm | 温馨/柔和 | CanKao/fenwei/warm.md |
| dramatic | 戏剧性/高对比 | CanKao/fenwei/dramatic.md |
| romantic | 浪漫/装饰元素 | CanKao/fenwei/romantic.md |
| energetic | 活力/高饱和 | CanKao/fenwei/energetic.md |
| vintage | 复古/怀旧 | CanKao/fenwei/vintage.md |
| action | 动作/动态线条 | CanKao/fenwei/action.md |

### 预设（8种）

预设 = 画风 + 氛围 + 特殊规则，包含超出纯画风+氛围组合的额外约束。

| 预设 | 等效组合 | 钩子/特殊规则 | 适用场景 |
|------|---------|-------------|----------|
| four-panel | minimalist + neutral | 起承转合4格+点缀色+简笔角色 | 商业寓言/四格漫画 |
| ohmsha | manga + neutral | 视觉隐喻+无说教头+道具展示 | 教育/科普漫画 |
| wuxia | ink-brush + action | 气效果+战斗视觉+氛围感 | 武侠/仙侠 |
| shoujo | manga + romantic | 装饰元素+眼睛细节+浪漫节拍 | 浪漫/校园 |
| concept-story | manga + warm | 视觉符号+成长弧线+对话动作平衡 | 商业叙事/管理寓言 |
| xiangqing-ye | realistic + warm | 标题层级+品牌色系统+产品锚定+垂直堆叠 | 电商详情页 |
| dianShang-zhuTu | realistic + neutral | 白底/场景/卖点/细节+方形+横向排列 | 电商主图套组 |
| haiBao | realistic + dramatic | 视觉冲击+极简文字+大留白+套组 | 海报/社交封面 |

选择预设时需加载 `CanKao/yushe/{preset}.md` 获取完整规则。

### 兼容性矩阵

| 画风 | ✓✓ 最佳 | ✓ 可用 | ✗ 避免 |
|------|---------|--------|--------|
| minimalist | neutral | warm、energetic | dramatic、vintage、romantic、action |
| manga | neutral、romantic、energetic、action | warm、dramatic | vintage |
| ligne-claire | neutral、warm | dramatic、vintage、energetic | romantic、action |
| realistic | neutral、warm、dramatic、vintage | action | romantic、energetic |
| ink-brush | neutral、dramatic、action、vintage | warm | romantic、energetic |
| chalk | neutral、warm、energetic | vintage | dramatic、action、romantic |

### 自动选择

内容信号 → 预设/画风+氛围 的对照表见 [CanKao/zidong-xuanze.md](CanKao/zidong-xuanze.md)。

## 四格漫画规则（核心预设）

### 分图生成策略

四格漫画采用 **4张独立图** 方案：
- 每格独立生成一张 square_hd 图片
- 角色一致性通过提示词前缀锚定
- 4张图在网页中用 CSS Grid 排列为 2×2 布局
- ⚠️ 不使用单张2×2网格（文字模糊+细节差）

### 起承转合叙事结构

| 分格 | 位置 | 叙事角色 | 要求 |
|------|------|---------|------|
| 1 | 左上 | 起（铺垫） | 建立情境，介绍角色/问题 |
| 2 | 右上 | 承（发展） | 添加复杂化或尝试 |
| 3 | 左下 | 转（转折） | **最重要的分格**，反转/洞察/顿悟 |
| 4 | 右下 | 合（结论） | 解决/点睛之笔/教训 |

### 点缀色系统

- 主要黑白线条画（90%+）
- 1-2种点缀色（默认橙色 #FF6B35）
- 颜色仅用于概念/对象/标签，角色保持黑白
- 分格3（转）应有最强色彩强调
- 所有4格使用一致的点缀色

### 角色设计规则

- 简化的简笔画式角色
- 通过简单道具区分：领带、眼镜、帽子、公文包
- 无详细面部——最多点状眼睛、线条嘴巴
- 每条最多 2-3 个角色

### 四格提示词示例

格1（起）：
```
极简风格单格漫画，纯白背景，黑色线条画配橙色(#FF6B35)点缀色。一个戴圆框眼镜的上班族男性，圆头点眼线条嘴，简笔画风格，坐在简单办公桌前，桌上整齐放着3份文件和1杯咖啡，人物表情平静微笑，头顶椭圆对话气泡内写"今天一定要准时下班"，橙色下划线标注"决心"，极简环境提示仅一条线表示地面和简单桌子轮廓，无文字（""引号内文字除外），square_hd，4K分辨率。使用豆包Seedream 5.0模型生成
```

## 工作流

### 进度清单

```
漫画进度：
- [ ] 步骤 1：分析内容
- [ ] 步骤 2：确认画风与选项 ⚠️ 必需
- [ ] 步骤 3：生成分镜 + 角色
- [ ] 步骤 4：审核大纲（条件性）
- [ ] 步骤 5：生成提示词
- [ ] 步骤 6：审核提示词（条件性）
- [ ] 步骤 7：生成图片 + 网页展示
- [ ] 步骤 8：完成报告
```

### 步骤概要

| 步骤 | 操作 | 关键输出 |
|------|------|---------|
| 1 | 分析内容 | `analysis.md` |
| 2 | 确认画风、重点、受众、审核 ⚠️ | 用户偏好 |
| 3 | 生成分镜 + 角色 | `storyboard.md`、`characters/` |
| 4 | 审核大纲（如请求） | 用户批准 |
| 5 | 生成提示词 | `prompts/*.md` |
| 6 | 审核提示词（如请求） | 用户批准 |
| 7 | 生成图片 + 网页 | `*.png` + `preview.html` |
| 8 | 完成报告 | 摘要 |

### 步骤 1：分析内容

读取源内容，深度分析：
1. 保存源内容（若用户提供文件路径则原样使用，粘贴内容则保存到 `source.md`）
2. 深度分析（目标受众/价值主张/核心主题/关键人物/内容信号）
3. 检测源语言
4. 确定推荐页数和画风/氛围/布局
5. 保存至 `analysis.md`

### 步骤 2：确认画风与选项 ⚠️ 必需

使用 AskUserQuestion 确认：
1. **视觉风格**：推荐预设 or 自定义画风+氛围
2. **叙事重点**：传记/概念解释/历史事件/教程
3. **目标受众**：一般读者/学生/专业人士/儿童
4. **大纲审核**：是否在生成前审核
5. **提示词审核**：是否在生成前审核提示词

### 步骤 3：生成分镜 + 角色

加载风格参考（`CanKao/huabi-fengge/{art}.md` + `CanKao/fenwei/{tone}.md` + 可选 `CanKao/yushe/{preset}.md`），生成：

1. **分镜**（`storyboard.md`）：封面设计 + 每页分格拆解 + 视觉提示词
2. **角色定义**（`characters/characters.md`）：角色视觉特征 + 服装配色 + 表情范围

模板参考：CanKao/fenjing-moban.md、CanKao/juese-moban.md

### 步骤 5：生成提示词

为每格/每页创建图片生成提示词，保存至 `prompts/NN-{cover|page|panel}-[slug].md`。

**提示词结构**：
```
[角色锚定前缀] + [分格场景描述] + [品质参数后缀]
```

**四格漫画**：4个独立提示词文件，每个对应一格。

**多页漫画**：每页一个提示词文件，包含该页所有分格的描述。

### 步骤 7：生成图片 + 网页展示

1. 为每格/每页调用 TRAE text_to_image API 生成独立图片
2. 创建 HTML 预览页面：
   - 四格漫画：CSS Grid 2×2 布局
   - 多页漫画：垂直滚动布局
   - 每张图下方展示提示词（**默认折叠**，点击展开查看）
3. 启动本地 HTTP 服务（JiaoBen/yulan-fuwu.js，端口 8766+）
4. 用户在浏览器中预览，右键另存为保存图片

⚠️ **网页交付三要素（P0 强制，缺一不可）**：
1. **五色标注**：提示词必须用 `colorizePrompt()` 函数解析并着色，不得以纯文本展示
2. **折叠展开**：每个提示词必须用 `<details><summary>` 包裹，默认折叠
3. **复制按钮**：summary 右侧必须有复制按钮，复制原始提示词（无HTML标签）

缺少任何一项 = 交付不合格，必须重做。

**网页展示规范**：
- 提示词默认折叠（`<details><summary>查看提示词</summary>...</details>`），点击展开
- 提示词使用**五色标注**，帮助用户对照理解
- 每个提示词块底部附图例说明

**提示词交互组件**（通用，所有预览页面必须包含）：

```html
<div class="prompt-details">
  <details>
    <summary>
      <span class="summary-left">查看提示词</span>
      <button class="copy-btn" onclick="event.preventDefault();copyPrompt(id,this)">复制</button>
    </summary>
    <div class="prompt-content" id="promptRaw{id}">{五色标注后的提示词}</div>
  </details>
</div>
```

```css
.prompt-details summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.summary-left::before { content: "▸ "; transition: transform 0.2s; display: inline-block; }
.prompt-details details[open] .summary-left::before { transform: rotate(90deg); }
.copy-btn {
  font-size: 12px;
  background: #F3E8FF;
  border: 1px solid #DDD6FE;
  border-radius: 6px;
  padding: 2px 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.copy-btn:hover { background: #DDD6FE; }
.copy-btn.copied { background: #D1FAE5; color: #059669; border-color: #6EE7B7; }
```

```javascript
// 存储原始提示词（无HTML标签），供复制使用
const promptMap = {};  // id -> 原始提示词文本

function copyPrompt(id, btn) {
  const text = promptMap[id];
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '已复制';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('copied'); }, 1500);
  }).catch(() => {
    // fallback: 兼容旧浏览器
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '已复制';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('copied'); }, 1500);
  });
}
```

**设计要点**：
- 默认收缩：保证图片预览流畅度，21屏详情页不会因提示词展开而页面过长
- 右侧复制按钮：`event.preventDefault()` 防止点击复制时误触展开 details
- 复制原始文本：`promptMap` 存储无HTML标签的纯文本，复制到剪贴板可直接使用
- 复制反馈：按钮变绿显示"已复制"，1.5秒后恢复

**五色标注规格**（通用体系，项目级注册）：

五色标注不是按预设类型硬编码，而是**每个项目启动时根据实际提示词结构自行注册**到项目注册表。构建项目时，Agent 分析提示词中的字段类型，将每种字段映射到一种颜色。

CSS 类名定义（固定5色）：
```css
.pc-purple { color: #C084FC; }  /* 第1色：风格/体系锚定 */
.pc-red    { color: #FF6B6B; }  /* 第2色：主体锚定 */
.pc-blue   { color: #60A5FA; }  /* 第3色：场景/布局描述 */
.pc-gold   { color: #FBBF24; font-weight: bold; }  /* 第4色：文字内容（加粗） */
.pc-green  { color: #4ADE80; }  /* 第5色：品质参数 */
.pc-legend { margin-top: 10px; padding-top: 8px; border-top: 1px dashed #333; font-size: 0.75em; color: #666; }
.pc-legend span { margin-right: 12px; }
```

**颜色→字段映射规则**（Agent 注册时的参考）：

| 颜色 | 通用语义 | 注册原则 |
|------|---------|---------|
| 🟣 紫色 | 风格/体系锚定 | 每张图相同的风格/配色/体系描述 |
| 🔴 红色 | 主体锚定 | 每张图相同的角色/产品/主体特征 |
| 🔵 蓝色 | 场景/布局描述 | 每张图不同的环境/构图/布局 |
| 🟡 金色 | 文字内容（加粗） | 所有需要用户对照理解的文字：对话/标题/正文/标签 |
| 🟢 绿色 | 品质参数 | 每张图相同的 image_size+分辨率+模型 |

**注册示例**：

漫画项目注册：
```yaml
五色标注注册:
  紫色: "画风锚定（日漫风格+线条+色彩方法）"
  红色: "角色锚定（乔布斯/沃兹/斯卡利/艾维视觉特征）"
  蓝色: "场景描述（分格场景+环境+构图+镜头）"
  金色: "对话文字（对话气泡+旁白框内文字）"
  绿色: "品质参数（landscape_4_3+4K+Seedream 5.0）"
  金色匹配规则: ["对话气泡'...'", "旁白框'...'", "文字'...'"]
```

详情页项目注册：
```yaml
五色标注注册:
  紫色: "画风/配色锚定（realistic风格+品牌色60-30-10）"
  红色: "产品锚定（星灵家族外观特征）"
  蓝色: "布局/场景描述（卡片+产品位置+装饰）"
  金色: "标题/正文/标签（大字号标题+副标题+正文+标签）"
  绿色: "品质参数（portrait_4_3+4K+Seedream 5.0）"
  金色匹配规则: ["大字号标题\"...\"", "副标题\"...\"", "正文\"...\"", "标签\"...\""]
```

海报项目注册：
```yaml
五色标注注册:
  紫色: "画风/配色锚定（realistic风格+配色方案）"
  红色: "主体锚定（产品/人物视觉特征）"
  蓝色: "构图/场景描述（构图+场景+视觉冲击元素）"
  金色: "主标题/副标题（大字号标题+副标题）"
  绿色: "品质参数（portrait_16_9+4K+Seedream 5.0）"
  金色匹配规则: ["大字号标题\"...\"", "副标题\"...\""]
```

JavaScript 标注解析逻辑（`colorizePrompt(prompt, colorConfig)` 函数）：
1. **提取品质参数后缀**（绿色）：匹配 `无文字（""引号内文字除外），{image_size}，4K分辨率。使用豆包Seedream 5.0模型生成$` → `<span class="pc-green">...</span>`
2. **提取风格锚定**（紫色）：匹配画风/配色描述段 → `<span class="pc-purple">...</span>`
3. **提取主体锚定**（红色）：风格锚定之后、场景描述之前的主体特征段 → `<span class="pc-red">...</span>`
4. **提取文字内容**（金色加粗）：根据项目注册表中的 `金色匹配规则` 匹配 → `<span class="pc-gold">"..."</span>`
5. **剩余为场景/布局描述**（蓝色）：文字内容之间的文本 → `<span class="pc-blue">...</span>`
6. **底部图例**：从项目注册表的 `五色标注注册` 生成图例标签

**四格漫画网页模板**：
```html
<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:900px; margin:auto;">
  <div><img src="{格1 URL}"><p>格1-起：{描述}</p></div>
  <div><img src="{格2 URL}"><p>格2-承：{描述}</p></div>
  <div><img src="{格3 URL}"><p>格3-转：{描述}</p></div>
  <div><img src="{格4 URL}"><p>格4-合：{描述}</p></div>
</div>
```

## 脚本目录

**重要**：所有脚本位于本技能的 `JiaoBen/` 子目录下。

| 脚本 | 用途 |
|------|------|
| JiaoBen/yulan-fuwu.js | 本地 HTTP 预览服务（Node.js，端口 8766+） |
| JiaoBen/hebing-yulan.js | 组件化拆分模式：合并 prompts/*.json → preview.html |

**运行方式**：
```bash
node {baseDir}/JiaoBen/yulan-fuwu.js
```

## 文件结构

输出目录：`comic/{topic-slug}/`

### 小型漫画（≤4页）：单文件模式

| 文件 | 描述 |
|------|------|
| `analysis.md` | 内容分析 |
| `storyboard.md` | 含分格拆解的分镜 |
| `characters/characters.md` | 角色定义 |
| `preview.html` | 网页预览页面（含所有提示词） |

### 大型漫画（>4页）：组件化拆分模式

当漫画超过4页时，采用**组件化拆分 + 自动合并**架构，避免单文件过大导致子代理处理缓慢。

```
comic/{topic-slug}/
├── {topic-slug}-ZhuCe-Biao/       ← 项目注册表（=全局设定）
│   └── {topic-slug}-ZhuCe-Biao.md ← 前缀/后缀/角色定义/五色标注规格/项目配置
├── analysis.md                   ← 内容分析
├── characters/characters.md      ← 角色定义
├── storyboard/                   ← 分镜拆分目录
│   ├── storyboard-p01-{slug}.md  ← 第1页分镜（~2-4KB）
│   ├── storyboard-p02-{slug}.md  ← 第2页分镜
│   └── ...                       ← 每页一个文件
├── prompts/                      ← 子代理输出目录
│   ├── prompts-p01.json          ← 第1页提示词JSON
│   ├── prompts-p02.json          ← 第2页提示词JSON
│   └── ...                       ← 每页一个JSON
└── preview.html                  ← 合并脚本生成（勿手动编辑）
```

**拆分规则**：
- 分镜按页拆分，每页一个 `storyboard-p{NN}-{slug}.md` 文件
- 每个文件控制在 **500行以内**（参考 understand-anything 的文件拆分规范）
- 命名：`storyboard-p{页号}-{页面标题拼音}.md`（如 `storyboard-p01-garage.md`）

**项目注册表**（`{topic-slug}-ZhuCe-Biao/{topic-slug}-ZhuCe-Biao.md`）= 全局设定，包含：
- 所有主体锚定前缀（PREFIX_A ~ PREFIX_G 等）
- 品质参数后缀（QZ_SUFFIX）
- 五色标注注册（颜色→字段映射 + 金色匹配规则 + 图例标签）
- image_size 对照表
- 提示词铁律
- 项目元数据（主题/画风/氛围/页数/角色列表）

**子代理工作流**：
1. 主代理读取项目注册表 + 指定页的 `storyboard-p{NN}-*.md`
2. 将两者内容传给子代理
3. 子代理输出 `prompts/prompts-p{NN}.json`，格式：

```json
{
  "page": 1,
  "title": "车库里的两个史蒂夫",
  "stage": "开篇",
  "layout": "2x2",
  "panels": [
    {
      "id": "01-1",
      "position": "左上",
      "narrative": "起（铺垫）",
      "description": "1976年洛杉矶车库，青年乔布斯...",
      "prefix": "PREFIX_B",
      "prompt": "日漫风格漫画，...完整提示词...",
      "dialogue": "沃兹，如果把这个卖给别人呢？"
    }
  ]
}
```

**自动合并**：主代理读取所有 `prompts/prompts-p*.json`，用 HTML 模板 + `colorizePrompt()` 函数生成 `preview.html`。合并逻辑：

```javascript
// 伪代码
const allPages = glob('prompts/prompts-p*.json').sort().map(readJSON);
const html = renderTemplate(allPages);  // HTML模板 + CSS + colorizePrompt()
writeFile('preview.html', html);
```

**优势**：
- 每个子代理只读 ~5KB（全局设定+1页分镜），而非77KB全量
- 多个子代理可并行生成不同页的提示词
- 修改某页只需重新生成该页的JSON，无需重写整个HTML
- 合并步骤轻量（读JSON+套模板），主代理上下文消耗极低

## 备选 API 方案

| 优先级 | 后端 | 说明 |
|--------|------|------|
| 1（默认） | TRAE text_to_image | 豆包 Seedream 5.0，需 TRAE 内部认证 |
| 2 | baoyu-imagine | 第三方技能，支持 --ref 参考图 |
| 3 | 运行时原生工具 | Codex imagegen / Hermes image_generate |

当使用备选后端时：
- **baoyu-imagine**：可使用 --ref 传递角色设定图，角色一致性更好
- **运行时原生工具**：按其文档化接口调用

## 关键限制

- 豆包每次生成是独立上下文，负向约束（"不改变面部结构"）无效
- 单图多格/多人物布局无法精准执行，必须分图生成
- 四格漫画必须用4张独立图，单张2×2网格文字模糊+细节差
- CDN 短链接过期很快，图片需即时保存
- 角色一致性依赖提示词前缀锚定，无法使用参考图片

## 参考文档

- **完整工作流**：[CanKao/gongzuo-liu.md](CanKao/gongzuo-liu.md)
- **提示词模板库**：[CanKao/tishici-moban.md](CanKao/tishici-moban.md)
- **能力边界**：[CanKao/nengli-bianjie.md](CanKao/nengli-bianjie.md)
- **经验教训**：[CanKao/jingyan-jiaoxun.md](CanKao/jingyan-jiaoxun.md)
- **画风详情**：`CanKao/huabi-fengge/{style}.md`
- **氛围详情**：`CanKao/fenwei/{tone}.md`
- **预设详情**：`CanKao/yushe/{preset}.md`
- **布局详情**：`CanKao/buju/{layout}.md`
- **角色模板**：[CanKao/juese-moban.md](CanKao/juese-moban.md)
- **分镜模板**：[CanKao/fenjing-moban.md](CanKao/fenjing-moban.md)
- **自动选择**：[CanKao/zidong-xuanze.md](CanKao/zidong-xuanze.md)
