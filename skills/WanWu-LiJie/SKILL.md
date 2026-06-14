---
name: understand-anything
description: >
  知识图谱生态系统统一入口。代码分析→图谱生成→Dashboard可视化→档案规范→分镜类型→视频分析。
  当用户要求分析代码库、生成知识图谱、查看项目架构、理解代码关系、启动 Dashboard、
  创建菜品/人物/风格档案、定义分镜类型、注册节点类型、拆分合并图谱文件、
  分析视频钩子、生成视频报告时使用。
  触发词：分析代码库、知识图谱、understand、architecture graph、代码架构、项目结构分析、Dashboard、
  菜品档案、人物档案、风格档案、分镜类型、类型注册、文件拆分、钩子分析、视频报告。
---

# Understand-Anything 知识图谱技能

知识图谱生态系统的统一入口，涵盖从代码分析到可视化到档案规范的全链路。

================================================================================
按需加载索引（触发词匹配时读取 CanKao/ 下对应文件）
================================================================================

  | 触发词 | 加载文件 | 内容 |
  |--------|----------|------|
  | schema/节点类型/边类型/字段定义/passthrough | CanKao/schema.md | 知识图谱 Schema（21种节点+35种边） |
  | 错误排查/验证失败/dropped/404 | CanKao/errors.md | 常见错误与修复 |
  | 人物档案案例/character profile case | CanKao/03-character-profile.md | 人物档案案例 |
  | 菜品档案案例/dish profile case | CanKao/04-dish-profile.md | 菜品档案案例 |
  | 风格档案案例/style profile case | CanKao/05-style-profile.md | 风格档案案例 |
  | 布局原则/layout principles/表格设计 | CanKao/06-layout-principles.md | 布局原则与表格设计 |
  | 钩子分析/hook analyzer/前三秒/分镜提取 | CanKao/07-hook-analyzer.md | 视频钩子分析 |
  | 报告生成/report generator/视频分析报告 | CanKao/08-report-generator.md | 视频分析报告生成 |
  | 菜品档案/CaiPinDangAn/字段模板/三景别 | CanKao/09-caipin-dangan.md | 菜品档案规范（14字段+三景别+色调映射） |
  | 分镜类型/FenJingLeiXing/shot type/T1-T6/叙事骨架 | CanKao/10-fenjing-leixing.md | 六种分镜类型规范 |
  | 人物档案/RenWuDangAn/character profile/signatureTrait | CanKao/11-renwu-dangan.md | 人物档案规范 |
  | 风格档案/FengGeDangAn/style profile/风格配方 | CanKao/12-fengge-dangan.md | 风格档案规范（7种配方+8核心字段） |
  | 类型注册/LeiXingZhuCe/type registration/节点注册/边注册 | CanKao/13-leixing-zhuce.md | 类型注册规范（三步注册法+注册表） |
  | 文件拆分/WenJianChaiFen/file split/分段合并 | CanKao/14-wenjian-chaifen.md | 文件拆分与合并规范 |
  | 技法档案/JiFaDangAn/technique profile/六大分类 | CanKao/15-jifa-dangan.md | 技法档案规范（7字段+六大分类+格式规范） |
  | 总控/ZongKong/任务路由/三层架构/故障速查 | CanKao/16-zongkong.md | 知识图谱总控（三层架构+分区规范+故障速查） |
  | 创作操作系统/五步决策法/分形结构/缩略图/AI误导词 | CanKao/17-chuangzuo.md | 多维度生态创作操作系统（五步决策法+9镜分形） |
  | 常见问题/故障/GRAPH_DIR/编码/边类型 | CanKao/18-changjian-wenti.md | 常见问题（17个问题及解决方案） |
  | 故障排查/Dashboard黑屏/Schema验证/JSON解析 | CanKao/19-guzhang-paicha.md | 故障排查记录（#001-#015） |
  | 项目迁移/Symlink/虫洞/便携启动/数据清理 | CanKao/20-qianyi.md | 项目迁移指导（6种迁移场景+编码安全） |
  | 网站部署/GitHub Pages/Cloudflare/域名 | CanKao/21-bushu.md | 个人网站部署指南（零成本+JSON合并） |

  脚本位置：
  - 钩子分析：`CanKao/JiaoBen/analyze_hook_segments.py`
  - 报告生成：`CanKao/JiaoBen/generate_report.py`

  加载规则：
  - 任务涉及触发词对应场景时，用 Read 工具加载对应文件
  - 可同时加载多个文件（如创建菜品档案需 04+09+13）
  - 核心层规则与详细层冲突时，以核心层为准

