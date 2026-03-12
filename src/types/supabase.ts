/**
 * Supabase 数据库类型定义
 * 由 `supabase gen types typescript` 生成
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          openid: string
          unionid: string | null
          nickname: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          openid: string
          unionid?: string | null
          nickname?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          openid?: string
          unionid?: string | null
          nickname?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pet_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'dog' | 'cat' | 'other'
          breed: string
          gender: 'male' | 'female' | 'unknown'
          age: number
          size: 'small' | 'medium' | 'large'
          photos: string[]
          bio: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          personality_tags: string[]
          interests: string[]
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'dog' | 'cat' | 'other'
          breed: string
          gender: 'male' | 'female' | 'unknown'
          age: number
          size: 'small' | 'medium' | 'large'
          photos?: string[]
          bio?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          personality_tags?: string[]
          interests?: string[]
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'dog' | 'cat' | 'other'
          breed?: string
          gender?: 'male' | 'female' | 'unknown'
          age?: number
          size?: 'small' | 'medium' | 'large'
          photos?: string[]
          bio?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          personality_tags?: string[]
          interests?: string[]
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      swipes: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          action: 'like' | 'pass' | 'super_like'
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          action: 'like' | 'pass' | 'super_like'
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          action?: 'like' | 'pass' | 'super_like'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_from_user_id_fkey"
            columns: ["from_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_to_user_id_fkey"
            columns: ["to_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          pet1_id: string
          pet2_id: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          pet1_id: string
          pet2_id: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          pet1_id?: string
          pet2_id?: string
          created_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "matches_pet1_id_fkey"
            columns: ["pet1_id"]
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_pet2_id_fkey"
            columns: ["pet2_id"]
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          type: 'text' | 'image' | 'voice'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          type?: 'text' | 'image' | 'voice'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          content?: string
          type?: 'text' | 'image' | 'voice'
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_recommendations: {
        Args: {
          p_user_id: string
          p_limit?: number
        }
        Returns: Database['public']['Tables']['pet_profiles']['Row'][]
      }
      handle_swipe: {
        Args: {
          p_from_user_id: string
          p_to_user_id: string
          p_action: string
        }
        Returns: boolean
      }
      get_chat_sessions: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          match_id: string
          pet: Json
          last_message: Json
          unread_count: number
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
