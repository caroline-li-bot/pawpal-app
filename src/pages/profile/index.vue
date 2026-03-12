<template>
  <view class="profile-page">
    <!-- 头部背景 -->
    <view class="header-bg">
      <view class="bg-gradient"></view>
    </view>

    <!-- 用户信息卡片 -->
    <view class="profile-card"
      <view class="user-info"
        <image 
          :src="userStore.petProfile?.photos[0] || '/static/default-avatar.png'" 
          class="user-avatar"
          mode="aspectFill"
          @click="previewAvatar"
        />
        
        <view class="user-meta"
          <text class="user-name">{{ userStore.petProfile?.name || '未设置昵称' }}</text>
          <view class="user-tags"
            <text class="user-tag">{{ userStore.petProfile?.breed }}</text>
            <text class="user-tag">{{ formatAge(userStore.petProfile?.age || 0) }}</text>
          </view>
        </view>
      </view>

      <!-- 统计数据 -->
      <view class="stats-row"
        <view class="stat-item" @click="goToMatches"
          <text class="stat-value">{{ matchCount }}</text>
          <text class="stat-label">匹配</text>
        </view>
        
        <view class="stat-divider"></view>
        
        <view class="stat-item" @click="goToLikes"
          <text class="stat-value">{{ likeCount }}</text>
          <text class="stat-label">喜欢</text>
        </view>
        
        <view class="stat-divider"></view>
        
        <view class="stat-item"
          <text class="stat-value">{{ visitorCount }}</text>
          <text class="stat-label">访客</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section"
      <view class="menu-group"
        <view class="menu-item" @click="editProfile"
          <text class="menu-icon">✏️</text>
          <text class="menu-text">编辑资料</text>
          <text class="menu-arrow">›</text>
        </view>
        
        <view class="menu-item" @click="myPhotos"
          <text class="menu-icon">📷</text>
          <text class="menu-text">我的相册</text>
          <text class="menu-arrow">›</text>
        </view>
        
        <view class="menu-item" @click="myTags"
          <text class="menu-icon">🏷️</text>
          <text class="menu-text">个性标签</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-group"
        <view class="menu-item" @click="settings"
          <text class="menu-icon">⚙️</text>
          <text class="menu-text">设置</text>
          <text class="menu-arrow">›</text>
        </view>
        
        <view class="menu-item" @click="help"
          <text class="menu-icon">❓</text>
          <text class="menu-text">帮助与反馈</text>
          <text class="menu-arrow">›</text>
        </view>
        
        <view class="menu-item" @click="about"
          <text class="menu-icon">ℹ️</text>
          <text class="menu-text">关于爪爪</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="menu-group"
        <view class="menu-item logout" @click="handleLogout"
          <text class="menu-text">退出登录</text>
        </view>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info"
      <text>爪爪 PawPal v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useMatchStore } from '@/stores/match'
import { formatAge } from '@/utils'

const userStore = useUserStore()
const matchStore = useMatchStore()

const matchCount = ref(0)
const likeCount = ref(0)
const visitorCount = ref(0)

/**
 * 编辑资料
 */
function editProfile() {
  if (!userStore.petProfile) {
    uni.navigateTo({ url: '/pages/pet-profile/create' })
  } else {
    uni.navigateTo({ url: `/pages/pet-profile/edit?id=${userStore.petProfile.id}` })
  }
}

/**
 * 我的相册
 */
function myPhotos() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

/**
 * 个性标签
 */
function myTags() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

/**
 * 设置
 */
function settings() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

/**
 * 帮助
 */
function help() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

/**
 * 关于
 */
function about() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

/**
 * 查看匹配
 */
function goToMatches() {
  uni.switchTab({ url: '/pages/chat/list' })
}

/**
 * 查看喜欢
 */
function goToLikes() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

/**
 * 预览头像
 */
function previewAvatar() {
  const photo = userStore.petProfile?.photos[0]
  if (photo) {
    uni.previewImage({
      urls: [photo],
    })
  }
}

/**
 * 退出登录
 */
async function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await userStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    },
  })
}

/**
 * 加载统计数据
 */
async function loadStats() {
  await matchStore.loadMatches()
  matchCount.value = matchStore.matches.length
  // TODO: 从后端获取喜欢数和访客数
  likeCount.value = 0
  visitorCount.value = 0
}

onMounted(() => {
  loadStats()
})

onShow(() => {
  userStore.fetchUserProfile()
  loadStats()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

/* 头部背景 */
.header-bg {
  height: 300rpx;
  position: relative;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FFB6C1 100%);
  border-radius: 0 0 40rpx 40rpx;
}

/* 用户信息卡片 */
.profile-card {
  margin: -100rpx 30rpx 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.user-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  margin-right: 30rpx;
}

.user-meta {
  flex: 1;
}

.user-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.user-tags {
  display: flex;
  gap: 16rpx;
}

.user-tag {
  padding: 8rpx 20rpx;
  background: #FFF5F5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #FF6B6B;
}

/* 统计数据 */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 30rpx;
  border-top: 1rpx solid #f5f5f5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #999;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #eee;
}

/* 菜单 */
.menu-section {
  padding: 0 30rpx;
}

.menu-group {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #fafafa;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.menu-item.logout .menu-text {
  text-align: center;
  color: #FF5252;
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: 40rpx;
}

.version-info text {
  font-size: 24rpx;
  color: #999;
}
</style>
