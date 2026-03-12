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
  const showMatchAnimation = ref(false)
  const matchedPet = ref<PetProfile | null>(null)

  // Getters
  const currentPet = computed(() => {
    if (currentIndex.value < recommendations.value.length) {
      return recommendations.value[currentIndex.value]
    }
    return null
  })

  const hasMorePets = computed(() => currentIndex.value < recommendations.value.length)

  // Actions
  /**
   * 加载推荐列表
   */
  async function loadRecommendations() {
    isLoading.value = true
    try {
      const data = await petApi.getRecommendations(20)
      recommendations.value = data
      currentIndex.value = 0
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 滑动操作
   */
  async function swipe(action: 'like' | 'pass' | 'super_like') {
    if (!currentPet.value) return

    const pet = currentPet.value
    currentIndex.value++

    if (action !== 'pass') {
      try {
        const result = await matchApi.swipe(pet.user_id, action)
        if (result.isMatch) {
          matchedPet.value = pet
          showMatchAnimation.value = true
        }
      } catch (err) {
        console.error('滑动操作失败:', err)
      }
    }

    // 如果快用完了，预加载更多
    if (currentIndex.value >= recommendations.value.length - 3) {
      loadRecommendations()
    }
  }

  /**
   * 加载匹配列表
   */
  async function loadMatches() {
    isLoading.value = true
    try {
      const data = await matchApi.getMatches()
      matches.value = data
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

  return {
    recommendations,
    currentIndex,
    currentPet,
    hasMorePets,
    matches,
    isLoading,
    showMatchAnimation,
    matchedPet,
    loadRecommendations,
    swipe,
    loadMatches,
    closeMatchAnimation,
  }
})
