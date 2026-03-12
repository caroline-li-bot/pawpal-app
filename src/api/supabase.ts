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
 * API 响应类型
 */
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

/**
 * 自定义 API 错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 处理 Supabase 错误
 */
function handleError(error: any): never {
  console.error('API Error:', error)
  
  if (error.code === 'PGRST116') {
    throw new ApiError('未找到数据', 'NOT_FOUND', 404)
  }
  if (error.code === '23505') {
    throw new ApiError('数据已存在', 'DUPLICATE', 409)
  }
  if (error.code === '42501') {
    throw new ApiError('权限不足', 'FORBIDDEN', 403)
  }
  if (error.code?.startsWith('PGRST')) {
    throw new ApiError('请求参数错误', 'BAD_REQUEST', 400)
  }
  if (error.message?.includes('JWT')) {
    throw new ApiError('登录已过期，请重新登录', 'UNAUTHORIZED', 401)
  }
  if (error.message?.includes('network')) {
    throw new ApiError('网络连接失败，请检查网络', 'NETWORK_ERROR', 0)
  }
  
  throw new ApiError(error.message || '操作失败，请重试', 'UNKNOWN', 500)
}

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 微信登录
   * @param code 微信授权码
   */
  async wechatLogin(code: string) {
    try {
      const { data, error } = await supabase.functions.invoke('wechat-login', {
        body: { code },
      })
      if (error) throw error
      return data
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      return data
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 更新用户信息
   */
  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')
      
      const { data, error } = await supabase
        .from('users')
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 登出
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err: any) {
      return handleError(err)
    }
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const { data, error } = await supabase
        .from('pet_profiles')
        .insert({ ...profile, user_id: user.id })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 更新宠物资料
   */
  async updateProfile(id: string, profile: Partial<PetProfile>): Promise<PetProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const { data, error } = await supabase
        .from('pet_profiles')
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 获取宠物资料
   */
  async getProfile(userId?: string): Promise<PetProfile | null> {
    try {
      let targetUserId = userId
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null
        targetUserId = user.id
      }

      const { data, error } = await supabase
        .from('pet_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 获取推荐宠物列表
   */
  async getRecommendations(limit: number = 10): Promise<PetProfile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const { data, error } = await supabase
        .rpc('get_recommendations', {
          p_user_id: user.id,
          p_limit: limit,
        })
      
      if (error) throw error
      return data || []
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 上传宠物照片（H5 版本）
   */
  async uploadPhotoH5(file: File): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase
        .storage
        .from('pet-photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        })
      
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase
        .storage
        .from('pet-photos')
        .getPublicUrl(filePath)
      
      return publicUrl
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 上传宠物照片（小程序版本）
   */
  async uploadPhotoMP(filePath: string, fileName: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      // 读取文件为 base64
      const fs = uni.getFileSystemManager()
      const fileData = await new Promise<string>((resolve, reject) => {
        fs.readFile({
          filePath,
          encoding: 'base64',
          success: (res) => resolve(res.data as string),
          fail: reject,
        })
      })

      const path = `${user.id}/${Date.now()}_${fileName}`

      const { error: uploadError } = await supabase
        .storage
        .from('pet-photos')
        .upload(path, Buffer.from(fileData, 'base64'), {
          contentType: 'image/jpeg',
        })
      
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase
        .storage
        .from('pet-photos')
        .getPublicUrl(path)
      
      return publicUrl
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 删除宠物照片
   */
  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      // 从 URL 中提取文件路径
      const url = new URL(photoUrl)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.indexOf('pet-photos')
      if (bucketIndex === -1) throw new Error('无效的照片 URL')
      
      const filePath = pathParts.slice(bucketIndex + 1).join('/')

      const { error } = await supabase
        .storage
        .from('pet-photos')
        .remove([filePath])
      
      if (error) throw error
    } catch (err: any) {
      return handleError(err)
    }
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const { data, error } = await supabase
        .rpc('handle_swipe', {
          p_from_user_id: user.id,
          p_to_user_id: targetUserId,
          p_action: action,
        })
      
      if (error) throw error
      return { isMatch: data }
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 获取匹配列表
   */
  async getMatches(): Promise<Match[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          pet1:pet1_id(*),
          pet2:pet2_id(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 取消匹配
   */
  async unmatch(matchId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const { error } = await supabase
        .from('matches')
        .update({ is_active: false })
        .eq('id', matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      
      if (error) throw error
    } catch (err: any) {
      return handleError(err)
    }
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const { data, error } = await supabase
        .rpc('get_chat_sessions', {
          p_user_id: user.id,
        })
      
      if (error) throw error
      return data || []
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 获取聊天记录
   */
  async getMessages(matchId: string, limit: number = 50, before?: string) {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (before) {
        query = query.lt('created_at', before)
      }

      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 发送消息
   */
  async sendMessage(matchId: string, content: string, type: 'text' | 'image' = 'text') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

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
    } catch (err: any) {
      return handleError(err)
    }
  },

  /**
   * 标记消息已读
   */
  async markAsRead(matchId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ApiError('请先登录', 'UNAUTHORIZED', 401)

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)
        .eq('is_read', false)
      
      if (error) throw error
    } catch (err: any) {
      return handleError(err)
    }
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

  /**
   * 取消订阅
   */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    channel.unsubscribe()
  },
}

/**
 * 检查 Supabase 连接状态
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    return !error
  } catch {
    return false
  }
}

export default {
  auth: authApi,
  pet: petApi,
  match: matchApi,
  chat: chatApi,
  checkConnection,
}
