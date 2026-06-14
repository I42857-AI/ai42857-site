#!/bin/bash
# 沙箱一键恢复脚本
# 用法：bash /workspace/.agents/ShaXiang-HuiFu.sh
# 功能：克隆仓库 + 虫洞化同步 + 恢复项目规则 + 创建总控目录

set -euo pipefail

readonly GITHUB_TOKEN="gho_REDACTED"
readonly GITHUB_USER="I42857-AI"
readonly REPO_NAME=".agents"
readonly WORKSPACE="/workspace"
readonly AGENTS_DIR="${WORKSPACE}/.agents"

echo "========================================="
echo "  沙箱一键恢复 v1.0.0"
echo "  $(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S') (北京时间)"
echo "========================================="

# Step 1: 克隆仓库（如果不存在）
if [ -d "${AGENTS_DIR}/.git" ]; then
    echo "[1/4] 仓库已存在，拉取最新..."
    cd "${AGENTS_DIR}" && git pull
else
    echo "[1/4] 克隆仓库..."
    git clone "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git" "${AGENTS_DIR}"
fi

# Step 2: 虫洞化同步
echo "[2/4] 虫洞化同步技能..."
bash "${AGENTS_DIR}/Skills-TongBu.sh"

# Step 3: 恢复项目规则（Symlink 指向数据源）
echo "[3/4] 恢复项目规则..."
mkdir -p "${WORKSPACE}/.trae/rules"
if [ -L "${WORKSPACE}/.trae/rules/project_rules.md" ]; then
    echo "[SKIP] 项目规则已是 Symlink"
elif [ -f "${WORKSPACE}/.trae/rules/project_rules.md" ]; then
    rm "${WORKSPACE}/.trae/rules/project_rules.md"
    ln -s "${AGENTS_DIR}/project_rules.md" "${WORKSPACE}/.trae/rules/project_rules.md"
    echo "[OK] 项目规则已改为 Symlink"
else
    ln -s "${AGENTS_DIR}/project_rules.md" "${WORKSPACE}/.trae/rules/project_rules.md"
    echo "[OK] 项目规则 Symlink 已创建"
fi

# Step 4: 创建总控目录
echo "[4/4] 创建总控目录..."
mkdir -p "${WORKSPACE}/.rizhi"
mkdir -p "${WORKSPACE}/.jiaoben"
mkdir -p "${WORKSPACE}/XiangMu-KongJian"
mkdir -p "${WORKSPACE}/.zhuce-biao"

# 同步项目空间和日志
if [ -d "${AGENTS_DIR}/XiangMu-KongJian" ]; then
    cp -rn "${AGENTS_DIR}/XiangMu-KongJian/"* "${WORKSPACE}/XiangMu-KongJian/" 2>/dev/null || true
fi
if [ -d "${AGENTS_DIR}/.rizhi" ]; then
    cp -rn "${AGENTS_DIR}/.rizhi/"* "${WORKSPACE}/.rizhi/" 2>/dev/null || true
fi

echo ""
echo "========================================="
echo "  恢复完成！"
echo "  技能数: $(ls /root/.trae-cn/skills/ | wc -l)"
echo "  项目规则: $(cat ${WORKSPACE}/.trae/rules/project_rules.md | head -1)"
echo "========================================="
