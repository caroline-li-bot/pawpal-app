<template>
  <view class="chat-detail-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      
      <view class="nav-center">
        <image :src="petAvatar" class="nav-avatar" mode="aspectFill" />
        <text class="nav-title">{{ petName }}</text>
      </view>
      
      <view class="nav-right">
        <text class="more-icon">⋮</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      scroll-y 
      class="message-list"
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <view class="message-container">
        <!-- 时间提示 -->
        <view class="time-divider">
          <text>今天</text>
        </view>

        <!-- 消息项 -->
        <view 
          v-for="(message, index) in chatStore.currentMessages" 
          :key="message.id"
          class="message-item"
          :class="{ 'is-self': message.sender_id === userStore.user?.id }"
        >
          <!-- 对方头像 -->
          <image 
            v-if="message.sender_id !== userStore.user?.id"
            :src="petAvatar" 
            class="message-avatar" 
            mode="aspectFill" 
          />

          <view class="message-content">
            <!-- 文本消息 -->
            <view v-if="message.type === 'text'" class="message-bubble"
              <text>{{ message.content }}</text>
            </view>

            <!-- 图片消息 -->
            <image 
              v-else-if="message.type === 'image'"
              :src="message.content"
              class="message-image"
              mode="widthFix"
              @click="previewImage(message.content)"
            />
          </view>

          <!-- 自己头像 -->
          <image 
            v-if="message.sender_id === userStore.user?.id"
            :src="userStore.petProfile?.photos[0] || '/static/default-avatar.png'" 
            class="message-avatar" 
            mode="aspectFill" 
          />
        </view>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-toolbar">
        <view class="toolbar-btn" @click="chooseImage"
        >
          <text>📷</text>
        </view>
      </view>
      
      <view class="input-wrapper"
        <input 
          v-model="inputText"
          class="message-input"
          placeholder="发送消息..."
          confirm-type="send"
          @confirm="sendMessage"
        />
        
        <view 
          class="send-btn"
          :class="{ active: inputText.trim() }"
          @click="sendMessage"
        
        >
          <text>发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'

const userStore = useUserStore()
const chatStore = useChatStore()

const matchId = ref('')
const petId = ref('')
const petName = ref('')
const petAvatar = ref('')
const inputText = ref('')
const scrollTop = ref(0)

/**
 * 发送消息
 */
async function sendMessage() {
  const content = inputText.value.trim()
  if (!content) return

  inputText.value = ''
  
  try {
    await chatStore.sendMessage(content)
    scrollToBottom()
  } catch (err) {
    uni.showToast({
      title: '发送失败',
      icon: 'none',
    })
  }
}

/**
 * 选择图片
 */
function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      try {
        // TODO: 上传图片到 Supabase Storage
        // const imageUrl = await uploadImage(res.tempFilePaths[0])
        // await chatStore.sendMessage(imageUrl, 'image')
        uni.showToast({
          title: '图片功能开发中',
          icon: 'none',
        })
      } catch (err) {
        uni.showToast({
          title: '发送失败',
          icon: 'none',
        })
      }
    },
  })
}

/**
 * 预览图片
 */
function previewImage(url: string) {
  uni.previewImage({
    urls: [url],
  })
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
  setTimeout(() => {
    scrollTop.value = 999999
  }, 100)
}

/**
 * 返回
 */
function goBack() {
  uni.navigateBack()
}

let unsubscribe: (() => void) | null = null

onLoad((options) => {
  matchId.value = options?.matchId || ''
  petId.value = options?.petId || ''
  petName.value = options?.petName || ''
  petAvatar.value = options?.petAvatar || ''

  if (matchId.value) {
    chatStore.loadMessages(matchId.value)
    // 订阅实时消息
    const subscription = chatStore.subscribeToMessages(matchId.value)
    unsubscribe = () => subscription.unsubscribe()
  }
})

onMounted(() => {
  scrollToBottom()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.chat-detail-page {
  min-height: 100vh;
  background: #F5F5F5;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
}

.nav-left {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 48rpx;
  color: #333;
}

.nav-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.more-icon {
  font-size: 40rpx;
  color: #666;
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding: 20rpx;
}

.message-container {
  display: flex;
  flex-direction: column;
}

.time-divider {
  text-align: center;
  margin: 20rpx 0;
}

.time-divider text {
  font-size: 24rpx;
  color: #999;
  background: #e0e0e0;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
}

.message-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.message-item.is-self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin: 0 20rpx;
}

.message-content {
  max-width: 60%;
}

.message-bubble {
  background: #fff;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
  word-break: break-all;
}

.is-self .message-bubble {
  background: #FF6B6B;
  color: #fff;
}

.message-image {
  max-width: 400rpx;
  border-radius: 20rpx;
}

/* 输入区域 */
.input-area {
  background: #fff;
  border-top: 1rpx solid #eee;
  padding: 20rpx;
}

.input-toolbar {
  display: flex;
  gap: 30rpx;
  margin-bottom: 20rpx;
}

.toolbar-btn {
  font-size: 40rpx;
  padding: 10rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.message-input {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
}

.send-btn {
  width: 120rpx;
  height: 80rpx;
  background: #e0e0e0;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.send-btn text {
  font-size: 28rpx;
  color: #999;
}

.send-btn.active {
  background: #FF6B6B;
}

.send-btn.active text {
  color: #fff;
}
</style>
