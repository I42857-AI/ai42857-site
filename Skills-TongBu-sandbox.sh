#!/usr/bin/env bash
# ==============================================================================
# Skills-TongBu-sandbox.sh — 沙箱适配版（无 root/无 git/无 node）
# 把原始脚本的 /workspace、/root 路径全部映射到 ~ 下
# ==============================================================================
set -euo pipefail

readonly AGENTS_DIR="$HOME/.agents"
readonly SKILLS_DIR="${AGENTS_DIR}/skills"
readonly ENTITY_DIR="${AGENTS_DIR}/skills"       # 实体层=数据源本身
readonly WORMHOLE_DIR="$HOME/.trae-cn/skills"     # 虫洞层
readonly LOCK_FILE="${AGENTS_DIR}/.skill-lock.json"
readonly TRAE_RULES_DIR="$HOME/.trae/rules"

SUCCESS=0; SKIP=0; ERROR=0

log_info()    { echo "[INFO] $*"; }
log_ok()      { echo "[OK]   $*"; SUCCESS=$((SUCCESS+1)); }
log_skip()    { echo "[SKIP] $*"; SKIP=$((SKIP+1)); }
log_err()     { echo "[ERR]  $*"; ERROR=$((ERROR+1)); }

# BAK 化
bak_dir() {
    local t="$1"
    [ -e "$t" ] || return 0
    local b="${t}.bak_$(date +%Y%m%d_%H%M%S)"
    mv "$t" "$b"
    log_info "BAK: $(basename "$t") -> $(basename "$b")"
}

echo "╔══════════════════════════════════════════╗"
echo "║  Skills-TongBu 沙箱适配版               ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ━━ 1. 环境准备 ━━
log_info "创建目录: ${WORMHOLE_DIR}"
mkdir -p "$WORMHOLE_DIR"
log_info "创建目录: ${TRAE_RULES_DIR}"
mkdir -p "$TRAE_RULES_DIR"
log_info "创建目录: ${AGENTS_DIR}"
mkdir -p "$AGENTS_DIR"

# ━━ 2. 技能同步 ━━
if [ ! -d "$SKILLS_DIR" ]; then
    log_err "技能目录不存在: ${SKILLS_DIR}"
