---
name: chart-visualization
description: 当用户需要可视化数据时使用此技能。智能选择26种可用图表类型中最合适的一种，根据详细规格提取参数，并使用 JavaScript 脚本生成图表图片。
dependency:
  nodejs: ">=18.0.0"
---

# 图表可视化技能

本技能提供将数据转化为可视化图表的完整工作流。涵盖图表选择、参数提取和图片生成。

## 工作流程

可视化数据时，按以下步骤操作：

### 1. 智能图表选择
分析用户的数据特征，确定最合适的图表类型。使用以下指南（并参考 `CanKao/` 目录中的详细规格）：

- **时间序列**：使用 `generate_line_chart`（趋势）或 `generate_area_chart`（累积趋势）。两种不同量纲时使用 `generate_dual_axes_chart`。
- **对比**：使用 `generate_bar_chart`（分类对比）或 `generate_column_chart`。频率分布使用 `generate_histogram_chart`。
- **部分与整体**：使用 `generate_pie_chart` 或 `generate_treemap_chart`（层级结构）。
- **关系与流向**：使用 `generate_scatter_chart`（相关性）、`generate_sankey_chart`（流向）或 `generate_venn_chart`（重叠）。
- **地图**：使用 `generate_district_map`（区域）、`generate_pin_map`（点位）或 `generate_path_map`（路线）。
- **层级与树形**：使用 `generate_organization_chart` 或 `generate_mind_map`。
- **专业图表**：
    - `generate_radar_chart`：多维度对比。
    - `generate_funnel_chart`：流程阶段。
    - `generate_liquid_chart`：百分比/进度。
    - `generate_word_cloud_chart`：文本频率。
    - `generate_boxplot_chart` 或 `generate_violin_chart`：统计分布。
    - `generate_network_graph`：复杂节点-边关系。
    - `generate_fishbone_diagram`：因果分析。
    - `generate_flow_diagram`：流程图。
    - `generate_spreadsheet`：表格数据或数据透视表，用于结构化数据展示和交叉分析。

### 2. 参数提取
选定图表类型后，读取 `CanKao/` 目录中对应的文件（如 `CanKao/generate_line_chart.md`）以识别必需和可选字段。
从用户输入中提取数据，映射到预期的 `args` 格式。

### 3. 图表生成
使用 JSON 载荷调用 `JiaoBen/generate.js` 脚本。

**载荷格式：**
```json
{
  "tool": "generate_chart_type_name",
  "args": {
    "data": [...],
    "title": "...",
    "theme": "...",
    "style": { ... }
  }
}
```

**执行命令：**
```bash
node ./JiaoBen/generate.js '<payload_json>'
```

### 4. 结果返回
脚本将输出生成的图表图片 URL。
向用户返回以下内容：
- 图片 URL。
- 生成时使用的完整 `args`（规格）。

## 参考材料
每种图表类型的详细规格位于 `CanKao/` 目录中。查阅这些文件以确保传递给脚本的 `args` 符合预期的模式。

## 许可证

本 `SKILL.md` 由 [antvis/chart-visualization-skills](https://github.com/antvis/chart-visualization-skills) 提供。
基于 [MIT 许可证](https://github.com/antvis/chart-visualization-skills/blob/master/LICENSE) 授权。
