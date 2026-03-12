/**
 * Pinia Store - 聊天状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message, ChatSession } from '@/types'
import { chatApi } from '@/api/supabase'

export const useChatStore = defineStore('chat', () => {
  // State
  const sessions = ref<ChatSession[]>([])
  const currentMessages = ref<Message[]>([])
  const currentMatchId = ref<string | null>(null)
  const isLoading = ref(false)
  const unreadTotal = ref(0)

  // Actions
  /**
   * 加载聊天列表
   */
  async function loadSessions() {
    isLoading.value = true
    try {
      const data = await chatApi.getChatList()
      sessions.value = data
      unreadTotal.value = data.reduce((sum: number, s: ChatSession) => sum + s.unread_count, 0)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载聊天记录
   */
  async function loadMessages(matchId: string) {
    currentMatchId.value = matchId
    isLoading.value = true
    try {
      const data = await chatApi.getMessages(matchId)
      currentMessages.value = data.reverse()
      // 标记已读
      await chatApi.markAsRead(matchId)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 发送消息
   */
  async function sendMessage(content: string, type: 'text' | 'image' = 'text') {
    if (!currentMatchId.value) return
    
    const message = await chatApi.sendMessage(currentMatchId.value, content, type)
    currentMessages.value.push(message)
    return message
  }

  /**
   * 接收新消息
   */
  function receiveMessage(message: Message) {
    if (message.match_id === currentMatchId.value) {
      currentMessages.value.push(message)
      // 标记已读
      chatApi.markAsRead(message.match_id)
    }
    // 刷新会话列表
    loadSessions()
  }

  /**
   * 订阅实时消息
   */
  function subscribeToMessages(matchId: string) {
    return chatApi.subscribeToMessages(matchId, (message) => {
      receiveMessage(message)
    })
  }

  return {
    sessions,
    currentMessages,
    currentMatchId,
    isLoading,
    unreadTotal,
    loadSessions,
    loadMessages,
    sendMessage,
    receiveMessage,
    subscribeToMessages,
  }
})
