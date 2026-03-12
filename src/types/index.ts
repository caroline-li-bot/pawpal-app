/**
 * 类型定义文件
 * 定义应用中使用的所有数据类型
 */

/** 宠物类型 */
export type PetType = 'dog' | 'cat' | 'other'

/** 宠物性别 */
export type PetGender = 'male' | 'female' | 'unknown'

/** 宠物体型 */
export type PetSize = 'small' | 'medium' | 'large'

/** 用户角色 */
export interface User {
  id: string
  openid: string
  unionid?: string
  nickname?: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

/** 宠物资料 */
export interface PetProfile {
  id: string
  user_id: string
  name: string
  type: PetType
  breed: string
  gender: PetGender
  age: number
  size: PetSize
  photos: string[]
  bio: string
  location: string
  latitude?: number
  longitude?: number
  personality_tags: string[]
  interests: string[]
  is_visible: boolean
  created_at: string
  updated_at: string
}

/** 滑动操作类型 */
export type SwipeAction = 'like' | 'pass' | 'super_like'

/** 滑动记录 */
export interface Swipe {
  id: string
  from_user_id: string
  to_user_id: string
  action: SwipeAction
  created_at: string
}

/** 匹配记录 */
export interface Match {
  id: string
  user1_id: string
  user2_id: string
  pet1_id: string
  pet2_id: string
  created_at: string
  is_active: boolean
}

/** 聊天消息 */
export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'voice'
  is_read: boolean
  created_at: string
}

/** 聊天会话 */
export interface ChatSession {
  id: string
  match_id: string
  pet: PetProfile
  last_message?: Message
  unread_count: number
  updated_at: string
}

/** 推荐卡片 */
export interface Recommendation {
  pet: PetProfile
  user: User
  distance?: number
  compatibility_score?: number
}
