/**
 * 宠物资料编辑页
 */
<template>
  <view class="edit-profile-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      
      <text class="nav-title">编辑资料</text>
      
      <view class="nav-right" @click="handleSave">
        <text class="save-btn">保存</text>
      </view>
    </view>

    <!-- 编辑表单 -->
    <scroll-view scroll-y class="form-container">
      <!-- 照片上传 -->
      <view class="section">
        <text class="section-title">宠物照片</text>
        
        <view class="photo-upload">
          <view 
            v-for="(photo, index) in form.photos" 
            :key="index"
            class="photo-item"
          >
            <image :src="photo" mode="aspectFill" class="photo" />
            
            <view class="delete-btn" @click="removePhoto(index)">
              <text>×</text>
            </view>
          </view>
          
          <view 
            v-if="form.photos.length < 6"
            class="upload-btn"
            @click="choosePhoto"
          >
            <text class="upload-icon">+</text>
            <text class="upload-text">{{ form.photos.length }}/6</text>
          </view>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="section">
        <text class="section-title">基本信息</text>
        
        <view class="form-item">
          <text class="label">宠物昵称</text>
          <input 
            v-model="form.name"
            class="input"
            placeholder="给宠物起个可爱的名字"
            maxlength="20"
          />
        </view>

        <view class="form-item">
          <text class="label">品种</text>
          <input 
            v-model="form.breed"
            class="input"
            placeholder="例如：金毛、布偶猫"
            maxlength="20"
          />
        </view>

        <view class="form-item">
          <text class="label">个性签名</text>
          <textarea 
            v-model="form.bio"
            class="textarea"
            placeholder="介绍一下你的宠物..."
            maxlength="200"
          />
          <text class="char-count">{{ form.bio.length }}/200</text>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import type { PetProfile } from '@/types'

const userStore = useUserStore()

const petId = ref('')
const form = ref<Partial<PetProfile>>({
  name: '',
  breed: '',
  bio: '',
  photos: [],
})

onLoad((options) => {
  petId.value = options?.id || ''
  
  // 加载现有数据
  if (userStore.petProfile) {
    form.value = { ...userStore.petProfile }
  }
})

/**
 * 选择照片
 */
function choosePhoto() {
  const remainingCount = 6 - (form.value.photos?.length || 0)
  
  uni.chooseImage({
    count: remainingCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.photos = [...(form.value.photos || []), ...res.tempFilePaths]
    },
  })
}

/**
 * 删除照片
 */
function removePhoto(index: number) {
  form.value.photos?.splice(index, 1)
}

/**
 * 保存
 */
async function handleSave() {
  if (!form.value.name?.trim()) {
    uni.showToast({ title: '请输入宠物昵称', icon: 'none' })
    return
  }

  try {
    await userStore.updatePetProfile(petId.value, form.value)
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err: any) {
    uni.showToast({ title: err.message || '保存失败', icon: 'none' })
  }
}

/**
 * 返回
 */
function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.edit-profile-page {
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
  justify-content: space-between;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
}

.nav-left {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 48rpx;
  color: #333;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.save-btn {
  font-size: 28rpx;
  color: #FF6B6B;
  font-weight: 500;
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
}

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

.bottom-space {
  height: 40rpx;
}
</style>
