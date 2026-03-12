<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo-wrapper">
        <text class="logo-icon">🐾</text>
      </view>
      <text class="app-name">爪爪 PawPal</text>
      <text class="app-slogan">让爱宠找到好朋友</text>
    </view>

    <!-- 登录区域 -->
    <view class="login-section">
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">💕</text>
          <text class="feature-text">发现附近的宠物伙伴</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🎾</text>
          <text class="feature-text">找到志同道合的玩伴</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">💬</text>
          <text class="feature-text">与宠友畅聊互动</text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button 
        class="wechat-login-btn"
        :loading="userStore.isLoading"
        :disabled="userStore.isLoading"
        @click="handleLogin"
      >
        <text class="btn-icon">💬</text>
        <text class="btn-text">{{ loginButtonText }}</text>
      </button>

      <!-- 协议 -->
      <view class="agreement-section">
        <checkbox-group @change="handleAgreementChange">
          <label class="agreement-label">
            <checkbox :checked="agreed" color="#FF6B6B" />
            <text class="agreement-text">
              我已阅读并同意
              <text class="link" @click.stop="showUserAgreement">《用户协议》</text>
              和
              <text class="link" @click.stop="showPrivacyPolicy">《隐私政策》</text>
            </text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <!-- H5 登录模态框 -->
    <H5LoginModal v-model="showH5Login" @success="onH5LoginSuccess" />

    <!-- 加载状态 -->
    <Loading :visible="userStore.isLoading" text="登录中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import Loading from '@/components/Loading.vue'
import H5LoginModal from '@/components/H5LoginModal.vue'

const userStore = useUserStore()
const agreed = ref(false)
const showH5Login = ref(false)

// 判断是否为 H5 环境
const isH5 = computed(() => {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
})

const loginButtonText = computed(() => {
  return isH5.value ? '立即登录' : '微信一键登录'
})

/**
 * 处理协议勾选
 */
function handleAgreementChange(e: any) {
  agreed.value = e.detail.value.length > 0
}

/**
 * 处理登录
 */
async function handleLogin() {
  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
    })
    return
  }

  // #ifdef H5
  // H5 环境显示登录模态框
  showH5Login.value = true
  // #endif

  // #ifdef MP-WEIXIN
  // 微信小程序环境使用微信登录
  await handleWechatLogin()
  // #endif
}

/**
 * 微信登录
 */
async function handleWechatLogin() {
  try {
    await userStore.wechatLogin()
    
    // 检查是否有宠物资料
    if (userStore.hasPetProfile) {
      uni.switchTab({ url: '/pages/home/index' })
    } else {
      uni.redirectTo({ url: '/pages/pet-profile/create' })
    }
  } catch (err: any) {
    uni.showToast({
      title: err.message || '登录失败',
      icon: 'none',
    })
  }
}

/**
 * H5 登录成功
 */
async function onH5LoginSuccess() {
  await userStore.fetchUserProfile()
  
  // 检查是否有宠物资料
  if (userStore.hasPetProfile) {
    uni.switchTab({ url: '/pages/home/index' })
  } else {
    uni.redirectTo({ url: '/pages/pet-profile/create' })
  }
}

/**
 * 显示用户协议
 */
function showUserAgreement() {
  uni.navigateTo({
    url: '/pages/webview/index?title=用户协议&url=https://pawpal.app/agreement',
  })
}

/**
 * 显示隐私政策
 */
function showPrivacyPolicy() {
  uni.navigateTo({
    url: '/pages/webview/index?title=隐私政策&url=https://pawpal.app/privacy',
  })
}

// #ifdef H5
// H5 开发环境检查是否已登录
if (import.meta.env.DEV) {
  console.log('H5 开发环境')
}
// #endif
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 50%, #F0F9FF 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 60rpx 40rpx;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  top: -100rpx;
  right: -100rpx;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  background: linear-gradient(135deg, #87CEEB 0%, #4169E1 100%);
  bottom: 200rpx;
  left: -80rpx;
}

.circle-3 {
  width: 150rpx;
  height: 150rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  bottom: 100rpx;
  right: 50rpx;
  opacity: 0.4;
}

/* Logo区域 */
.logo-section {
  margin-top: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.logo-wrapper {
  width: 180rpx;
  height: 180rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 60rpx rgba(255, 107, 107, 0.3);
  margin-bottom: 40rpx;
}

.logo-icon {
  font-size: 80rpx;
}

.app-name {
  font-size: 56rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: #666;
}

/* 登录区域 */
.login-section {
  margin-top: 80rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.feature-list {
  margin-bottom: 60rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16rpx;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #333;
}

/* 登录按钮 */
.wechat-login-btn {
  background: linear-gradient(135deg, #07C160 0%, #05a350 100%);
  color: white;
  border: none;
  border-radius: 50rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 10rpx 40rpx rgba(7, 193, 96, 0.3);
  margin-bottom: 40rpx;
}

.wechat-login-btn::after {
  border: none;
}

.wechat-login-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.wechat-login-btn[disabled] {
  opacity: 0.6;
}

.btn-icon {
  margin-right: 16rpx;
  font-size: 36rpx;
}

/* 协议区域 */
.agreement-section {
  margin-top: auto;
  padding-bottom: 40rpx;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
}

.agreement-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  margin-left: 16rpx;
  flex: 1;
}

.link {
  color: #FF6B6B;
}
</style>
