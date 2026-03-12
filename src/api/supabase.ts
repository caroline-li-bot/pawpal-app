/**
 * Supabase 客户端初始化
 * 用于连接 Supabase 后端服务
 */
import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '@/config'
import type { User, PetProfile, Swipe, Match, Message } from '@/types'

// 创建 Supabase 客户端
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 微信登录
   * @param code 微信授权码
   */
  async wechatLogin(code: string) {
    const { data, error } = await supabase.functions.invoke('wechat-login', {
      body: { code },
    })
    if (error) throw error
    return data
  },

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * 登出
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}

/**
 * 宠物资料 API
 */
export const petApi = {
  /**
   * 创建宠物资料
   */
  async createProfile(profile: Omit<PetProfile, 'id' | 'created_at' | 'updated_at'>): Promise<PetProfile> {
    const { data, error } = await supabase
      .from('pet_profiles')
      .insert(profile)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * 更新宠物资料
   */
  async updateProfile(id: string, profile: Partial<PetProfile>): Promise<PetProfile> {
    const { data, error } = await supabase
      .from('pet_profiles')
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * 获取宠物资料
   */
  async getProfile(userId: string): Promise<PetProfile | null> {
    const { data, error } = await supabase
      .from('pet_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  /**
   * 获取推荐宠物列表
   */
  async getRecommendations(limit: number = 10): Promise<PetProfile[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { data, error } = await supabase
      .rpc('get_recommendations', {
        p_user_id: user.id,
        p_limit: limit,
      })
    
    if (error) throw error
    return data || []
  },

  /**
   * 上传宠物照片
   */
  async uploadPhoto(filePath: string, fileName: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    // 读取文件为 ArrayBuffer
    const fileData = await uni.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
    })

    const { data, error } = await supabase
      .storage
      .from('pet-photos')
      .upload(`${user.id}/${Date.now()}_${fileName}`, 
        Buffer.from(fileData.data as string, 'base64'),
        { contentType: 'image/jpeg' }
      )
    
    if (error) throw error

    // 获取公开 URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('pet-photos')
      .getPublicUrl(data.path)
    
    return publicUrl
  },
}

/**
 * 匹配相关 API
 */
export const matchApi = {
  /**
   * 滑动操作
   */
  async swipe(targetUserId: string, action: 'like' | 'pass' | 'super_like'): Promise<{ isMatch: boolean }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { data, error } = await supabase
      .rpc('handle_swipe', {
        p_from_user_id: user.id,
        p_to_user_id: targetUserId,
        p_action: action,
      })
    
    if (error) throw error
    return { isMatch: data }
  },

  /**
   * 获取匹配列表
   */
  async getMatches(): Promise<Match[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
}

/**
 * 聊天相关 API
 */
export const chatApi = {
  /**
   * 获取聊天列表
   */
  async getChatList() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { data, error } = await supabase
      .rpc('get_chat_sessions', {
        p_user_id: user.id,
      })
    
    if (error) throw error
    return data || []
  },

  /**
   * 获取聊天记录
   */
  async getMessages(matchId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  /**
   * 发送消息
   */
  async sendMessage(matchId: string, content: string, type: 'text' | 'image' = 'text') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content,
        type,
        is_read: false,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * 标记消息已读
   */
  async markAsRead(matchId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('match_id', matchId)
      .neq('sender_id', user.id)
      .eq('is_read', false)
    
    if (error) throw error
  },

  /**
   * 订阅实时消息
   */
  subscribeToMessages(matchId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()
  },
}
