<template>
  <view class="create-profile-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">创建宠物资料</text>
    </view>

    <scroll-view scroll-y class="form-container">
      <!-- 照片上传 -->
      <view class="section">
        <text class="section-title">宠物照片 <text class="required">*</text></text>
        <view class="photo-upload">
          <view 
            v-for="(photo, index) in form.photos" 
            :key="index"
            class="photo-item"
          >
            <image :src="photo" mode="aspectFill" class="photo" @click="previewPhoto(index)" />
            <view class="delete-btn" @click.stop="removePhoto(index)">
              <text>×</text>
            </view>
          </view>
          
          <view 
            v-if="form.photos.length < 6"
            class="upload-btn"
            :class="{ 'is-uploading': isUploading }"
            @click="choosePhoto"
          >
            <view v-if="isUploading" class="upload-loading">
              <view class="loading-spinner"></view>
            </view>
            <view v-else>
              <text class="upload-icon">+</text>
              <text class="upload-text">{{ form.photos.length }}/6</text>
            </view>
          </view>
        </view>
        <text v-if="photoError" class="error-text">{{ photoError }}</text>
      </view>

      <!-- 基本信息 -->
      <view class="section">
        <text class="section-title">基本信息</text>
        
        <view class="form-item">
          <text class="label">宠物昵称 <text class="required">*</text></text>
          <input 
            v-model="form.name"
            class="input"
            :class="{ 'is-error': errors.name }"
            placeholder="给宠物起个可爱的名字"
            maxlength="20"
            @blur="validateField('name')"
          />
          <text v-if="errors.name" class="error-text">{{ errors.name }}</text>
        </view>

        <view class="form-item">
          <text class="label">宠物类型 <text class="required">*</text></text>
          <view class="options">
            <view 
              v-for="petType in petTypes" 
              :key="petType.value"
              class="option"
              :class="{ active: form.type === petType.value }"
              @click="form.type = petType.value as PetType"
            >
              <text>{{ petType.icon }} {{ petType.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">品种 <text class="required">*</text></text>
          <input 
            v-model="form.breed"
            class="input"
            :class="{ 'is-error': errors.breed }"
            placeholder="例如：金毛、布偶猫"
            maxlength="20"
            @blur="validateField('breed')"
          />
          <text v-if="errors.breed" class="error-text">{{ errors.breed }}</text>
        </view>

        <view class="form-item">
          <text class="label">性别 <text class="required">*</text></text>
          <view class="options">
            <view 
              v-for="gender in genders" 
              :key="gender.value"
              class="option"
              :class="{ active: form.gender === gender.value }"
              @click="form.gender = gender.value as PetGender"
            >
              <text>{{ gender.icon }} {{ gender.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">年龄</text>
          <slider 
            :value="form.age * 12"
            :min="1" 
            :max="240"
            :step="1"
            show-value
            activeColor="#FF6B6B"
            backgroundColor="#E5E5E5"
            block-size="20"
            @change="handleAgeChange"
          />
          <text class="age-display">{{ formatAgeDisplay(form.age) }}</text>
        </view>

        <view class="form-item">
          <text class="label">体型 <text class="required">*</text></text>
          <view class="options">
            <view 
              v-for="size in sizes" 
              :key="size.value"
              class="option"
              :class="{ active: form.size === size.value }"
              @click="form.size = size.value as PetSize"
            >
              <text>{{ size.icon }} {{ size.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 个性标签 -->
      <view class="section">
        <text class="section-title">性格特点</text>
        <view class="tags">
          <view 
            v-for="tag in personalityTags" 
            :key="tag"
            class="tag"
            :class="{ active: form.personality_tags.includes(tag) }"
            @click="toggleTag('personality_tags', tag)"
          >
            <text>{{ tag }}</text>
          </view>
        </view>
        <text class="hint-text">最多选择5个</text>
      </view>

      <!-- 兴趣爱好 -->
      <view class="section">
        <text class="section-title">兴趣爱好</text>
        <view class="tags">
          <view 
            v-for="interest in interestTags" 
            :key="interest"
            class="tag"
            :class="{ active: form.interests.includes(interest) }"
            @click="toggleTag('interests', interest)"
          >
            <text>{{ interest }}</text>
          </view>
        </view>
        <text class="hint-text">最多选择5个</text>
      </view>

      <!-- 个性签名 -->
      <view class="section">
        <text class="section-title">个性签名</text>
        <textarea 
          v-model="form.bio"
          class="textarea"
          placeholder="介绍一下你的宠物，让大家更好地了解它..."
          maxlength="200"
        />
        <text class="char-count">{{ form.bio.length }}/200</text>
      </view>

      <!-- 位置信息 -->
      <view class="section">
        <text class="section-title">所在位置 <text class="required">*</text></text>
        <view 
          class="location-picker" 
          :class="{ 'is-error': errors.location, 'is-selected': form.location }"
          @click="chooseLocation"
        >
          <text class="location-icon">📍</text>
          <text class="location-text">{{ form.location || '点击选择位置' }}</text>
        </view>
        <text v-if="errors.location" class="error-text">{{ errors.location }}</text>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer">
      <button 
        class="submit-btn"
        :loading="isSubmitting"
        :disabled="!isFormValid || isSubmitting"
        @click="handleSubmit"
      >
        <text>{{ submitButtonText }}</text>
      </button>
    </view>

    <!-- 全局加载 -->
    <Loading :visible="isSubmitting" text="创建中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { petApi } from '@/api/supabase'
import type { PetType, PetGender, PetSize } from '@/types'
import Loading from '@/components/Loading.vue'

const userStore = useUserStore()
const isSubmitting = ref(false)
const isUploading = ref(false)
const photoError = ref('')

// 表单数据
const form = ref({
  name: '',
  type: 'dog' as PetType,
  breed: '',
  gender: 'male' as PetGender,
  age: 1,
  size: 'medium' as PetSize,
  photos: [] as string[],
  bio: '',
  location: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  personality_tags: [] as string[],
  interests: [] as string[],
})

// 错误信息
const errors = reactive({
  name: '',
  breed: '',
  location: '',
})

// 选项数据
const petTypes = [
  { value: 'dog', label: '狗狗', icon: '🐕' },
  { value: 'cat', label: '猫咪', icon: '🐱' },
  { value: 'other', label: '其他', icon: '🐰' },
]

const genders = [
  { value: 'male', label: '弟弟', icon: '♂️' },
  { value: 'female', label: '妹妹', icon: '♀️' },
]

const sizes = [
  { value: 'small', label: '小型', icon: '🐕' },
  { value: 'medium', label: '中型', icon: '🐩' },
  { value: 'large', label: '大型', icon: '🦮' },
]

const personalityTags = [
  '活泼好动', '温顺乖巧', '独立自主', '粘人精',
  '聪明伶俐', '贪吃鬼', '胆小害羞', '社交达人',
  '好奇心强', '懒洋洋', '护主', '友好'
]

const interestTags = [
  '散步', '跑步', '游泳', '接球',
  '爬猫架', '玩球', '追激光笔', '咬玩具',
  '社交', '睡觉', '美食', '旅行'
]

// 表单验证
const isFormValid = computed(() => {
  return form.value.name.trim() && 
         form.value.breed.trim() && 
         form.value.photos.length > 0 &&
         form.value.location
})

const submitButtonText = computed(() => {
  return isSubmitting.value ? '创建中...' : '完成创建'
})

/**
 * 验证字段
 */
function validateField(field: 'name' | 'breed' | 'location') {
  errors[field] = ''
  
  if (field === 'name' && !form.value.name.trim()) {
    errors.name = '请输入宠物昵称'
  }
  if (field === 'breed' && !form.value.breed.trim()) {
    errors.breed = '请输入品种'
  }
  if (field === 'location' && !form.value.location) {
    errors.location = '请选择位置'
  }
}

/**
 * 验证表单
 */
function validateForm(): boolean {
  validateField('name')
  validateField('breed')
  validateField('location')
  
  if (form.value.photos.length === 0) {
    photoError.value = '请至少上传一张照片'
  } else {
    photoError.value = ''
  }
  
  return !errors.name && !errors.breed && !errors.location && !photoError.value
}

/**
 * 格式化年龄显示
 */
function formatAgeDisplay(age: number): string {
  if (age < 1) {
    return `${Math.round(age * 12)}个月`
  }
  return `${Math.floor(age)}岁${Math.round((age % 1) * 12)}个月`
}

/**
 * 处理年龄变化
 */
function handleAgeChange(e: any) {
  form.value.age = e.detail.value / 12
}

/**
 * 选择照片
 */
async function choosePhoto() {
  if (isUploading.value) return
  
  const remainingCount = 6 - form.value.photos.length
  
  uni.chooseImage({
    count: remainingCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      isUploading.value = true
      photoError.value = ''
      
      try {
        // 上传每张照片
        for (const filePath of res.tempFilePaths) {
          let photoUrl = ''
          
          // #ifdef MP-WEIXIN
          const fileName = filePath.split('/').pop() || 'photo.jpg'
          photoUrl = await petApi.uploadPhotoMP(filePath, fileName)
          // #endif
          
          // #ifdef H5
          // H5 环境需要特殊处理
          const response = await fetch(filePath)
          const blob = await response.blob()
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
          photoUrl = await petApi.uploadPhotoH5(file)
          // #endif
          
          form.value.photos.push(photoUrl)
        }
      } catch (err: any) {
        photoError.value = err.message || '上传失败'
        uni.showToast({
          title: err.message || '上传失败',
          icon: 'none',
        })
      } finally {
        isUploading.value = false
      }
    },
    fail: (err) => {
      console.error('Choose image failed:', err)
    },
  })
}

/**
 * 预览照片
 */
function previewPhoto(index: number) {
  uni.previewImage({
    current: form.value.photos[index],
    urls: form.value.photos,
  })
}

/**
 * 删除照片
 */
async function removePhoto(index: number) {
  try {
    const photoUrl = form.value.photos[index]
    await petApi.deletePhoto(photoUrl)
    form.value.photos.splice(index, 1)
    photoError.value = ''
  } catch (err: any) {
    // 即使删除失败也从本地移除
    form.value.photos.splice(index, 1)
  }
}

/**
 * 切换标签
 */
function toggleTag(field: 'personality_tags' | 'interests', tag: string) {
  const arr = form.value[field]
  const idx = arr.indexOf(tag)
  if (idx > -1) {
    arr.splice(idx, 1)
  } else if (arr.length < 5) {
    arr.push(tag)
  } else {
    uni.showToast({ title: '最多选择5个', icon: 'none' })
  }
}

/**
 * 选择位置
 */
function chooseLocation() {
  uni.chooseLocation({
    success: (res) => {
      form.value.location = res.name || res.address
      form.value.latitude = res.latitude
      form.value.longitude = res.longitude
      errors.location = ''
    },
    fail: (err) => {
      console.error('Choose location failed:', err)
      uni.showToast({
        title: '选择位置失败',
        icon: 'none',
      })
    },
  })
}

/**
 * 提交表单
 */
async function handleSubmit() {
  if (!validateForm()) {
    uni.showToast({
      title: '请完善必填信息',
      icon: 'none',
    })
    return
  }

  isSubmitting.value = true
  
  try {
    await userStore.createPetProfile({
      ...form.value,
      user_id: userStore.user?.id || '',
      is_visible: true,
    })

    uni.showToast({
      title: '创建成功',
      icon: 'success',
    })

    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 1500)
  } catch (err: any) {
    uni.showToast({
      title: err.message || '创建失败',
      icon: 'none',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.create-profile-page {
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
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 表单容器 */
.form-container {
  flex: 1;
  padding: 30rpx;
}

/* 区块 */
.section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.required {
  color: #FF6B6B;
}

/* 照片上传 */
.photo-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.photo-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
}

.photo {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.upload-btn.is-uploading {
  border-color: #FF6B6B;
}

.upload-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #FF6B6B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-icon {
  font-size: 60rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

/* 表单项 */
.form-item {
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: block;
}

.input {
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.input.is-error {
  border-color: #FF6B6B;
  background: #FFF5F5;
}

.options {
  display: flex;
  gap: 20rpx;
}

.option {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}

.option.active {
  background: #FF6B6B;
  color: #fff;
}

.age-display {
  font-size: 28rpx;
  color: #FF6B6B;
  text-align: center;
  margin-top: 16rpx;
  display: block;
}

.error-text {
  font-size: 24rpx;
  color: #FF6B6B;
  margin-top: 12rpx;
  display: block;
}

.hint-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
  display: block;
}

/* 标签 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 16rpx 32rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.tag.active {
  background: #FF6B6B;
  color: #fff;
}

/* 文本域 */
.textarea {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.char-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 12rpx;
  display: block;
}

/* 位置选择 */
.location-picker {
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.location-picker.is-error {
  border-color: #FF6B6B;
  background: #FFF5F5;
}

.location-picker.is-selected {
  background: #F0F9FF;
}

.location-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.location-text {
  font-size: 28rpx;
  color: #666;
}

/* 底部 */
.bottom-space {
  height: 140rpx;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx 40rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.submit-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
}

.submit-btn::after {
  border: none;
}

.submit-btn[disabled] {
  opacity: 0.5;
}
</style>
