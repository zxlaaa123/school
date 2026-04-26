<template>
  <div class="class-page">
    <div class="page-header">
      <h2>班级管理</h2>
      <p>维护班级信息，查看班级学生</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="名称/编号" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="searchForm.grade" placeholder="全部" clearable style="width: 100px">
            <el-option v-for="g in grades" :key="g" :label="g+'级'" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="searchForm.majorId" placeholder="全部" clearable style="width: 140px">
            <el-option v-for="m in majorOptions" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="toolbar">
      <el-button v-if="isAdmin" type="primary" @click="handleAdd">新增班级</el-button>
    </div>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="classNo" label="班级编号" width="110" />
        <el-table-column prop="name" label="班级名称" min-width="160" />
        <el-table-column prop="grade" label="年级" width="80" />
        <el-table-column prop="majorName" label="专业" min-width="150" />
        <el-table-column prop="headTeacherName" label="班主任" width="100" />
        <el-table-column prop="studentCount" label="学生人数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status==='enabled'?'success':'info'" size="small">{{ row.status==='enabled'?'启用':'停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="$router.push(`/classes/${row.id}`)">查看学生</el-button>
            <template v-if="isAdmin">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10,20,50]" :total="pagination.total"
          layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" :close-on-click-modal="false" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="班级编号" prop="classNo">
          <el-input v-model="formData.classNo" placeholder="请输入班级编号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="formData.name" placeholder="如 软件工程2301班" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="formData.grade" placeholder="请选择年级">
            <el-option v-for="g in grades" :key="g" :label="g+'级'" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="majorId">
          <el-select v-model="formData.majorId" placeholder="请选择专业">
            <el-option v-for="m in majorOptions" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任" prop="headTeacherId">
          <el-select v-model="formData.headTeacherId" placeholder="请选择班主任" clearable>
            <el-option v-for="t in teacherOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { getClassList, createClass, updateClass, deleteClass } from '@/api/classes'
import { getMajorOptions, getTeacherOptions } from '@/api/options'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.role === 'admin')
const grades = ['2021','2022','2023','2024']

const searchForm = reactive({ keyword: '', grade: '', majorId: '' })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const dialogTitle = ref('新增班级')
const isEdit = ref(false)
const editId = ref(null)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({ classNo: '', name: '', grade: '', majorId: '', headTeacherId: '', status: 'enabled', remark: '' })
const formRules = {
  classNo: [{ required: true, message: '请输入班级编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  majorId: [{ required: true, message: '请选择专业', trigger: 'change' }]
}

const majorOptions = ref([])
const teacherOptions = ref([])

const loadOptions = async () => {
  try { majorOptions.value = await getMajorOptions() } catch (e) {}
  try { teacherOptions.value = await getTeacherOptions() } catch (e) {}
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getClassList({ page: pagination.page, pageSize: pagination.pageSize, ...searchForm })
    tableData.value = data.list; pagination.total = data.pagination.total
  } catch (e) {} finally { loading.value = false }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { searchForm.keyword = ''; searchForm.grade = ''; searchForm.majorId = ''; handleSearch() }

const handleAdd = () => {
  isEdit.value = false; editId.value = null; dialogTitle.value = '新增班级'
  Object.assign(formData, { classNo: '', name: '', grade: '', majorId: '', headTeacherId: '', status: 'enabled', remark: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true; editId.value = row.id; dialogTitle.value = '编辑班级'
  Object.assign(formData, {
    classNo: row.classNo, name: row.name, grade: row.grade, majorId: row.majorId,
    headTeacherId: row.headTeacherId || '', status: row.status, remark: row.remark || ''
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除班级「${row.name}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => { await deleteClass(row.id); ElMessage.success('删除成功'); loadData() })
    .catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const payload = { ...formData, majorId: parseInt(formData.majorId), headTeacherId: formData.headTeacherId ? parseInt(formData.headTeacherId) : null }
      if (isEdit.value) { await updateClass(editId.value, payload); ElMessage.success('编辑成功') }
      else { await createClass(payload); ElMessage.success('新增成功') }
      dialogVisible.value = false; loadData()
    } catch (e) {} finally { submitLoading.value = false }
  })
}

const handleDialogClose = () => { formRef.value?.resetFields() }

onMounted(() => { loadOptions(); loadData() })
</script>

<style scoped>
.class-page { padding: 0; }
.page-header { margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; margin: 0 0 4px 0; }
.page-header p { font-size: 13px; color: #909399; margin: 0; }
.search-card { margin-bottom: 12px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.toolbar { margin-bottom: 12px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
