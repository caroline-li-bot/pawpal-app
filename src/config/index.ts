/**
 * Supabase 配置
 * 请替换为您的 Supabase 项目配置
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
}

/**
 * 微信小程序配置
 */
export const wechatConfig = {
  appId: import.meta.env.VITE_WECHAT_APPID || '',
}
