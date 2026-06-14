# 摄影美女写真 - 详细提示词

## 英文提示词（Pollinations.ai 格式）

```
Professional photography portrait of a beautiful Chinese woman in her 20s, natural makeup with soft pink lips, elegant black evening gown with lace details, studio lighting with softbox and rim light, shallow depth of field (f/1.8), sophisticated pose with hand on cheek, confident and mysterious expression, detailed skin texture with pores and natural glow, high-end fashion photography style, vogue magazine cover quality, photorealistic, 8k resolution, shot on Canon EOS R5 with 85mm lens, color grading with warm tones, professional retouching, sharp focus on eyes
```

## 提示词拆解

### 1. 主体描述
- `beautiful Chinese woman in her 20s` - 年轻中国女性
- `natural makeup with soft pink lips` - 自然妆容，淡粉色嘴唇

### 2. 服装与造型
- `elegant black evening gown with lace details` - 优雅黑色晚礼服，蕾丝细节

### 3. 摄影技术
- `studio lighting with softbox and rim light` - 摄影棚灯光，柔光箱+轮廓光
- `shallow depth of field (f/1.8)` - 浅景深
- `shot on Canon EOS R5 with 85mm lens` - 相机参数

### 4. 姿态与表情
- `sophisticated pose with hand on cheek` - 优雅姿态，手扶脸颊
- `confident and mysterious expression` - 自信神秘的表情

### 5. 画质要求
- `detailed skin texture with pores and natural glow` - 细节皮肤纹理
- `photorealistic, 8k resolution` - 照片级真实，8K分辨率
- `professional retouching` - 专业修图

### 6. 风格参考
- `high-end fashion photography style` - 高端时尚摄影风格
- `vogue magazine cover quality` - Vogue杂志封面品质

## API 调用格式

```bash
# Pollinations.ai 格式（URL编码）
curl "https://image.pollinations.ai/prompt/Professional%20photography%20portrait%20of%20a%20beautiful%20Chinese%20woman%20in%20her%2020s%2C%20natural%20makeup%20with%20soft%20pink%20lips%2C%20elegant%20black%20evening%20gown%20with%20lace%20details%2C%20studio%20lighting%20with%20softbox%20and%20rim%20light%2C%20shallow%20depth%20of%20field%20%28f%2F1.8%29%2C%20sophisticated%20pose%20with%20hand%20on%20cheek%2C%20confident%20and%20mysterious%20expression%2C%20detailed%20skin%20texture%20with%20pores%20and%20natural%20glow%2C%20high-end%20fashion%20photography%20style%2C%20vogue%20magazine%20cover%20quality%2C%20photorealistic%2C%208k%20resolution%2C%20shot%20on%20Canon%20EOS%20R5%20with%2085mm%20lens%2C%20color%20grading%20with%20warm%20tones%2C%20professional%20retouching%2C%20sharp%20focus%20on%20eyes?width=1024&height=1280&nologo=true&model=flux&enhance=true" -o portrait_final.png
```

## 预期效果

- **风格**：高端时尚杂志封面
- **质感**：照片级真实，8K分辨率
- **光线**：摄影棚专业布光
- **细节**：皮肤纹理、眼神锐利
- **色彩**：暖色调，专业调色

---

## 当前状态

⚠️ **Pollinations.ai 频率限制中**
- 错误：`Queue full for IP`
- 限制：每IP同时只能1个请求排队
- 解决方案：等待更长时间（可能数小时）

## 替代方案

1. **等待后重试**（推荐）
2. **使用 Pollinations 网页版**：https://pollinations.ai/
3. **申请其他免费 API**：
   - Stability AI（需要注册）
   - HuggingFace（需要token）
   - Replicate（免费沙箱额度）

---

创建时间：2026-06-14 22:25
