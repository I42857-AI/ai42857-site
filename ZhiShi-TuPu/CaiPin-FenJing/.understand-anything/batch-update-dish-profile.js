/**
 * 批量更新菜品JSON文件，对齐14字段菜品档案规范
 * 
 * 变更逻辑：
 * 1. ingredientOrigin → 合并到 coreIngredients
 * 2. techniqueDifficulty → 合并到 cookingTechnique（前缀）
 * 3. saucesSides → 合并到 tasteProfile（后缀）
 * 4. stateTransition → 合并到 cookingTechnique（后缀）
 * 5. 删除旧字段：ingredientOrigin, techniqueDifficulty, saucesSides, stateTransition
 * 6. 新增字段：cameraSetup, colorTone, bestAngle, thumbnailFrame
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = 'Z:\\PC\\ZhiShi-TuPu\\CaiPin-FenJing\\.understand-anything';

const FILES = [
  'knowledge-graph-dishes-jingdian-zhushi.json',
  'knowledge-graph-dishes-xunwei-guangdong.json',
  'knowledge-graph-dishes-xiangyu-chuanwei.json',
  'knowledge-graph-dishes-xinpai-yuecai.json',
  'knowledge-graph-dishes-siji-yangsheng.json',
  'knowledge-graph-dishes-zhenxuan-haiwei.json',
  'knowledge-graph-dishes-jiangxin-xiaowei.json',
  'knowledge-graph-dishes-tianyuan-shishu.json',
  'knowledge-graph-dishes-zhuchu-tuijian.json',
];

// ─── 菜品类型检测 ───

function detectDishType(cuisineCategory, tags, name) {
  const cat = (cuisineCategory || '') + ' ' + (tags || []).join(' ') + ' ' + (name || '');
  
  // 烧腊类
  if (/烧腊|烧鹅|叉烧|乳鸽|脆皮|烧肉|烤乳猪/.test(cat)) return 'shaolao';
  // 蒸品类
  if (/蒸|白切|清蒸/.test(cat)) return 'zhengpin';
  // 炒类
  if (/炒|镬气|干炒|生炒/.test(cat)) return 'chao';
  // 煲仔类
  if (/煲仔|煲$|砂锅|炖/.test(cat)) return 'baozai';
  // 点心类
  if (/点心|虾饺|烧卖|肠粉|叉烧包|蛋挞|凤爪/.test(cat)) return 'dianxin';
  // 粥品类
  if (/粥/.test(cat)) return 'zhou';
  // 汤品类
  if (/汤/.test(cat)) return 'tang';
  // 凉拌类
  if (/凉拌|小菜|酱萝卜|云耳/.test(cat)) return 'liangban';
  // 时蔬类
  if (/时蔬|菜心|油麦菜|芥兰|生菜|蔬菜/.test(cat)) return 'shishu';
  // 海鲜类
  if (/海鲜|鱼|虾|蟹|贝|鲍鱼|龙虾|斑/.test(cat)) return 'haixian';
  
  return 'default';
}

// ─── 新字段赋值 ───

function getCameraSetup(dishType) {
  const map = {
    shaolao: 'ARRI Alexa Mini + Cooke S7/i Full Frame Plus',
    zhengpin: 'ARRI Alexa Mini LF + Zeiss Supreme Prime',
    chao:     'RED V-Raptor + Sigma Cine Classic',
    dianxin:  'Sony FX6 + Sony FE 90mm f/2.8 Macro G OSS',
    default:  'Canon R5 C + RF 100mm f/2.8L Macro IS',
  };
  return map[dishType] || map.default;
}

function getColorTone(dishType) {
  const map = {
    shaolao:  '烧腊暖金',
    zhengpin: '清蒸冷白',
    chao:     '镬气橙红',
    baozai:   '镬气橙红',
    dianxin:  '点心柔粉',
    zhou:     '清蒸冷白',
    tang:     '清蒸冷白',
    liangban: '清蒸冷白',
    shishu:   '清蒸冷白',
    haixian:  '清蒸冷白',
    default:  '烧腊暖金',
  };
  return map[dishType] || map.default;
}

function getBestAngle(dishType) {
  const map = {
    shaolao:  '皮肉切面',
    zhengpin: '蒸汽揭盖',
    chao:     '镬气翻腾',
    baozai:   '酱汁淋落',
    dianxin:  '破坏瞬间',
    zhou:     '蒸汽揭盖',
    tang:     '蒸汽揭盖',
    liangban: '皮肉切面',
    shishu:   '皮肉切面',
    haixian:  '蒸汽揭盖',
    default:  '皮肉切面',
  };
  return map[dishType] || map.default;
}

function getBestAngleDesc(bestAngle) {
  const map = {
    '皮肉切面': '皮肉切面特写',
    '蒸汽揭盖': '蒸汽揭盖瞬间',
    '镬气翻腾': '镬气翻腾瞬间',
    '酱汁淋落': '酱汁淋落瞬间',
    '破坏瞬间': '破坏瞬间特写',
  };
  return map[bestAngle] || bestAngle;
}

function generateThumbnailFrame(dishName, bestAngle, colorTone, closeupFeature) {
  const angleDesc = getBestAngleDesc(bestAngle);
  // 从closeupFeature提取质感关键词前20字
  const textureKeywords = (closeupFeature || '').substring(0, 20);
  return `${dishName}，${angleDesc}，${colorTone}色调，极浅景深，背景全暗，左上45度侧光，${textureKeywords}，蒸汽/油光粒子，9:16竖屏构图，极致特写，无人物出镜，无文字叠加`;
}

// ─── 字段合并逻辑 ───

function mergeIngredientOrigin(coreIngredients, ingredientOrigin) {
  if (!ingredientOrigin || ingredientOrigin.trim() === '') return coreIngredients;
  if (!coreIngredients || coreIngredients.trim() === '') return ingredientOrigin;
  
  // 如果ingredientOrigin已包含括号标注（如"澳洲M5和牛肋排（澳大利亚维多利亚州牧场）"），
  // 说明已经是完整食材+产地格式，直接用作新的coreIngredients
  if (/（[^）]+）/.test(ingredientOrigin)) {
    return ingredientOrigin;
  }
  
  // 否则，将产地信息追加到coreIngredients末尾
  return coreIngredients + '（' + ingredientOrigin + '）';
}

function mergeTechniqueDifficulty(cookingTechnique, techniqueDifficulty) {
  if (!techniqueDifficulty || techniqueDifficulty.trim() === '') return cookingTechnique;
  
  // 如果techniqueDifficulty是简短难度等级（极高/高/中/低），加方括号前缀
  if (/^[极高高中低]+$/.test(techniqueDifficulty.trim())) {
    return '[' + techniqueDifficulty.trim() + '] ' + cookingTechnique;
  }
  
  // 如果是描述性文字，也加方括号前缀
  return '[' + techniqueDifficulty.trim() + '] ' + cookingTechnique;
}

function mergeSaucesSides(tasteProfile, saucesSides) {
  if (!saucesSides || saucesSides.trim() === '') return tasteProfile;
  return tasteProfile + '，配:' + saucesSides;
}

function mergeStateTransition(cookingTechnique, stateTransition) {
  if (!stateTransition || stateTransition.trim() === '') return cookingTechnique;
  return cookingTechnique + '（' + stateTransition + '）';
}

// ─── 主处理逻辑 ───

let totalFiles = 0;
let totalNodes = 0;
let totalMerged = 0;
let totalNewFields = 0;
const details = [];

for (const fileName of FILES) {
  const filePath = path.join(BASE_DIR, fileName);
  
  if (!fs.existsSync(filePath)) {
    details.push(`[跳过] ${fileName} — 文件不存在`);
    continue;
  }
  
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    details.push(`[错误] ${fileName} — 读取失败: ${e.message}`);
    continue;
  }
  
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    details.push(`[错误] ${fileName} — JSON解析失败: ${e.message}`);
    continue;
  }
  
  let fileNodeCount = 0;
  let fileMergedCount = 0;
  let fileNewFieldCount = 0;
  
  if (!data.nodes || !Array.isArray(data.nodes)) {
    details.push(`[跳过] ${fileName} — 无nodes数组`);
    continue;
  }
  
  for (const node of data.nodes) {
    if (!node.metadata || !node.metadata.dishProfile) continue;
    
    const dp = node.metadata.dishProfile;
    fileNodeCount++;
    
    // 1. 合并 ingredientOrigin → coreIngredients
    if (dp.ingredientOrigin) {
      dp.coreIngredients = mergeIngredientOrigin(dp.coreIngredients, dp.ingredientOrigin);
      delete dp.ingredientOrigin;
      fileMergedCount++;
    }
    
    // 2. 合并 techniqueDifficulty → cookingTechnique（前缀）
    if (dp.techniqueDifficulty) {
      dp.cookingTechnique = mergeTechniqueDifficulty(dp.cookingTechnique, dp.techniqueDifficulty);
      delete dp.techniqueDifficulty;
      fileMergedCount++;
    }
    
    // 3. 合并 saucesSides → tasteProfile（后缀）
    if (dp.saucesSides) {
      dp.tasteProfile = mergeSaucesSides(dp.tasteProfile, dp.saucesSides);
      delete dp.saucesSides;
      fileMergedCount++;
    }
    
    // 4. 合并 stateTransition → cookingTechnique（后缀）
    if (dp.stateTransition) {
      dp.cookingTechnique = mergeStateTransition(dp.cookingTechnique, dp.stateTransition);
      delete dp.stateTransition;
      fileMergedCount++;
    }
    
    // 5. 新增字段
    const dishType = detectDishType(dp.cuisineCategory, node.tags, dp.name);
    
    dp.cameraSetup = getCameraSetup(dishType);
    dp.colorTone = getColorTone(dishType);
    dp.bestAngle = getBestAngle(dishType);
    dp.thumbnailFrame = generateThumbnailFrame(dp.name, dp.bestAngle, dp.colorTone, dp.closeupFeature);
    fileNewFieldCount += 4;
  }
  
  // 写回文件（UTF-8, 2-space indent, 末尾换行）
  const output = JSON.stringify(data, null, 2) + '\n';
  try {
    fs.writeFileSync(filePath, output, 'utf8');
  } catch (e) {
    details.push(`[错误] ${fileName} — 写入失败: ${e.message}`);
    continue;
  }
  
  totalFiles++;
  totalNodes += fileNodeCount;
  totalMerged += fileMergedCount;
  totalNewFields += fileNewFieldCount;
  
  details.push(`[完成] ${fileName} — ${fileNodeCount}个菜品，${fileMergedCount}次合并，${fileNewFieldCount}个新字段`);
}

// ─── 输出汇总 ───

console.log('========================================');
console.log('  菜品JSON批量更新 — 执行报告');
console.log('========================================');
console.log('');
console.log('总文件数:', totalFiles);
console.log('总菜品数:', totalNodes);
console.log('总合并次数:', totalMerged);
console.log('总新增字段:', totalNewFields);
console.log('');
console.log('--- 文件明细 ---');
for (const d of details) {
  console.log(d);
}
console.log('');
console.log('========================================');
console.log('  执行完毕');
console.log('========================================');
