/**
 * Pinia Store - 聊天状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, ChatSession } from '@/types'
import { chatApi, supabase } from '@/api/supabase'

export const useChatStore = defineStore('chat', () => {
  // State
  const chatList = ref<ChatSession[]>([])
  const messages = ref<Record<string, Message[]>>({})
  const isLoading = ref(false)
  const isLoadingMessages = ref(false)
  const error = ref<string | null>(null)
  const activeChannel = ref<ReturnType<typeof chatApi.subscribeToMessages> | null>(null)
  const unreadCount = ref(0)

  // Getters
  const totalUnreadCount = computed(() => {
    return chatList.value.reduce((sum, chat) => sum + (chat.unread_count || 0), 0)
  })

  const sortedChatList = computed(() => {
    return [...chatList.value].sort((a, b) => {
      const timeA = new Date(a.updated_at).getTime()
      const timeB = new Date(b.updated_at).getTime()
      return timeB - timeA
    })
  })

  // Actions
  /**
   * 加载聊天列表
   */
  async function loadChatList() {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await chatApi.getChatList()
      chatList.value = data || []
    } catch (err: any) {
      error.value = err.message || '加载聊天列表失败'
      console.error('Load chat list error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载聊天记录
   */
  async function loadMessages(matchId: string, limit: number = 50) {
    if (isLoadingMessages.value) return
    
    isLoadingMessages.value = true
    error.value = null
    
    try {
      const data = await chatApi.getMessages(matchId, limit)
      messages.value[matchId] = data.reverse()
    } catch (err: any) {
      error.value = err.message || '加载聊天记录失败'
      console.error('Load messages error:', err)
    } finally {
      isLoadingMessages.value = false
    }
  }

  /**
   * 加载更多历史消息
   */
  async function loadMoreMessages(matchId: string, limit: number = 20) {
    const currentMessages = messages.value[matchId] || []
    if (currentMessages.length === 0) return
    
    const oldestMessage = currentMessages[0]
    
    try {
      const data = await chatApi.getMessages(matchId, limit, oldestMessage.created_at)
      if (data.length > 0) {
        messages.value[matchId] = [...data.reverse(), ...currentMessages]
      }
    } catch (err: any) {
      console.error('Load more messages error:', err)
    }
  }

  /**
   * 发送消息
   */
  async function sendMessage(matchId: string, content: string, type: 'text' | 'image' = 'text') {
    try {
      const message = await chatApi.sendMessage(matchId, content, type)
      
      // 添加到本地消息列表
      if (!messages.value[matchId]) {
        messages.value[matchId] = []
      }
      messages.value[matchId].push(message)
      
      // 更新聊天列表的最后消息
      const chatIndex = chatList.value.findIndex(chat => chat.match_id === matchId)
      if (chatIndex > -1) {
        chatList.value[chatIndex].last_message = message
        chatList.value[chatIndex].updated_at = message.created_at
      }
      
      return message
    } catch (err: any) {
      error.value = err.message || '发送消息失败'
      throw err
    }
  }

  /**
   * 标记消息已读
   */
  async function markAsRead(matchId: string) {
    try {
      await chatApi.markAsRead(matchId)
      
      // 更新本地未读数
      const chatIndex = chatList.value.findIndex(chat => chat.match_id === matchId)
      if (chatIndex > -1) {
        chatList.value[chatIndex].unread_count = 0
      }
    } catch (err: any) {
      console.error('Mark as read error:', err)
    }
  }

  /**
   * 订阅实时消息
   */
  function subscribeToMessages(matchId: string) {
    // 取消之前的订阅
    unsubscribe()
    
    activeChannel.value = chatApi.subscribeToMessages(matchId, (message) => {
      // 添加新消息到本地
      if (!messages.value[matchId]) {
        messages.value[matchId] = []
      }
      messages.value[matchId].push(message)
      
      // 更新聊天列表
      const chatIndex = chatList.value.findIndex(chat => chat.match_id === matchId)
      if (chatIndex > -1) {
        chatList.value[chatIndex].last_message = message
        chatList.value[chatIndex].updated_at = message.created_at
      }
    })
  }

  /**
   * 取消订阅
   */
  function unsubscribe() {
    if (activeChannel.value) {
      supabase.removeChannel(activeChannel.value)
      activeChannel.value = null
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    unsubscribe()
    chatList.value = []
    messages.value = {}
    isLoading.value = false
    isLoadingMessages.value = false
    error.value = null
    unreadCount.value = 0
  }

  return {
    // State
    chatList,
    messages,
    isLoading,
    isLoadingMessages,
    error,
    unreadCount,
    // Getters
    totalUnreadCount,
    sortedChatList,
    // Actions
    loadChatList,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    markAsRead,
    subscribeToMessages,
    unsubscribe,
    reset,
  }
})
