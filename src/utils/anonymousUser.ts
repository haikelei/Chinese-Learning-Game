// 生成基于设备特征的匿名用户名
export function generateAnonymousUsername(): string {
  const STORAGE_KEY = 'anonymous_username';
  
  // 如果已经有存储的用户名，直接返回
  const storedUsername = localStorage.getItem(STORAGE_KEY);
  if (storedUsername) {
    return storedUsername;
  }
  
  // 收集设备特征
  const features = [
    navigator.userAgent,
    window.screen.width.toString(),
    window.screen.height.toString(),
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform,
    navigator.hardwareConcurrency?.toString() || '1'
  ];
  
  // 生成简单哈希
  let hash = 0;
  const combined = features.join('|');
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 转换为正数并取后4位
  const positive = Math.abs(hash);
  const shortId = positive.toString(36).slice(-4).toUpperCase();
  
  const username = `Guest_${shortId}`;
  
  // 存储到本地
  localStorage.setItem(STORAGE_KEY, username);
  
  return username;
}

// 获取或重置匿名用户名
export function getAnonymousUsername(): string {
  return generateAnonymousUsername();
}

// 重置用户名（清除本地存储）
export function resetAnonymousUsername(): void {
  localStorage.removeItem('anonymous_username');
}

// 生成并持久化设备ID
export function generatePersistentDeviceId(): string {
  const STORAGE_KEY = 'persistent_device_id';
  
  // 如果已经有存储的设备ID，直接返回
  const storedDeviceId = localStorage.getItem(STORAGE_KEY);
  if (storedDeviceId) {
    return storedDeviceId;
  }
  
  // 生成新的设备ID
  const deviceId = generateDeviceIdFromFingerprint();
  
  // 存储到本地
  localStorage.setItem(STORAGE_KEY, deviceId);
  
  return deviceId;
}

// 从设备指纹生成设备ID（不包含时间戳）
function generateDeviceIdFromFingerprint(): string {
  const fingerprint = getDeviceFingerprint();
  const combined = Object.values(fingerprint).join('|');
  
  // 简单的哈希算法
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return `device_${Math.abs(hash).toString(36)}`;
}

// 获取设备指纹信息（用于元数据，不包含时间戳）
export function getDeviceFingerprint() {
  return {
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 1
  };
}

// 重置设备ID（清除本地存储）
export function resetDeviceId(): void {
  localStorage.removeItem('persistent_device_id');
}