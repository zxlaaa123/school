<template>
  <div class="teacher-page">
    <div class="page-header">
      <h2>教师管理</h2>
      <p>维护学校教师基础信息</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="姓名/编号" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="所属院系">
          <el-input v-model="searchForm.department" placeholder="院系名称" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="职称">
          <el-select v-model="searchForm.title" placeholder="全部" clearable style="width: 110px">
            <el-option label="助教" value="助教" />
            <el-option label="讲师" value="讲师" />
            <el-option label="副教授" value="副教授" />
            <el-option label="教授" value="教授" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任">
          <el-select v-model="searchForm.isHeadTeacher" placeholder="全部" clearable style="width: 100px">
            <el-option label="是" value="true" />
            <el-option label="否" value="false" />
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
      <el-button type="primary" @click="handleAdd">新增教师</el-button>
    </div>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="teacherNo" label="教师编号" width="110" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="70" align="center">
          <template #default="{ row }">{{ row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '未知' }}</template>
        </el-table-column>
        <el-table-column prop="department" label="所属院系" min-width="150" />
        <el-table-column prop="title" label="职称" width="90" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="isHeadTeacher" label="班主任" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isHeadTeacher ? 'success' : 'info'" size="small">
              {{ row.isHeadTeacher ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" :close-on-click-modal="false" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="教师编号" prop="teacherNo">
          <el-input v-model="formData.teacherNo" placeholder="请输入教师编号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio value="male">男</el-radio>
            <el-radio value="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-input v-model="formData.department" placeholder="请输入所属院系" />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="formData.title" placeholder="请选择职称" clearable>
            <el-option label="助教" value="助教" />
            <el-option label="讲师" value="讲师" />
            <el-option label="副教授" value="副教授" />
            <el-option label="教授" value="教授" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="班主任" prop="isHeadTeacher">
          <el-switch v-model="formData.isHeadTeacher" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeacherList, createTeacher, updateTeacher, deleteTeacher } from '@/api/teachers'

// 搜索
const searchForm = reactive({ keyword: '', department: '', title: '', isHeadTeacher: '' })

// 列表
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增教师')
const isEdit = ref(false)
const editId = ref(null)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  teacherNo: '', name: '', gender: 'male', department: '',
  title: '', phone: '', email: '', isHeadTeacher: false, remark: ''
})

const formRules = {
  teacherNo: [{ required: true, message: '请输入教师编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请输入所属院系', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getTeacherList({ page: pagination.page, pageSize: pagination.pageSize, ...searchForm })
    tableData.value = data.list
    pagination.total = data.pagination.total
  } catch (error) { /* 拦截器已处理 */ } finally { loading.value = false }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => {
  searchForm.keyword = ''; searchForm.department = ''; searchForm.title = ''; searchForm.isHeadTeacher = ''
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false; editId.value = null; dialogTitle.value = '新增教师'
  Object.assign(formData, { teacherNo: '', name: '', gender: 'male', department: '', title: '', phone: '', email: '', isHeadTeacher: false, remark: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true; editId.value = row.id; dialogTitle.value = '编辑教师'
  Object.assign(formData, {
    teacherNo: row.teacherNo, name: row.name, gender: row.gender, department: row.department,
    title: row.title || '', phone: row.phone || '', email: row.email || '',
    isHeadTeacher: row.isHeadTeacher, remark: row.remark || ''
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除教师「${row.name}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => { await deleteTeacher(row.id); ElMessage.success('删除成功'); loadData() })
    .catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) { await updateTeacher(editId.value, { ...formData }); ElMessage.success('编辑成功') }
      else { await createTeacher({ ...formData }); ElMessage.success('新增成功') }
      dialogVisible.value = false; loadData()
    } catch (error) { /* 拦截器已处理 */ } finally { submitLoading.value = false }
  })
}

const handleDialogClose = () => { formRef.value?.resetFields() }

onMounted(() => { loadData() })
</script>

<style scoped>
.teacher-page { padding: 0; }
.page-header { margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; margin: 0 0 4px 0; }
.page-header p { font-size: 13px; color: #909399; margin: 0; }
.search-card { margin-bottom: 12px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.toolbar { margin-bottom: 12px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
