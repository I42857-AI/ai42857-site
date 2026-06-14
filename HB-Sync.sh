#!/bin/bash
# HB-Sync — 从 GitHub 同步注册的资源目录
# 读取 .skill-lock.json，检查本地路径，缺失则从 HB 拉取
# 用法：bash HB-Sync.sh [--dry-run]

set -euo pipefail

AGENTS_DIR="/workspace/.agents"
LOCK_FILE="${AGENTS_DIR}/.skill-lock.json"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "=== DRY RUN 模式 ==="
fi

echo "=== HB-Sync 资源同步 ==="
echo "注册表: ${LOCK_FILE}"
echo ""

if [[ ! -f "${LOCK_FILE}" ]]; then
  echo "错误: 注册表不存在"
  exit 1
fi

# 用 Node.js 解析 JSON（沙箱预装）
SYNC_RESULT=$(node -e "
const fs = require('fs');
const lock = JSON.parse(fs.readFileSync('${LOCK_FILE}', 'utf8'));
const results = [];

// 遍历 skills 节点
if (lock.skills) {
  for (const [name, entry] of Object.entries(lock.skills)) {
    const dataPath = entry.dataPath || (entry.skillPath ? entry.skillPath.replace('/SKILL.md', '/') : null);
    const localPath = dataPath ? '${AGENTS_DIR}/' + dataPath : '${AGENTS_DIR}/skills/' + name;
    const exists = fs.existsSync(localPath);
    results.push({
      name,
      type: entry.dataType || 'skill',
      localPath,
      exists,
      sourceUrl: entry.sourceUrl || '',
      dataPath: dataPath || ''
    });
  }
}

console.log(JSON.stringify(results, null, 2));
" 2>&1)

if [[ $? -ne 0 ]]; then
  echo "错误: 解析注册表失败"
  echo "${SYNC_RESULT}"
  exit 1
fi

# 统计
TOTAL=$(echo "${SYNC_RESULT}" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.length)")
MISSING=$(echo "${SYNC_RESULT}" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.filter(i=>!i.exists).length)")
EXISTING=$((TOTAL - MISSING))

echo "注册资源: ${TOTAL} 个"
echo "已存在:   ${EXISTING} 个"
echo "缺失:     ${MISSING} 个"
echo ""

if [[ "${MISSING}" -eq 0 ]]; then
  echo "所有资源已就绪，无需同步"
  exit 0
fi

# 显示缺失项
echo "--- 缺失资源 ---"
echo "${SYNC_RESULT}" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
d.filter(i=>!i.exists).forEach(i => {
  console.log('  [' + i.type + '] ' + i.name + ' → ' + i.localPath);
});
"
echo ""

# 拉取缺失资源
if [[ "${DRY_RUN}" == true ]]; then
  echo "DRY RUN: 跳过拉取"
  exit 0
fi

# 注意：不能用 git sparse-checkout，因为它会重置整个工作目录
# 改用 git checkout 单独恢复缺失文件
echo "--- 开始同步 ---"
cd "${AGENTS_DIR}"

MISSING_PATHS=$(echo "${SYNC_RESULT}" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
d.filter(i=>!i.exists).forEach(i => {
  const p = i.dataPath || 'skills/' + i.name;
  console.log(p);
});
")

for path in ${MISSING_PATHS}; do
  echo "拉取: ${path}"
  git checkout HEAD -- "${path}" 2>/dev/null || echo "  警告: ${path} 在 HB 中不存在"
done

echo ""
echo "=== 同步完成 ==="

# 验证
REMAINING=0
echo "${SYNC_RESULT}" | node -e "
const fs = require('fs');
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
let missing = 0;
d.filter(i=>!i.exists).forEach(i => {
  if (!fs.existsSync(i.localPath)) {
    console.log('  仍缺失: ' + i.name + ' → ' + i.localPath);
    missing++;
  } else {
    console.log('  已就绪: ' + i.name);
  }
});
process.exit(missing > 0 ? 1 : 0);
" && echo "所有资源已就绪" || echo "部分资源仍缺失，请检查"
