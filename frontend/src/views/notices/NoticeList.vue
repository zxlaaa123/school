<template>
  <div class="notice-list-page">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" label-width="80px" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索标题/内容"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="searchForm.category"
            placeholder="请选择分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" v-if="isAdmin">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="置顶">
          <el-select
            v-model="searchForm.isTop"
            placeholder="是否置顶"
            clearable
            style="width: 100px"
          >
            <el-option label="是" value="true" />
            <el-option label="否" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <div class="table-title">公告列表</div>
        <el-button
          v-if="isAdmin"
          type="primary"
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>发布公告
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="noticeList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.isTop" class="top-badge">[置顶]</span>
            {{ row.title }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览" width="80" align="center" />
        <el-table-column prop="publisherName" label="发布人" width="120" align="center" />
        <el-table-column prop="publishedAt" label="发布时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.publishedAt ? formatDate(row.publishedAt) : '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleView(row)"
            >
              <el-icon><View /></el-icon>查看
            </el-button>
            <el-button
              v-if="isAdmin"
              type="warning"
              link
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button
              v-if="isAdmin"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="formData.isTop" />
        </el-form-item>
        <el-form-item label="发布时间" v-if="formData.status === 'published'">
          <el-date-picker
            v-model="formData.publishedAt"
            type="datetime"
            placeholder="选择发布时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="formData.expiredAt"
            type="datetime"
            placeholder="选择过期时间（可选）"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情已通过独立页面实现 -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import { getNoticeList, getNoticeDetail, createNotice, updateNotice, deleteNotice } from '@/api/notices'
import { useUserStore } from '@/stores/user'
import { getEnumLabel } from '@/utils/enums'

const userStore = useUserStore()
const router = useRouter()

// 是否管理员
const isAdmin = computed(() => userStore.role === 'admin')

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
  isTop: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 加载状态
const loading = ref(false)

// 公告列表
const noticeList = ref([])

// 枚举选项
const categoryOptions = [
  { label: '教务通知', value: 'academic' },
  { label: '考试通知', value: 'exam' },
  { label: '活动通知', value: 'activity' },
  { label: '系统通知', value: 'system' }
]

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已过期', value: 'expired' }
]

// 获取枚举标签
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

// 格式化日期
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

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchNoticeList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.status = ''
  searchForm.isTop = ''
  handleSearch()
}

// 获取公告列表
const fetchNoticeList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const res = await getNoticeList(params)
    noticeList.value = res.data.list
    pagination.total = res.data.pagination.total
  } catch (error) {
    console.error('获取公告列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => (formData.id ? '编辑公告' : '发布公告'))
const formRef = ref(null)

const formData = reactive({
  id: null,
  title: '',
  content: '',
  category: 'system',
  status: 'draft',
  isTop: false,
  publishedAt: null,
  expiredAt: null
})

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  try {
    const res = await getNoticeDetail(row.id)
    const notice = res.data
    resetForm()
    Object.assign(formData, {
      id: notice.id,
      title: notice.title,
      content: notice.content || '',
      category: notice.category,
      status: notice.status,
      isTop: notice.isTop,
      publishedAt: notice.publishedAt,
      expiredAt: notice.expiredAt
    })
    dialogVisible.value = true
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败')
  }
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.title = ''
  formData.content = ''
  formData.category = 'system'
  formData.status = 'draft'
  formData.isTop = false
  formData.publishedAt = null
  formData.expiredAt = null
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (formData.id) {
        await updateNotice(formData.id, formData)
        ElMessage.success('修改成功')
      } else {
        await createNotice(formData)
        ElMessage.success('发布成功')
      }
      dialogVisible.value = false
      fetchNoticeList()
    } catch (error) {
      console.error('保存失败:', error)
    }
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除公告"${row.title}"吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteNotice(row.id)
      ElMessage.success('删除成功')
      fetchNoticeList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 查看详情：跳转到详情页
const handleView = (row) => {
  router.push(`/notices/${row.id}`)
}

onMounted(() => {
  fetchNoticeList()
})
</script>

<style scoped>
.notice-list-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  min-height: calc(100vh - 200px);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.top-badge {
  color: #f56c6c;
  font-weight: bold;
  margin-right: 4px;
}

.notice-detail h2 {
  margin: 0 0 16px 0;
  font-size: 22px;
  line-height: 1.4;
}

.notice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #666;
  font-size: 13px;
  align-items: center;
}

.meta-item {
  margin-left: 8px;
}

.top-tag {
  color: #f56c6c;
  font-weight: bold;
  margin-left: 8px;
}

.notice-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>