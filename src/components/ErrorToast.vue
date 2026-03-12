<template>
  <view v-if="visible" class="error-toast">
    <view class="error-content">
      <text class="error-icon">⚠️</text>
      <text class="error-message">{{ message }}</text>
      <button v-if="showRetry" class="retry-btn" @click="handleRetry">
        <text>重试</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  message: string
  showRetry?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: false,
  message: '出错了',
  showRetry: true,
})

const emit = defineEmits<{
  retry: []
}>()

function handleRetry() {
  emit('retry')
}
</script>

<style scoped>
.error-toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.error-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  width: 500rpx;
}

.error-icon {
  font-size: 80rpx;
}

.error-message {
  font-size: 30rpx;
  color: #333;
  text-align: center;
  line-height: 1.5;
}

.retry-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 80rpx;
  font-size: 30rpx;
  margin-top: 20rpx;
}

.retry-btn::after {
  border: none;
}
</style>
