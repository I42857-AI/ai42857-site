---
name: ZhiShi-TuPu
version: 1.0.0
description: 知识图谱资源库——菜品档案、人物档案、风格档案、分镜类型等视觉知识体系
trigger_words: 知识图谱、图谱、档案、菜品档案、人物档案、风格档案、分镜类型、知识库、知识图谱
category: data
skillType: data
dataType: knowledge-graphs
---

# ZhiShi-TuPu — 知识图谱资源库

> 数据型技能：不包含执行逻辑，仅提供知识图谱数据供其他技能/Agent按需读取。

## 目录结构

| 子目录 | 内容类型 | 说明 |
|--------|---------|------|
| CaiPin-FenJing/ | 菜品分镜档案 | 菜品视觉分镜参考 |
| CangQiong/ | 苍穹系统数据 | 项目发现与注册数据 |
| EAGLE/ | EAGLE素材库 | 设计素材索引 |
| JiaoBen-ZhiShiTuPu/ | 知识图谱脚本 | 图谱生成与管理脚本 |
| Billfish/ | Billfish 素材库 | 图片素材管理 |
| MrBeast-FangFaLun/ | MrBeast方法论 | 内容创作方法 |
| NvWa-Skill/ | 女娲技能 | 技能体系 |
| PromptXtar/ | Prompt星表 | 提示词模板库 |
| Roaming-ZhuCeBiao/ | 漫游注册表 | 移动设备项目注册表 |
| SETUNA2/ | SETUNA2 | 工具数据 |
| Understand-Anything/ | 理解万物 | 概念解析体系 |
| Zhaimomo-XiangQing/ | 宅默默详情 | 具体项目档案 |

## 使用方式

Agent 需要访问知识图谱数据时：
1. 读取本 SKILL.md 了解目录结构
2. 根据需求定位子目录
3. 读取具体文件获取数据

## 注册信息

- 数据源：/workspace/.agents/ZhiShi-TuPu/
- 类型：knowledge-graphs（数据型，无执行逻辑）
- HB来源：I42857-AI/.agents
