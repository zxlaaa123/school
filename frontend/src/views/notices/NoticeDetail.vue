<template>
  <div class="notice-detail-page">
    <el-card v-loading="loading" shadow="never">
      <div v-if="notice" class="notice-content-wrapper">
        <!-- 返回按钮 -->
        <div class="back-bar">
          <el-button @click="goBack" type="primary" link>
            <el-icon><ArrowLeft /></el-icon>返回公告列表
          </el-button>
        </div>

        <!-- 标题 -->
        <h1 class="notice-title">
          <span v-if="notice.isTop" class="top-badge">[置顶]</span>
          {{ notice.title }}
        </h1>

        <!-- 元信息 -->
        <div class="notice-meta">
          <el-tag :type="getCategoryTagType(notice.category)" size="small">
            {{ getCategoryLabel(notice.category) }}
          </el-tag>
          <el-tag :type="getStatusTagType(notice.status)" size="small">
            {{ getStatusLabel(notice.status) }}
          </el-tag>
          <span class="meta-item">
            <el-icon><User /></el-icon>
            {{ notice.publisherName }}
          </span>
          <span class="meta-item">
            <el-icon><Clock /></el-icon>
            {{ formatDate(notice.publishedAt) }}
          </span>
          <span class="meta-item">
            <el-icon><View /></el-icon>
            {{ notice.viewCount }} 次浏览
          </span>
        </div>

        <el-divider />

        <!-- 内容 -->
        <div class="notice-body">
          {{ notice.content }}
        </div>

        <!-- 过期时间 -->
        <div v-if="notice.expiredAt" class="expire-info">
          <el-icon><Timer /></el-icon>
          过期时间：{{ formatDate(notice.expiredAt) }}
        </div>
      </div>

      <el-empty v-else-if="!loading" description="公告不存在或无权限查看" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, User, Clock, View, Timer } from '@element-plus/icons-vue'
import { getNoticeDetail } from '@/api/notices'
import { getEnumLabel } from '@/utils/enums'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const notice = ref(null)

const getCategoryLabel = (val) => getEnumLabel(val)
const getStatusLabel = (val) => getEnumLabel(val)

const getCategoryTagType = (category) => {
  const types = {
    academic: 'primary',
    exam: 'warning',
    activity: 'success',
    system: 'info'
  }
  return types[category] || ''
}

const getStatusTagType = (status) => {
  const types = {
    draft: 'info',
    published: 'success',
    expired: 'danger'
  }
  return types[status] || ''
}

const formatDate = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.push('/notices')
}

const fetchNotice = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await getNoticeDetail(id)
    notice.value = res.data
  } catch (error) {
    console.error('获取公告详情失败:', error)
    notice.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNotice()
})
</script>

<style scoped>
.notice-detail-page {
  padding: 20px;
}

.back-bar {
  margin-bottom: 16px;
}

.notice-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  line-height: 1.4;
  color: #303133;
}

.top-badge {
  color: #f56c6c;
  font-weight: bold;
}

.notice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #666;
  font-size: 14px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notice-body {
  font-size: 16px;
  line-height: 2;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 16px 0;
}

.expire-info {
  margin-top: 24px;
  padding: 12px 16px;
  background: #fdf6ec;
  border-radius: 4px;
  color: #e6a23c;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>