/**
 * Pinia Store - 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, PetProfile } from '@/types'
import { authApi, petApi } from '@/api/supabase'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const petProfile = ref<PetProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!user.value)
  const hasPetProfile = computed(() => !!petProfile.value)

  // Actions
  /**
   * 微信登录
   */
  async function wechatLogin() {
    isLoading.value = true
    error.value = null
    
    try {
      // #ifdef MP-WEIXIN
      const loginRes = await uni.login({ provider: 'weixin' })
      if (loginRes.code) {
        const data = await authApi.wechatLogin(loginRes.code)
        await fetchUserProfile()
        return data
      }
      // #endif
      
      // #ifndef MP-WEIXIN
      // H5 开发环境模拟登录
      console.log('H5 环境：跳过微信登录')
      // #endif
    } catch (err: any) {
      error.value = err.message || '登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取用户资料
   */
  async function fetchUserProfile() {
    try {
      const [userData, petData] = await Promise.all([
        authApi.getCurrentUser(),
        petApi.getProfile(user.value?.id || ''),
      ])
      user.value = userData
      petProfile.value = petData
    } catch (err: any) {
      console.error('获取用户资料失败:', err)
    }
  }

  /**
   * 创建宠物资料
   */
  async function createPetProfile(profile: Omit<PetProfile, 'id' | 'created_at' | 'updated_at'>) {
    isLoading.value = true
    try {
      const data = await petApi.createProfile(profile)
      petProfile.value = data
      return data
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新宠物资料
   */
  async function updatePetProfile(id: string, profile: Partial<PetProfile>) {
    isLoading.value = true
    try {
      const data = await petApi.updateProfile(id, profile)
      petProfile.value = data
      return data
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  async function logout() {
    await authApi.signOut()
    user.value = null
    petProfile.value = null
  }

  return {
    user,
    petProfile,
    isLoading,
    error,
    isLoggedIn,
    hasPetProfile,
    wechatLogin,
    fetchUserProfile,
    createPetProfile,
    updatePetProfile,
    logout,
  }
})
