<template>
  <div class="student-page">
    <div class="page-header">
      <h2>学生管理</h2>
      <p>管理学生基础信息</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="学号/姓名" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="searchForm.grade" placeholder="全部" clearable style="width:100px">
            <el-option v-for="g in grades" :key="g" :label="g+'级'" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="searchForm.majorId" placeholder="全部" clearable style="width:140px">
            <el-option v-for="m in majorOptions" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="全部" clearable style="width:160px">
            <el-option v-for="c in classOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width:100px">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="toolbar">
      <el-button v-if="isAdmin" type="primary" @click="handleAdd">新增学生</el-button>
    </div>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="studentNo" label="学号" width="140" />
        <el-table-column prop="name" label="姓名" width="80" />
        <el-table-column prop="gender" label="性别" width="60" align="center">
          <template #default="{ row }">{{ row.gender==='male'?'男':'女' }}</template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="70" />
        <el-table-column prop="majorName" label="专业" min-width="140" />
        <el-table-column prop="className" label="班级" min-width="150" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="status" label="学籍状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentDate" label="入学日期" width="110">
          <template #default="{ row }">{{ row.enrollmentDate?.split('T')[0] }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDetail(row)">详情</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNo">
              <el-input v-model="formData.studentNo" placeholder="请输入学号" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender"><el-radio value="male">男</el-radio><el-radio value="female">女</el-radio></el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker v-model="formData.birthDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-select v-model="formData.grade" placeholder="请选择">
                <el-option v-for="g in grades" :key="g" :label="g+'级'" :value="g" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="majorId">
              <el-select v-model="formData.majorId" placeholder="请选择" @change="onMajorChange">
                <el-option v-for="m in majorOptions" :key="m.value" :label="m.label" :value="m.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="班级" prop="classId">
              <el-select v-model="formData.classId" placeholder="请选择">
                <el-option v-for="c in filteredClassOptions" :key="c.value" :label="c.label" :value="c.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入家庭地址" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="入学日期" prop="enrollmentDate">
              <el-date-picker v-model="formData.enrollmentDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学籍状态" prop="status">
              <el-select v-model="formData.status">
                <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="学生详情" size="500px">
      <template v-if="detailData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="学号">{{ detailData.studentNo }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ detailData.gender==='male'?'男':'女' }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ detailData.birthDate?.split('T')[0] || '-' }}</el-descriptions-item>
          <el-descriptions-item label="年级">{{ detailData.grade }}级</el-descriptions-item>
          <el-descriptions-item label="专业">{{ detailData.majorName }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ detailData.className }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ detailData.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ detailData.address || '-' }}</el-descriptions-item>
          <el-descriptions-item label="入学日期">{{ detailData.enrollmentDate?.split('T')[0] || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学籍状态">
            <el-tag :type="statusType(detailData.status)" size="small">{{ statusLabel(detailData.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ detailData.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getStudentList, getStudentById, createStudent, updateStudent, deleteStudent } from '@/api/students'
import { getMajorOptions } from '@/api/options'
import { getClassOptions } from '@/api/options'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.role === 'admin')
const grades = ['2021','2022','2023','2024']
const statusOptions = [
  { label: '在读', value: 'studying' }, { label: '休学', value: 'suspended' },
  { label: '退学', value: 'withdrawn' }, { label: '毕业', value: 'graduated' }
]
const statusLabel = (s) => ({ studying:'在读',suspended:'休学',withdrawn:'退学',graduated:'毕业' }[s]||s)
const statusType = (s) => ({ studying:'success',suspended:'warning',withdrawn:'danger',graduated:'info' }[s]||'info')

const searchForm = reactive({ keyword:'', grade:'', majorId:'', classId:'', status:'' })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ page:1, pageSize:10, total:0 })

const majorOptions = ref([])
const classOptions = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增学生')
const isEdit = ref(false)
const editId = ref(null)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  studentNo:'', name:'', gender:'male', birthDate:'', grade:'', majorId:'',
  classId:'', phone:'', address:'', enrollmentDate:'', status:'studying', remark:''
})
const formRules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  majorId: [{ required: true, message: '请选择专业', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }]
}

// 根据所选专业过滤班级
const filteredClassOptions = computed(() => {
  if (!formData.majorId) return classOptions.value
  return classOptions.value.filter(c => {
    // 需要从后端获取按专业筛选的班级，这里用本地过滤作为备用
    return true
  })
})

const onMajorChange = async () => {
  formData.classId = ''
  if (formData.majorId) {
    try { classOptions.value = await getClassOptions({ majorId: formData.majorId }) } catch (e) {}
  }
}

// 详情抽屉
const drawerVisible = ref(false)
const detailData = ref(null)

const loadOptions = async () => {
  try { majorOptions.value = await getMajorOptions() } catch (e) {}
  try { classOptions.value = await getClassOptions() } catch (e) {}
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getStudentList({ page:pagination.page, pageSize:pagination.pageSize, ...searchForm })
    tableData.value = data.list; pagination.total = data.pagination.total
  } catch (e) {} finally { loading.value = false }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(searchForm, { keyword:'',grade:'',majorId:'',classId:'',status:'' }); handleSearch() }

const handleAdd = () => {
  isEdit.value = false; editId.value = null; dialogTitle.value = '新增学生'
  Object.assign(formData, { studentNo:'',name:'',gender:'male',birthDate:'',grade:'',majorId:'',classId:'',phone:'',address:'',enrollmentDate:'',status:'studying',remark:'' })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true; editId.value = row.id; dialogTitle.value = '编辑学生'
  try {
    const d = await getStudentById(row.id)
    Object.assign(formData, {
      studentNo: d.studentNo, name: d.name, gender: d.gender,
      birthDate: d.birthDate?.split('T')[0] || '',
      grade: d.grade, majorId: d.majorId, classId: d.classId,
      phone: d.phone||'', address: d.address||'',
      enrollmentDate: d.enrollmentDate?.split('T')[0] || '',
      status: d.status, remark: d.remark||''
    })
    if (d.majorId) { try { classOptions.value = await getClassOptions({ majorId: d.majorId }) } catch (e) {} }
    dialogVisible.value = true
  } catch (e) {}
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除学生「${row.name}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => { await deleteStudent(row.id); ElMessage.success('删除成功'); loadData() })
    .catch(() => {})
}

const handleDetail = async (row) => {
  try { detailData.value = await getStudentById(row.id); drawerVisible.value = true } catch (e) {}
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const payload = { ...formData, majorId: parseInt(formData.majorId), classId: parseInt(formData.classId) }
      if (isEdit.value) { await updateStudent(editId.value, payload); ElMessage.success('编辑成功') }
      else { await createStudent(payload); ElMessage.success('新增成功') }
      dialogVisible.value = false; loadData()
    } catch (e) {} finally { submitLoading.value = false }
  })
}

const handleDialogClose = () => { formRef.value?.resetFields() }

onMounted(() => { loadOptions(); loadData() })
</script>

<style scoped>
.student-page { padding: 0; }
.page-header { margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; margin: 0 0 4px 0; }
.page-header p { font-size: 13px; color: #909399; margin: 0; }
.search-card { margin-bottom: 12px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.toolbar { margin-bottom: 12px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
