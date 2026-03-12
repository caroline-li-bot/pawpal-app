<template>
  <view class="home-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="location" @click="chooseLocation">
        <text class="location-icon">📍</text>
        <text class="location-text">{{ currentLocation }}</text>
      </view>
      
      <view class="filter-btn" @click="showFilter = true">
        <text>筛选</text>
      </view>
    </view>

    <!-- 卡片区域 -->
    <view class="card-container">
      <!-- 加载中 -->
      <view v-if="matchStore.isLoading && !matchStore.currentPet" class="loading-state">
        <view class="loading-animation">
          <text class="loading-emoji">🐾</text>
          <text class="loading-text">正在寻找附近的宠物...</text>
        </view>
      </view>

      <!-- 无更多推荐 -->
      <view v-else-if="!matchStore.hasMorePets" class="empty-state">
        <text class="empty-icon">🐕</text>
        <text class="empty-title">暂时没有更多推荐了</text>
        <text class="empty-desc">稍后再来看看吧~</text>
        
        <button class="refresh-btn" @click="refresh">
          <text>刷新</text>
        </button>
      </view>

      <!-- 卡片堆叠 -->
      <view v-else class="card-stack">
        <view 
          v-for="(pet, index) in visiblePets" 
          :key="pet.id"
          class="swipe-card"
          :class="{ 
            'is-top': index === 0,
            'is-dragging': isDragging && index === 0
          }"
          :style="getCardStyle(index)"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- 照片轮播 -->
          <swiper 
            class="card-swiper"
            :indicator-dots="pet.photos.length > 1"
            indicator-color="rgba(255,255,255,0.5)"
            indicator-active-color="#FF6B6B"
            @click.stop
          >
            <swiper-item v-for="(photo, pIndex) in pet.photos" :key="pIndex">
              <image :src="photo" mode="aspectFill" class="card-image" />
            </swiper-item>
          </swiper>

          <!-- 操作提示 -->
          <view v-if="index === 0" class="action-hints">
            <view class="hint like-hint" :class="{ show: dragDeltaX > 50 }">
              <text>喜欢</text>
            </view>
            <view class="hint pass-hint" :class="{ show: dragDeltaX < -50 }">
              <text>跳过</text>
            </view>
          </view>

          <!-- 宠物信息 -->
          <view class="card-info">
            <view class="info-header">
              <text class="pet-name">{{ pet.name }}</text>
              <text class="pet-meta">{{ formatAge(pet.age) }} · {{ pet.breed }}</text>
            </view>

            <view class="info-tags">
              <view class="gender-tag" :class="pet.gender">
                <text>{{ pet.gender === 'male' ? '♂️' : '♀️' }}</text>
              </view>
              <view v-for="tag in pet.personality_tags.slice(0, 3)" :key="tag" class="info-tag">
                <text>{{ tag }}</text>
              </view>
            </view>

            <text class="pet-bio">{{ pet.bio }}</text>

            <view class="info-footer">
              <text class="distance">📍 {{ pet.location || '附近' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view v-if="matchStore.hasMorePets" class="action-buttons">
      <view class="action-btn pass" @click="handlePass">
        <text class="btn-icon">✕</text>
      </view>
      
      <view class="action-btn super-like" @click="handleSuperLike">
        <text class="btn-icon">⭐</text>
      </view>
      
      <view class="action-btn like" @click="handleLike">
        <text class="btn-icon">♥</text>
      </view>
    </view>

    <!-- 匹配成功动画 -->
    <view v-if="matchStore.showMatchAnimation" class="match-overlay" @click="matchStore.closeMatchAnimation">
      <view class="match-content" @click.stop>
        <view class="match-header">
          <text class="match-title">🎉 匹配成功！</text>
          <text class="match-subtitle">你们互相喜欢了对方</text>
        </view>

        <view class="match-avatars">
          <image :src="userStore.petProfile?.photos[0]" class="avatar" mode="aspectFill" />
          <view class="match-heart">💕</view>
          <image :src="matchStore.matchedPet?.photos[0]" class="avatar" mode="aspectFill" />
        </view>

        <view class="match-actions">
          <button class="match-btn primary" @click="startChat">
            <text>发送消息</text>
          </button>
          
          <button class="match-btn secondary" @click="matchStore.closeMatchAnimation">
            <text>继续浏览</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMatchStore } from '@/stores/match'
import { formatAge, formatDistance } from '@/utils'

const userStore = useUserStore()
const matchStore = useMatchStore()

const currentLocation = ref('北京市')
const showFilter = ref(false)

// 拖拽相关
const isDragging = ref(false)
const dragStartX = ref(0)
const dragDeltaX = ref(0)
const dragDeltaY = ref(0)

// 可见的宠物卡片（最多显示3张）
const visiblePets = computed(() => {
  return matchStore.recommendations.slice(
    matchStore.currentIndex,
    matchStore.currentIndex + 3
  )
})

/**
 * 获取卡片样式
 */
function getCardStyle(index: number) {
  if (index === 0 && isDragging.value) {
    const rotate = dragDeltaX.value * 0.05
    return {
      transform: `translateX(${dragDeltaX.value}px) translateY(${dragDeltaY.value}px) rotate(${rotate}deg)`,
      zIndex: 10 - index,
    }
  }
  
  return {
    transform: `scale(${1 - index * 0.05}) translateY(${index * 20}px)`,
    zIndex: 10 - index,
    opacity: 1 - index * 0.2,
  }
}

/**
 * 触摸开始
 */
function handleTouchStart(e: TouchEvent) {
  isDragging.value = true
  dragStartX.value = e.touches[0].clientX
  dragDeltaX.value = 0
  dragDeltaY.value = 0
}

/**
 * 触摸移动
 */
function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  dragDeltaX.value = currentX - dragStartX.value
  dragDeltaY.value = (currentY - dragStartX.value) * 0.3
}

