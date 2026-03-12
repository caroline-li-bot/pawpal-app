<template>
  <view v-if="visible" class="loading-overlay" :class="{ 'is-fullscreen': fullscreen }">
    <view class="loading-content">
      <view class="loading-spinner">
        <view class="spinner-dot" v-for="i in 3" :key="i"></view>
      </view>
      <text v-if="text" class="loading-text">{{ text }}</text>
      <slot></sslot>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  text?: string
  fullscreen?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: false,
  text: '',
  fullscreen: true,
})
</script>

<style scoped>
.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.loading-overlay.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.loading-spinner {
  display: flex;
  gap: 12rpx;
}

.spinner-dot {
  width: 16rpx;
  height: 16rpx;
  background: #FF6B6B;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.spinner-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}
</style>
