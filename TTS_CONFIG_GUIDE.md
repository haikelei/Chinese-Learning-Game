# 🎵 火山引擎TTS配置指南

## 📋 当前状态

✅ **测试音频已生成** - 应用现在使用简短的测试音频（正弦波声音）  
⚠️ **需要配置真实语音** - 要获得中文语音，需要正确配置火山引擎TTS服务

## 🔧 火山引擎TTS配置步骤

### 1. 验证凭据信息
确认以下信息是否正确：
- **AppID**: `YOUR_VOLCENGINE_APP_ID`
- **Token**: `YOUR_VOLCENGINE_TOKEN`

### 2. 控制台配置检查
登录 [火山引擎控制台](https://console.volcengine.com/speech/tts):

1. **确认服务开通**：
   - 豆包语音 -> 语音合成
   - 确保服务状态为"已开通"

2. **获取正确的配置参数**：
   - AppID (应用标识)
   - Access Token (访问令牌)  
   - Cluster (业务集群) - 可能是 `volcano_tts`, `volcano_icl` 等

3. **音色权限检查**：
   - 免费音色：`BV001_streaming`, `BV002_streaming`
   - 付费音色需要单独购买授权

### 3. 常见问题排查

**错误**: `load grant: requested grant not found in SaaS storage`  
**原因**: 
- AppID或Token不正确
- 服务未开通或配置错误
- 需要联系技术支持确认账户状态

**解决方案**:
1. 重新检查控制台中的AppID和Token
2. 确认在正确的区域(中国/海外)使用服务
3. 联系火山引擎技术支持: service@volcengine.com

### 4. 使用真实TTS生成音频

配置正确后，运行以下命令：

```bash
# 激活虚拟环境
source audio_gen_env/bin/activate

# 运行真实TTS脚本
python generate_audio.py
```

### 5. 测试脚本说明

- **`test_config.py`** - 测试不同的cluster和voice_type配置
- **`generate_audio.py`** - 生成真实中文语音(需要正确配置)  
- **`generate_test_audio.py`** - 生成测试音频(当前在使用)

## 🎯 下一步行动

1. **联系火山引擎支持** 确认账户配置
2. **获取正确的cluster参数** 
3. **测试音色权限** 确保有权限使用所选音色
4. **重新运行脚本** 生成真实中文语音

## 📞 技术支持

- **火山引擎支持**: service@volcengine.com
- **电话**: 400-850-0030
- **文档**: [TTS API文档](https://www.volcengine.com/docs/6561/79820)

---

**当前应用状态**: ✅ 可正常运行，使用测试音频  
**目标状态**: 🎯 使用真实中文TTS语音