/**
 * 触摸结束
 */
function handleTouchEnd() {
  if (!isDragging.value) return
  
  isDragging.value = false
  
  if (dragDeltaX.value > 100) {
    handleLike()
  } else if (dragDeltaX.value < -100) {
    handlePass()
  }
  
  dragDeltaX.value = 0
  dragDeltaY.value = 0
}

/**
 * 喜欢
 */
async function handleLike() {
  await matchStore.swipe('like')
}

/**
 * 跳过
 */
async function handlePass() {
  await matchStore.swipe('pass')
}

/**
 * 超级喜欢
 */
async function handleSuperLike() {
  await matchStore.swipe('super_like')
}

/**
 * 刷新
 */
function refresh() {
  matchStore.loadRecommendations()
}

/**
 * 开始聊天
 */
function startChat() {
  matchStore.closeMatchAnimation()
  // TODO: 跳转到聊天页面
}

/**
 * 选择位置
 */
function chooseLocation() {
  uni.chooseLocation({
    success: (res) => {
      currentLocation.value = res.name || res.address
    },
  })
}

onMounted(() => {
  matchStore.loadRecommendations()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #F5F5F5;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.header {
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;
}

.location {
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.location-text {
  font-size: 28rpx;
  color: #333;
  max-width: 300rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-btn {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
}

/* 卡片容器 */
.card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-animation {
  text-align: center;
}

.loading-emoji {
  font-size: 80rpx;
  display: block;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
  display: block;
}

/* 空状态 */
.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
  display: block;
  margin-bottom: 40rpx;
}

.refresh-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 24rpx 80rpx;
  font-size: 30rpx;
}

.refresh-btn::after {
  border: none;
}

/* 卡片堆叠 */
.card-stack {
  width: 100%;
  height: 900rpx;
  position: relative;
}

.swipe-card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.swipe-card.is-dragging {
  transition: none;
}

.card-swiper {
  height: 560rpx;
}

.card-image {
  width: 100%;
  height: 100%;
}

/* 操作提示 */
.action-hints {
  position: absolute;
  top: 40rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 40rpx;
  pointer-events: none;
}

.hint {
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  border: 4rpx solid;
  font-size: 36rpx;
  font-weight: bold;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s;
}

.hint.show {
  opacity: 1;
  transform: scale(1);
}

.like-hint {
  color: #4CAF50;
  border-color: #4CAF50;
  transform: rotate(-15deg);
}

.pass-hint {
  color: #FF5252;
  border-color: #FF5252;
  transform: rotate(15deg);
}

/* 卡片信息 */
.card-info {
  padding: 30rpx;
}

.info-header {
  margin-bottom: 20rpx;
}

.pet-name {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.pet-meta {
  font-size: 26rpx;
  color: #666;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.gender-tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.gender-tag.male {
  background: #E3F2FD;
  color: #2196F3;
}

.gender-tag.female {
  background: #FCE4EC;
  color: #E91E63;
}

.info-tag {
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.pet-bio {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-footer {
  display: flex;
  align-items: center;
}

.distance {
  font-size: 24rpx;
  color: #999;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60rpx;
  padding: 40rpx;
}

.action-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.action-btn:active {
  transform: scale(0.9);
}

.action-btn.pass {
  background: #fff;
  border: 4rpx solid #FF5252;
}

.action-btn.pass .btn-icon {
  color: #FF5252;
  font-size: 48rpx;
}

.action-btn.super-like {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.action-btn.super-like .btn-icon {
  color: #fff;
  font-size: 40rpx;
}

.action-btn.like {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
}

.action-btn.like .btn-icon {
  color: #fff;
  font-size: 48rpx;
}

/* 匹配成功弹窗 */
.match-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.match-content {
  width: 600rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  animation: scaleIn 0.3s;
}

@keyframes scaleIn {
  from { transform: scale(0.8); }
  to { transform: scale(1); }
}

.match-header {
  margin-bottom: 50rpx;
}

.match-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B6B;
  display: block;
  margin-bottom: 16rpx;
}

.match-subtitle {
  font-size: 28rpx;
  color: #666;
}

.match-avatars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
  margin-bottom: 50rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.match-heart {
  font-size: 60rpx;
  animation: heartbeat 1s infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.match-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.match-btn {
  border: none;
  border-radius: 50rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.match-btn::after {
  border: none;
}

.match-btn.primary {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: #fff;
}

.match-btn.secondary {
  background: #f5f5f5;
  color: #666;
}
</style>