else
    # 收集技能名
    skill_names=()
    for d in "${SKILLS_DIR}"/*/; do
        n=$(basename "$d")
        [ "$n" != "market" ] && [ "$n" != "lark-skills" ] && skill_names+=("$n")
    done
    if [ -d "${SKILLS_DIR}/market" ]; then
        for d in "${SKILLS_DIR}/market"/*/; do
            skill_names+=("$(basename "$d")")
        done
    fi
    if [ -d "${SKILLS_DIR}/lark-skills" ]; then
        for d in "${SKILLS_DIR}/lark-skills"/*/; do
            skill_names+=("$(basename "$d")")
        done
    fi

    log_info "发现 ${#skill_names[@]} 个技能"

    for skill_name in "${skill_names[@]}"; do
        # 确定源路径
        source_dir=""
        source_subdir=""
        if [ -d "${SKILLS_DIR}/${skill_name}" ]; then
            source_dir="${SKILLS_DIR}/${skill_name}"
        elif [ -d "${SKILLS_DIR}/market/${skill_name}" ]; then
            source_dir="${SKILLS_DIR}/market/${skill_name}"
            source_subdir="market"
        elif [ -d "${SKILLS_DIR}/lark-skills/${skill_name}" ]; then
            source_dir="${SKILLS_DIR}/lark-skills/${skill_name}"
            source_subdir="lark-skills"
        else
            log_skip "${skill_name}: 源目录不存在"
            continue
        fi

        [ -f "${source_dir}/SKILL.md" ] || { log_skip "${skill_name}: 缺少 SKILL.md"; continue; }

        # 虫洞 Symlink: ~/.trae-cn/skills/Name → ~/.agents/skills/[subdir/]Name
        wormhole_path="${WORMHOLE_DIR}/${skill_name}"
        if [ -n "$source_subdir" ]; then
            target="${SKILLS_DIR}/${source_subdir}/${skill_name}"
        else
            target="${SKILLS_DIR}/${skill_name}"
        fi

        if [ -L "$wormhole_path" ]; then
            cur=$(readlink "$wormhole_path")
            if [ "$cur" = "$target" ]; then
                log_skip "${skill_name}: 虫洞已正确"
            else
                rm "$wormhole_path"
                ln -s "$target" "$wormhole_path"
                log_ok "${skill_name}: 虫洞已修正"
            fi
        elif [ -d "$wormhole_path" ]; then
            bak_dir "$wormhole_path"
            ln -s "$target" "$wormhole_path"
            log_ok "${skill_name}: 实体已BAK，虫洞已创建"
        else
            ln -s "$target" "$wormhole_path"
            log_ok "${skill_name}: 虫洞已创建"
        fi
    done
fi

# ━━ 3. 更新 .skill-lock.json（Python 替代 Node）━━━
log_info "更新注册表..."
python3 -c '
import json, os, hashlib
from datetime import datetime, timezone, timedelta

lock_path = os.path.expanduser("~/.agents/.skill-lock.json")
skills_dir = os.path.expanduser("~/.agents/skills")
now = (datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%dT%H:%M:%S+08:00"))

lock = {"version": 3, "skills": {}, "dismissed": {}}
try:
    with open(lock_path) as f:
        lock = json.load(f)
except:
    pass

added, updated = 0, 0

def process(name, skill_path, subdir):
    global added, updated
    skill_md = os.path.join(skill_path, "SKILL.md")
    if not os.path.exists(skill_md):
        return
    h = hashlib.sha256()
    try:
        for root, dirs, files in os.walk(skill_path):
            for fn in sorted(files):
                fp = os.path.join(root, fn)
                try:
                    with open(fp, "rb") as f:
                        h.update(f.read())
                except:
                    pass
    except:
        pass
    hh = h.hexdigest()

    sp = f"skills/{subdir}/{name}/SKILL.md" if subdir else f"skills/{name}/SKILL.md"

    if name not in lock["skills"]:
        lock["skills"][name] = {
            "source": "I42857-AI/.agents",
            "sourceType": "github",
            "sourceUrl": "https://github.com/I42857-AI/.agents.git",
            "skillPath": sp,
            "skillFolderHash": hh,
            "installedAt": now,
            "updatedAt": now
        }
        added += 1
    elif lock["skills"][name].get("skillFolderHash") != hh:
        lock["skills"][name]["skillFolderHash"] = hh
        lock["skills"][name]["skillPath"] = sp
        lock["skills"][name]["updatedAt"] = now
        updated += 1

for entry in sorted(os.listdir(skills_dir)):
    p = os.path.join(skills_dir, entry)
    if not os.path.isdir(p):
        continue
    if entry == "market":
        for sub in sorted(os.listdir(p)):
            sp2 = os.path.join(p, sub)
            if os.path.isdir(sp2):
                process(sub, sp2, "market")
    elif entry == "lark-skills":
        for sub in sorted(os.listdir(p)):
            sp2 = os.path.join(p, sub)
            if os.path.isdir(sp2):
                process(sub, sp2, "lark-skills")
    else:
        process(entry, p, "")

os.makedirs(os.path.dirname(lock_path), exist_ok=True)
with open(lock_path, "w") as f:
    json.dump(lock, f, indent=2, ensure_ascii=False)
print(f"注册表更新完成: 新增 {added} / 更新 {updated} / 总计 {len(lock[\"skills\"])}")
' 2>&1

# ━━ 4. 恢复 project_rules.md ━━
log_info "恢复项目规则..."
cp "${AGENTS_DIR}/project_rules.md" "${TRAE_RULES_DIR}/project_rules.md"
log_ok "project_rules.md → ${TRAE_RULES_DIR}/project_rules.md"

# ━━ 5. 验证 ━━
echo ""
echo "━━━ 验证 ━━━"
valid=0; broken=0
for link in "${WORMHOLE_DIR}"/*/; do
    n=$(basename "$link")
    if [ -f "${WORMHOLE_DIR}/${n}/SKILL.md" ]; then
        valid=$((valid+1))
    else
        broken=$((broken+1))
        log_err "无效虫洞: ${n}"
    fi
done
echo "  有效虫洞: ${valid} / 无效: ${broken}"

wc=$(ls -1d "${WORMHOLE_DIR}"/*/ 2>/dev/null | wc -l)
echo "  虫洞层技能数: ${wc}"

echo ""
echo "━━━ 汇总 ━━━"
echo "  成功: ${SUCCESS}"
echo "  跳过: ${SKIP}"
echo "  错误: ${ERROR}"
echo ""
[ $ERROR -eq 0 ] && echo "ALL DONE!" || echo "DONE with errors"