================================================================================
核心定位
================================================================================

用户没有 Claude Code，无法使用 `/understand` 命令。本技能由 AI Agent 手动完成代码库分析、知识图谱生成和 Dashboard 启动的全流程。

================================================================================
项目路径配置
================================================================================

  UA_PROJECT_DIR=/workspace/XiangMu-KongJian/Understand-Anything
  UA_ARCHIVE_DIR=/workspace/.agents/ZhiShi-TuPu

  关键子目录：
  - Core 包：`$UA_PROJECT_DIR/understand-anything-plugin/packages/core/`
  - Dashboard：`$UA_PROJECT_DIR/understand-anything-plugin/packages/dashboard/`
  - Schema 验证：`$UA_PROJECT_DIR/understand-anything-plugin/packages/core/dist/schema.js`

  ⚠️ 归档目录规则：知识图谱文件**必须**归档到 `$UA_ARCHIVE_DIR/<项目名>/` 目录下，
  **绝不能**保存在 `$UA_PROJECT_DIR` 中，否则会污染技能库。

  Dashboard 启动时 `GRAPH_DIR` 应指向 `$UA_ARCHIVE_DIR/<项目名>/`。

================================================================================
数据架构（小文件合并渲染模式）
================================================================================

  知识图谱采用"小文件合并渲染"模式：每个项目的图谱数据是独立的 JSON 小文件，Dashboard 按需加载渲染。

  | 层级 | 文件 | 性质 | 是否保留 |
  |------|------|------|----------|
  | 本体数据源 | `scan-manifest.json` | 确定性扫描产物 | 保留，不重复提取 |
  | 本体数据源 | `analysis-batch-*.json` | LLM 分析产物 | 保留，不重复提取 |
  | 合并文件 | `assembled-graph.json` | 中间合并产物 | Phase 5 后清理 |
  | 最终产物 | `knowledge-graph.json` | Dashboard 直接加载 | **唯一必需文件** |

  数据流：
  ```
  scan-manifest.json ──┐
                        ├── merge ──→ assembled-graph.json ──→ knowledge-graph.json
  analysis-batch-*.json ┘
  ```

  ⚠️ 关键约束：
  1. 不要重复提取本体数据源
  2. 区分合并文件（可重新生成）和最终产物
  3. Dashboard 只加载 `knowledge-graph.json`
  4. 归档到 `$UA_ARCHIVE_DIR/<项目名>/.understand-anything/`

