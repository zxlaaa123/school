<template>
  <div class="major-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>专业管理</h2>
      <p>维护学校专业基础信息</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="专业名称/编号" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-input v-model="searchForm.department" placeholder="院系名称" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <div class="toolbar">
      <el-button v-if="isAdmin" type="primary" @click="handleAdd">新增专业</el-button>
    </div>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="majorNo" label="专业编号" width="120" />
        <el-table-column prop="name" label="专业名称" min-width="150" />
        <el-table-column prop="department" label="所属院系" min-width="150" />
        <el-table-column prop="duration" label="学制" width="80">
          <template #default="{ row }">{{ row.duration }}年</template>
        </el-table-column>
        <el-table-column prop="classCount" label="班级数量" width="100" align="center" />
        <el-table-column prop="studentCount" label="学生数量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="isAdmin" label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="专业编号" prop="majorNo">
          <el-input v-model="formData.majorNo" placeholder="请输入专业编号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="专业名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-input v-model="formData.department" placeholder="请输入所属院系" />
        </el-form-item>
        <el-form-item label="学制" prop="duration">
          <el-input-number v-model="formData.duration" :min="1" :max="8" />
          <span style="margin-left: 8px; color: #909399">年</span>
        </el-form-item>
        <el-form-item label="专业简介" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入专业简介" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getMajorList, createMajor, updateMajor, deleteMajor } from '@/api/majors'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.role === 'admin')

// 搜索
const searchForm = reactive({ keyword: '', department: '', status: '' })

// 列表
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增专业')
const isEdit = ref(false)
const editId = ref(null)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  majorNo: '', name: '', department: '', duration: 4,
  description: '', status: 'enabled'
})

const formRules = {
  majorNo: [{ required: true, message: '请输入专业编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入专业名称', trigger: 'blur' }],
  department: [{ required: true, message: '请输入所属院系', trigger: 'blur' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const data = await getMajorList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    tableData.value = data.list
    pagination.total = data.pagination.total
  } catch (error) {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.department = ''
  searchForm.status = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  dialogTitle.value = '新增专业'
  formData.majorNo = ''
  formData.name = ''
  formData.department = ''
  formData.duration = 4
  formData.description = ''
  formData.status = 'enabled'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑专业'
  formData.majorNo = row.majorNo
  formData.name = row.name
  formData.department = row.department
  formData.duration = row.duration
  formData.description = row.description || ''
  formData.status = row.status
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除专业「${row.name}」吗？`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      await deleteMajor(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      // 错误已在拦截器处理
    }
  }).catch(() => {})
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await updateMajor(editId.value, { ...formData })
        ElMessage.success('编辑成功')
      } else {
        await createMajor({ ...formData })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      // 错误已在拦截器处理
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.major-page {
  padding: 0;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 4px 0;
}

.page-header p {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.search-card {
  margin-bottom: 12px;
}

.search-card :deep(.el-card__body) {
  padding-bottom: 0;
}

.toolbar {
  margin-bottom: 12px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
