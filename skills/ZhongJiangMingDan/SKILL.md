---
name: "ZhongJiangMingDan"
description: "Excel中奖名单旺旺号隐私符号化工具。Invoke when user asks to anonymize wangwang IDs in prize/win lists, or mentions symbolizing/obfuscating taobao IDs in winner spreadsheets."
---

# 中奖名单符号化技能

处理中奖名单Excel文件，对旺旺号进行隐私符号化处理。

## 核心规则

| 原始长度 | 符号化方式 | 示例 |
|---------|-----------|------|
| =1 | 直接 `***` | `A` → `***` |
| =2 或 =3 | 前1后1 | `AB` → `A***B`，`张三` → `张***三` |
| >=4 | 前2后2 | `小年糕plus` → `小年***us` |

## 处理逻辑

1. **自动识别标题行**：包含"中奖名单"关键字或"旺旺号"列标题的行保持不变
2. **符号化旺旺号**：对数据行应用上述规则
3. **保留其他列**：订单号、付款时间等列保持不变
4. **输出文件**：在原文件名后加"已符号化"后缀

## 核心函数

```python
def anonymizeWangwang(name):
    """旺旺号符号化核心函数"""
    if not name or not isinstance(name, str):
        return name
    name = str(name).strip()
    length = len(name)
    if length == 1:
        return '***'
    if length <= 3:
        return name[0] + '***' + name[-1]
    return name[:2] + '***' + name[-2:]

def isHeaderRow(cell_value):
    """判断是否为标题行：包含'中奖名单'或等于'旺旺号'"""
    if not cell_value:
        return False
    cell_str = str(cell_value).strip()
    return '中奖名单' in cell_str or cell_str == '旺旺号'
```

## 使用示例

```python
import openpyxl
import os

def anonymizeWangwang(name):
    if not name or not isinstance(name, str):
        return name
    name = str(name).strip()
    length = len(name)
    if length == 1:
        return '***'
    if length <= 3:
        return name[0] + '***' + name[-1]
    return name[:2] + '***' + name[-2:]

def isHeaderRow(cell_value):
    if not cell_value:
        return False
    return '中奖名单' in str(cell_value).strip() or str(cell_value).strip() == '旺旺号'

def processZhongJiangMingDan(input_path):
    base, ext = os.path.splitext(input_path)
    output_path = f"{base}   已符号化.xlsx"
    wb = openpyxl.load_workbook(input_path)
    total_changes = 0
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        for i in range(1, ws.max_row + 1):
            row = list(ws.iter_rows(min_row=i, max_row=i, values_only=True))[0]
            cell_value = row[0] if row else None
            if isHeaderRow(cell_value):
                continue
            if cell_value and isinstance(cell_value, str) and cell_value != '旺旺号':
                original = cell_value.strip()
                anonymized = anonymizeWangwang(original)
                if original != anonymized:
                    total_changes += 1
                    ws.cell(row=i, column=1).value = anonymized
    wb.save(output_path)
    return output_path, total_changes
```

## 注意事项

1. **不硬编码行数**——自动遍历所有行
2. **不硬编码分段数量**——自动识别标题行（包含"中奖名单"关键字）
3. 仅处理第一列（旺旺号所在列）
4. 其他列（订单号、付款时间）保持不变
5. 使用 openpyxl 保持Excel格式和样式
