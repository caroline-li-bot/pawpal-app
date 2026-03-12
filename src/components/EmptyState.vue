<template>
  <view v-if="visible" class="empty-state" :class="`size-${size}`">
    <text class="empty-icon">{{ icon }}</text>
    <text v-if="title" class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-description">{{ description }}</text>
    
    <button v-if="showAction" class="action-btn" @click="handleAction">
      <text>{{ actionText }}</text>
    </button>
    
    <slot></sslot>
  </view>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  icon?: string
  title?: string
  description?: string
  showAction?: boolean
  actionText?: string
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  visible: true,
  icon: '🐕',
  title: '',
  description: '',
  showAction: false,
  actionText: '刷新',
  size: 'medium',
})

const emit = defineEmits<{
  action: []
}>()

function handleAction() {
  emit('action')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
}

.empty-state.size-small {
  padding: 30rpx;
}

.empty-state.size-small .empty-icon {
  font-size: 60rpx;
}

.empty-state.size-small .empty-title {
  font-size: 28rpx;
}

.empty-state.size-small .empty-description {
  font-size: 24rpx;
}

.empty-state.size-large {
  padding: 100rpx 40rpx;
}

.empty-state.size-large .empty-icon {
  font-size: 160rpx;
}

.empty-state.size-large .empty-title {
  font-size: 36rpx;
}

.empty-state.size-large .empty-description {
  font-size: 30rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  display: block;
}

.empty-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.empty-description {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  line-height: 1.5;
  display: block;
}

.action-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  margin-top: 40rpx;
}

.action-btn::after {
  border: none;
}
</style>
