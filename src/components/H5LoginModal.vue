<template>
  <view v-if="showH5Login" class="h5-login-modal">
    <view class="modal-overlay" @click="close"></view>
    
    <view class="modal-content">
      <view class="modal-header">
        <text class="modal-title">H5 开发登录</text>
        <text class="modal-close" @click="close">×</text>
      </view>
      
      <view class="modal-body">
        <text class="hint-text">H5 环境无法使用微信登录，请选择以下方式：</text>
        
        <view class="login-options">
          <button class="option-btn primary" @click="handleDevLogin">
            <text>开发测试账号登录</text>
          </button>
          
          <view class="divider">
            <text class="divider-text">或</text>
          </view>
          
          <view class="email-login">
            <input 
              v-model="email" 
              class="input" 
              placeholder="邮箱地址"
              type="email"
            />
            <input 
              v-model="password" 
              class="input" 
              placeholder="密码"
              type="password"
              password
            />
            
            <button 
              class="option-btn secondary" 
              :disabled="!canEmailLogin"
              @click="handleEmailLogin"
            >
              <text>邮箱登录</text>
            </button>
          </view>
        </view>
      </view>
      
      <view class="modal-footer">
        <text class="footer-text">提示：生产环境请使用微信小程序版本</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const showH5Login = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const canEmailLogin = computed(() => {
  return email.value.includes('@') && password.value.length >= 6
})

function close() {
  showH5Login.value = false
}

/**
 * 开发测试账号登录
 */
async function handleDevLogin() {
  isLoading.value = true
  
  try {
    // 使用测试账号登录
    const testEmail = 'test@pawpal.app'
    const testPassword = 'test123456'
    
    const { error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      // 如果登录失败，尝试注册
      const { error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })
      
      if (signUpError) throw signUpError
      
      // 注册成功后再次登录
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })
    }
    
    emit('success')
    close()
  } catch (err: any) {
    uni.showToast({
      title: err.message || '登录失败',
      icon: 'none',
    })
  } finally {
    isLoading.value = false
  }
}

/**
 * 邮箱登录
 */
async function handleEmailLogin() {
  if (!canEmailLogin.value) return
  
  isLoading.value = true
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    if (error) throw error
    
    emit('success')
    close()
  } catch (err: any) {
    uni.showToast({
      title: err.message || '登录失败',
      icon: 'none',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.h5-login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: #fff;
  border-radius: 24rpx;
  width: 600rpx;
  max-width: 90%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 0 10rpx;
}

.modal-body {
  padding: 40rpx 30rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-btn {
  border: none;
  border-radius: 50rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.option-btn::after {
  border: none;
}

.option-btn.primary {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: #fff;
}

.option-btn.secondary {
  background: #f5f5f5;
  color: #333;
}

.option-btn[disabled] {
  opacity: 0.5;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20rpx 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1rpx;
  background: #eee;
}

.divider-text {
  padding: 0 20rpx;
  font-size: 24rpx;
  color: #999;
}

.email-login {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.input {
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.modal-footer {
  padding: 20rpx 30rpx;
  background: #fafafa;
}

.footer-text {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  display: block;
}
</style>
