<template>
  <view class="chat-list-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">消息</text>
      <view v-if="chatStore.unreadTotal > 0" class="unread-badge">
        <text>{{ chatStore.unreadTotal }}</text>
      </view>
    </view>

    <!-- 聊天列表 -->
    <scroll-view scroll-y class="chat-list" refresher-enabled @refresherrefresh="onRefresh">
      <!-- 空状态 -->
      <view v-if="chatStore.sessions.length === 0 && !chatStore.isLoading" class="empty-state">
        <text class="empty-icon">💬</text>
        <text class="empty-title">还没有消息</text>
        <text class="empty-desc">去主页发现更多宠物伙伴吧~</text>
        
        <button class="discover-btn" @click="goToHome">
          <text>去发现</text>
        </button>
      </view>

      <!-- 列表项 -->
      <view 
        v-for="session in chatStore.sessions" 
        :key="session.id"
        class="chat-item"
        @click="goToChat(session)"
      >
        <!-- 头像 -->
        <view class="avatar-wrapper">
          <image :src="session.pet.photos[0]" class="avatar" mode="aspectFill" />
          <view v-if="session.unread_count > 0" class="unread-dot">
            <text v-if="session.unread_count <= 99">{{ session.unread_count }}</text>
            <text v-else>99+</text>
          </view>
        </view>

        <!-- 信息 -->
        <view class="chat-info">
          <view class="info-row">
            <text class="pet-name">{{ session.pet.name }}</text>
            <text class="time">{{ formatTime(session.last_message?.created_at || session.updated_at) }}</text>
          </view>
          
          <view class="info-row">
            <text class="last-message">{{ session.last_message?.content || '开始聊天吧~' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, onShow } from '@dcloudio/uni-app'
import { useChatStore } from '@/stores/chat'
import { formatTime } from '@/utils'
import type { ChatSession } from '@/types'

const chatStore = useChatStore()

/**
 * 跳转到聊天详情
 */
function goToChat(session: ChatSession) {
  uni.navigateTo({
    url: `/pages/chat/detail?matchId=${session.match_id}&petId=${session.pet.id}&petName=${session.pet.name}`,
  })
}

/**
 * 跳转到主页
 */
function goToHome() {
  uni.switchTab({ url: '/pages/home/index' })
}

/**
 * 下拉刷新
 */
function onRefresh() {
  chatStore.loadSessions().then(() => {
    uni.stopPullDownRefresh()
  })
}

onMounted(() => {
  chatStore.loadSessions()
})

onShow(() => {
  chatStore.loadSessions()
})
</script>

<style scoped>
.chat-list-page {
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
  justify-content: center;
  border-bottom: 1rpx solid #eee;
  position: relative;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.unread-badge {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  min-width: 36rpx;
  height: 36rpx;
  background: #FF6B6B;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
}

.unread-badge text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
}

/* 聊天列表 */
.chat-list {
  flex: 1;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.discover-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 24rpx 80rpx;
  font-size: 30rpx;
}

.discover-btn::after {
  border: none;
}

/* 聊天项 */
.chat-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f5f5f5;
}

.chat-item:active {
  background: #fafafa;
}

.avatar-wrapper {
  position: relative;
  margin-right: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.unread-dot {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #FF6B6B;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  border: 2rpx solid #fff;
}

.unread-dot text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 500;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.pet-name {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.time {
  font-size: 24rpx;
  color: #999;
}

.last-message {
  font-size: 28rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
</style>
