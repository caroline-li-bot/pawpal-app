<template>
  <view class="match-success-page"
    <view class="animation-container"
      <view class="hearts"
        <text v-for="n in 6" :key="n" class="heart">💕</text>
      </view>
      
      <view class="match-title"
        <text>🎉 匹配成功！</text>
      </view>
      
      <view class="match-subtitle"
        <text>你们互相喜欢了对方</text>
      </view>
    </view>

    <view class="avatars-container"
      <view class="avatar-wrapper"
        <image :src="myPet?.photos[0]" class="avatar" mode="aspectFill" />
        <text class="avatar-name">{{ myPet?.name }}</text>
      </view>
      
      <view class="match-icon">💕</view>
      
      <view class="avatar-wrapper"
        <image :src="matchedPet?.photos[0]" class="avatar" mode="aspectFill" />
        <text class="avatar-name">{{ matchedPet?.name }}</text>
      </view>
    </view>

    <view class="actions"
      <button class="action-btn primary" @click="startChat"
        <text>发送消息</text>
      </button>
      
      <button class="action-btn secondary" @click="continueBrowsing"
        <text>继续浏览</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts"
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import type { PetProfile } from '@/types'

const userStore = useUserStore()

const myPet = ref<PetProfile | null>(null)
const matchedPet = ref<PetProfile | null>(null)
const matchId = ref('')

onLoad((options) => {
  // 从参数获取匹配信息
  if (options?.matchId) {
    matchId.value = options.matchId
  }
  
  myPet.value = userStore.petProfile
  // TODO: 从后端获取匹配的宠物信息
})

/**
 * 开始聊天
 */
function startChat() {
  if (matchedPet.value) {
    uni.navigateTo({
      url: `/pages/chat/detail?matchId=${matchId.value}&petId=${matchedPet.value.id}&petName=${matchedPet.value.name}`,
    })
  }
}

/**
 * 继续浏览
 */
function continueBrowsing() {
  uni.switchTab({ url: '/pages/home/index' })
}

onMounted(() => {
  // 播放匹配成功音效（可选）
})
</script>

<style scoped>
.match-success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FFB6C1 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.animation-container {
  text-align: center;
  margin-bottom: 80rpx;
}

.hearts {
  margin-bottom: 40rpx;
}

.heart {
  font-size: 60rpx;
  margin: 0 10rpx;
  display: inline-block;
  animation: float 2s infinite ease-in-out;
}

.heart:nth-child(1) { animation-delay: 0s; }
.heart:nth-child(2) { animation-delay: 0.2s; }
.heart:nth-child(3) { animation-delay: 0.4s; }
.heart:nth-child(4) { animation-delay: 0.6s; }
.heart:nth-child(5) { animation-delay: 0.8s; }
.heart:nth-child(6) { animation-delay: 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20rpx) scale(1.1); }
}

.match-title {
  margin-bottom: 20rpx;
}

.match-title text {
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
}

.match-subtitle text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
}

.avatars-container {
  display: flex;
  align-items: center;
  gap: 40rpx;
  margin-bottom: 100rpx;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 8rpx solid #fff;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  margin-bottom: 20rpx;
}

.avatar-name {
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
}

.match-icon {
  font-size: 80rpx;
  animation: heartbeat 1s infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.action-btn {
  border: none;
  border-radius: 50rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 500;
}

.action-btn::after {
  border: none;
}

.action-btn.primary {
  background: #fff;
  color: #FF6B6B;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
</style>
