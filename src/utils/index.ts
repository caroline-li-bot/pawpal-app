/**
 * 通用工具函数
 */

/**
 * 格式化年龄显示
 * @param age 年龄（年）
 * @returns 格式化后的年龄字符串
 */
export function formatAge(age: number): string {
  if (age < 1) {
    const months = Math.round(age * 12)
    return `${months}个月`
  }
  const years = Math.floor(age)
  const months = Math.round((age % 1) * 12)
  if (months === 0) {
    return `${years}岁`
  }
  return `${years}岁${months}个月`
}

/**
 * 格式化距离显示
 * @param distance 距离（公里）
 * @returns 格式化后的距离字符串
 */
export function formatDistance(distance?: number): string {
  if (distance === undefined || distance === null) {
    return '附近'
  }
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  if (distance < 10) {
    return `${distance.toFixed(1)}km`
  }
  return `${Math.round(distance)}km`
}

/**
 * 格式化时间显示
 * @param date 日期字符串或 Date 对象
 * @returns 格式化后的时间字符串
 */
export function formatTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }
  
  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }
  
  // 超过7天显示日期
  const year = target.getFullYear()
  const month = target.getMonth() + 1
  const day = target.getDate()
  
  if (year === now.getFullYear()) {
    return `${month}月${day}日`
  }
  
  return `${year}年${month}月${day}日`
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  
  return function (...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(null, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param interval 间隔时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(null, args)
    }
  }
}

/**
 * 生成唯一 ID
 * @returns 唯一 ID 字符串
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  
  return cloned
}

/**
 * 检查网络状态
 * @returns 是否在线
 */
export function isOnline(): boolean {
  // #ifdef H5
  return navigator.onLine
  // #endif
  
  // #ifdef MP-WEIXIN
  const networkType = uni.getNetworkType()
  return networkType !== 'none'
  // #endif
  
  return true
}

/**
 * 显示加载提示
 * @param title 提示文字
 */
export function showLoading(title: string = '加载中...') {
  uni.showLoading({
    title,
    mask: true,
  })
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  uni.hideLoading()
}

/**
 * 显示成功提示
 * @param title 提示文字
 * @param duration 显示时长
 */
export function showSuccess(title: string, duration: number = 1500) {
  uni.showToast({
    title,
    icon: 'success',
    duration,
  })
}

/**
 * 显示错误提示
 * @param title 提示文字
 * @param duration 显示时长
 */
export function showError(title: string, duration: number = 2000) {
  uni.showToast({
    title,
    icon: 'error',
    duration,
  })
}

/**
 * 显示信息提示
 * @param title 提示文字
 * @param duration 显示时长
 */
export function showInfo(title: string, duration: number = 2000) {
  uni.showToast({
    title,
    icon: 'none',
    duration,
  })
}

/**
 * 确认对话框
 * @param options 配置选项
 * @returns Promise<boolean>
 */
export function showConfirm(options: {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
}): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title: options.title || '提示',
      content: options.content,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      },
    })
  })
}

/**
 * 页面跳转
 * @param url 目标页面 URL
 * @param options 跳转选项
 */
export function navigateTo(
  url: string,
  options: { replace?: boolean; switchTab?: boolean } = {}
) {
  if (options.switchTab) {
    uni.switchTab({ url })
  } else if (options.replace) {
    uni.redirectTo({ url })
  } else {
    uni.navigateTo({ url })
  }
}

/**
 * 返回上一页
 * @param delta 返回层数
 */
export function navigateBack(delta: number = 1) {
  uni.navigateBack({ delta })
}

/**
 * 保存数据到本地存储
 * @param key 键名
 * @param value 值
 */
export function setStorage<T>(key: string, value: T) {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    console.error('Storage set error:', e)
  }
}

/**
 * 从本地存储获取数据
 * @param key 键名
 * @returns 值
 */
export function getStorage<T>(key: string): T | null {
  try {
    return uni.getStorageSync(key) as T
  } catch (e) {
    console.error('Storage get error:', e)
    return null
  }
}

/**
 * 从本地存储删除数据
 * @param key 键名
 */
export function removeStorage(key: string) {
  try {
    uni.removeStorageSync(key)
  } catch (e) {
    console.error('Storage remove error:', e)
  }
}

/**
 * 清除所有本地存储
 */
export function clearStorage() {
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('Storage clear error:', e)
  }
}
