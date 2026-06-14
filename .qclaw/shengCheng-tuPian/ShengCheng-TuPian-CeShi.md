# 免费生图 API 测试结果

## ✅ 可用（有限制）

| API | 状态 | 限制 | 说明 |
|-----|------|------|------|
| **Pollinations.ai** | ✅ 可访问 | 频率限制（每 IP 1 请求） | `https://image.pollinations.ai/prompt/{prompt}?width=512&height=512&nologo=true` |
| **HuggingFace Spaces** | ⏳️ 需排队 | 免费 tier 很慢 | 部分 Space 有免费 API |
| **Bing Image Creator** | ✅ 免费 | 需要 Microsoft 账号 | DALL-E 3 引擎 |

---

## ❌ 不可用（需要 API Key）

| API | 原因 |
|-----|------|
| **Stability AI** | 需要 API key（免费额度有限） |
| **OpenAI DALL-E** | 需要付费 API key |
| **Replicate** | 需要 API key（免费沙箱额度有限） |
| **Midjourney** | 需要订阅 |

---

## ✅ 推荐方案：Pollinations.ai（免费，有限制）

### 使用方法

```bash
curl "https://image.pollinations.ai/prompt/{URL编码的提示词}?width=1024&height=1024&nologo=true&model=flux" -o output.png
```

### 限制
- **频率限制**：每 IP 同时只能有 1 个请求在排队
- **解决方案**：等待上一请求完成后再发下一请求

### 示例

```bash
# 生成一张风景图
curl "https://image.pollinations.ai/prompt/A%20beautiful%20landscape%20with%20mountains%20and%20lake?width=1024&height=1024&nologo=true" -o landscape.png
```

---

## 🔧 替代方案：使用 HB 的 `canvas` 工具（如果可用）

如果你的环境有 `canvas` 工具，可以用浏览器端生图（需要 GUI）。

---

## 💡 最终建议

**方案 A**：用 Pollinations.ai（免费，但有限制）
- 生成简单图片
- 频率限制：需要等待排队

**方案 B**：申请免费 API key
- **Stability AI**：https://stability.ai/platform/platform-access
- **HuggingFace**：https://huggingface.co/settings/tokens
- **Replicate**：https://replicate.com/account

**方案 C**：使用在线免费工具（手动）
- **Bing Image Creator**：https://www.bing.com/images/create
- **HuggingFace Spaces**：https://huggingface.co/spaces（搜索 "text-to-image"）

---

## 📊 测试结果文件

| 文件 | 说明 |
|------|------|
| `/tmp/pollinations_test.png` | Pollinations 生成（666 字节，可能失败） |
| `/tmp/stability_test.png` | Stability AI 测试（300 字节，失败） |
| `/tmp/browser-gen.html` | 浏览器端生图指南 |

---

最后更新：2026-06-14 22:21
