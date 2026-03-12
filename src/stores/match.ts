/**
 * Pinia Store - 匹配状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PetProfile, Match } from '@/types'
import { petApi, matchApi } from '@/api/supabase'

export const useMatchStore = defineStore('match', () => {
  // State
  const recommendations = ref<PetProfile[]>([])
  const currentIndex = ref(0)
  const matches = ref<Match[]>([])
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const showMatchAnimation = ref(false)
  const matchedPet = ref<PetProfile | null>(null)
  const hasMorePets = ref(true)

  // Getters
  const currentPet = computed(() => {
    return recommendations.value[currentIndex.value] || null
  })

  const visiblePets = computed(() => {
    return recommendations.value.slice(currentIndex.value, currentIndex.value + 3)
  })

  // Actions
  /**
   * 加载推荐列表
   */
  async function loadRecommendations(limit: number = 10) {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      const data = await petApi.getRecommendations(limit)
      recommendations.value = data
      currentIndex.value = 0
      hasMorePets.value = data.length > 0
    } catch (err: any) {
      error.value = err.message || '加载推荐失败'
      console.error('Load recommendations error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载更多推荐
   */
  async function loadMoreRecommendations(limit: number = 10) {
    if (isLoadingMore.value || !hasMorePets.value) return
    
    isLoadingMore.value = true
    
    try {
      const data = await petApi.getRecommendations(limit)
      if (data.length > 0) {
        recommendations.value.push(...data)
      } else {
        hasMorePets.value = false
      }
    } catch (err: any) {
      console.error('Load more recommendations error:', err)
    } finally {
      isLoadingMore.value = false
    }
  }

  /**
   * 滑动操作
   */
  async function swipe(action: 'like' | 'pass' | 'super_like') {
    if (!currentPet.value) return
    
    const targetUserId = currentPet.value.user_id
    
    try {
      const result = await matchApi.swipe(targetUserId, action)
      
      if (result.isMatch) {
        matchedPet.value = currentPet.value
        showMatchAnimation.value = true
      }
      
      // 移动到下一个
      currentIndex.value++
      
      // 检查是否需要加载更多
      if (currentIndex.value >= recommendations.value.length - 3) {
        loadMoreRecommendations()
      }
      
      // 检查是否没有更多
      if (currentIndex.value >= recommendations.value.length) {
        hasMorePets.value = false
      }
      
      return result
    } catch (err: any) {
      error.value = err.message || '操作失败'
      throw err
    }
  }

  /**
   * 喜欢
   */
  async function like() {
    return swipe('like')
  }

  /**
   * 跳过
   */
  async function pass() {
    return swipe('pass')
  }

  /**
   * 超级喜欢
   */
  async function superLike() {
    return swipe('super_like')
  }

  /**
   * 加载匹配列表
   */
  async function loadMatches() {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await matchApi.getMatches()
      matches.value = data
    } catch (err: any) {
      error.value = err.message || '加载匹配列表失败'
      console.error('Load matches error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 关闭匹配动画
   */
  function closeMatchAnimation() {
    showMatchAnimation.value = false
    matchedPet.value = null
  }

  /**
   * 重置状态
   */
  function reset() {
    recommendations.value = []
    currentIndex.value = 0
    matches.value = []
    isLoading.value = false
    isLoadingMore.value = false
    error.value = null
    showMatchAnimation.value = false
    matchedPet.value = null
    hasMorePets.value = true
  }

  return {
    // State
    recommendations,
    currentIndex,
    matches,
    isLoading,
    isLoadingMore,
    error,
    showMatchAnimation,
    matchedPet,
    hasMorePets,
    // Getters
    currentPet,
    visiblePets,
    // Actions
    loadRecommendations,
    loadMoreRecommendations,
    swipe,
    like,
    pass,
    superLike,
    loadMatches,
    closeMatchAnimation,
    reset,
  }
})