================================================================================
字段设计核心机制（详见 CanKao/13-leixing-zhuce.md）
================================================================================

  知识图谱中所有节点类型和边类型必须通过三步注册法统一注册，确保 Dashboard 正确渲染。

  **三步注册法**：
  1. **注册表**：在 `schema.md` 的节点/边类型注册表中添加新类型（12个维度/5个维度）
  2. **视觉属性**：定义颜色、图标、形状等视觉标识
  3. **Dashboard 组件映射**：在 Dashboard 代码中添加渲染组件映射

  **节点类型注册表核心维度**（12个）：
  | 维度 | 说明 |
  |------|------|
  | type | 类型标识符（如 dish/character/style） |
  | label | 中文显示名 |
  | color | 节点颜色 |
  | icon | 图标 |
  | description | 类型描述 |
  | requiredFields | 必需字段列表 |
  | optionalFields | 可选字段列表 |
  | defaultSize | 默认节点大小 |
  | passthrough | 透传字段（Dashboard 不渲染，但保留在数据中） |
  | aliases | 类型别名映射（如 service→dish） |
  | parentType | 父类型（继承关系） |
  | dashboardComponent | Dashboard 渲染组件 |

  **NODE_TYPE_ALIASES**：Schema 中定义的别名映射，合并时自动规范化。
  例：`service` → `dish`（service 是 dish 的别名，合并时统一为 dish）

  **新增类型流程**：
  ```
  需求 → 注册表添加类型 → 定义视觉属性 → Dashboard组件映射 → 验证渲染 → 完成
  ```

  **Dashboard 渲染层级**：
  1. 通用渲染（默认）：所有未注册类型使用通用节点渲染
  2. 类型专属渲染：注册了 dashboardComponent 的类型使用专属组件
  3. 别名渲染：别名类型继承目标类型的渲染方式

================================================================================
环境要求
================================================================================

  | 工具 | 版本 | 说明 |
  |------|------|------|
  | Node.js | >= 22 | 系统预装（node --version 验证） |
  | pnpm | >= 10 | npm install -g pnpm 安装 |

================================================================================
工作流程
================================================================================

  ### 步骤 1：扫描目标代码库
  1. LS 列出项目根目录结构
  2. Glob 查找所有源文件
  3. 读取关键配置文件
  4. 识别语言、框架、项目类型

  ### 步骤 2：读取源文件并提取结构
  1. 读取每个源文件，提取功能摘要、导出、依赖、调用关系
  2. 为每个文件生成 1-2 句中文摘要
  3. 识别架构分层

  ### 步骤 3：构建知识图谱 JSON
  按照 Schema 生成 `knowledge-graph.json`，保存到归档目录。
  详见 CanKao/schema.md

  关键要点：
  - 每条边**必须**包含 `direction` 字段
  - 节点 `type` 必须是 Schema 定义的类型之一（或通过注册表新增）
  - 所有文本内容使用中文

  ### 步骤 4：验证知识图谱
  使用 Core 包的 `validateGraph` 验证，必须看到 `Success: true`

  ### 步骤 5：创建汉化配置
  创建 `config.json`：`{ "autoUpdate": false, "outputLanguage": "zh" }`

  ### 步骤 6：启动 Dashboard
  ```bash
  cd "$UA_PROJECT_DIR/understand-anything-plugin/packages/dashboard"
  GRAPH_DIR="$UA_ARCHIVE_DIR/<项目名>" npx vite --host 127.0.0.1
  ```
  ⚠️ `GRAPH_DIR` 必须指向**项目根目录**，不是 `.understand-anything` 子目录！

  ### 步骤 7：更新 Dashboard 启动器
  更新 `Dashboard-QiDong.sh` 中的项目菜单选项。

================================================================================
常见错误
================================================================================

  | 错误 | 原因 | 修复 |
  |------|------|------|
  | `Missing or invalid project metadata` | project 字段缺失 | 确保包含全部6个必需子字段 |
  | 节点被 dropped | type 不在合法枚举中 | 参见 CanKao/schema.md |
  | 边被 dropped | 缺少 direction | 每条边必须包含 direction |
  | Dashboard 404 | GRAPH_DIR 指向了 .understand-anything | 改为项目根目录 |

  详见 CanKao/errors.md

================================================================================
首次构建
================================================================================

  ```bash
  cd "$UA_PROJECT_DIR"
  pnpm install
  pnpm --filter @understand-anything/skill build
  pnpm --filter @understand-anything/dashboard build
  ```

================================================================================
最后更新：2026-06-14（沙箱环境适配版：路径默认沙箱 + Bash 替代 PowerShell）
