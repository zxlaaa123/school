<template>
  <div class="course-page">
    <div class="page-header"><h2>课程管理</h2><p>维护课程信息，分配任课教师和班级</p></div>

    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词"><el-input v-model="searchForm.keyword" placeholder="名称/编号" clearable @clear="handleSearch" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width:110px">
            <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="教师">
          <el-select v-model="searchForm.teacherId" placeholder="全部" clearable style="width:140px">
            <el-option v-for="t in teacherOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期"><el-input v-model="searchForm.semester" placeholder="学期" clearable @clear="handleSearch" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">查询</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </el-card>

    <div class="toolbar"><el-button v-if="isAdmin" type="primary" @click="handleAdd">新增课程</el-button></div>

    <el-card shadow="never">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="courseNo" label="编号" width="90" />
        <el-table-column prop="name" label="课程名称" min-width="140" />
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }"><el-tag :type="typeTag(row.type)" size="small">{{ typeLabel(row.type) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="credit" label="学分" width="70" align="center" />
        <el-table-column prop="teacherName" label="任课教师" width="90" />
        <el-table-column prop="majorName" label="专业" width="120" />
        <el-table-column prop="grade" label="年级" width="70" />
        <el-table-column prop="semester" label="学期" min-width="160" />
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="{ row }"><el-tag :type="row.status==='enabled'?'success':'info'" size="small">{{ row.status==='enabled'?'启用':'停用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="$router.push(`/courses/${row.id}`)">详情</el-button>
            <template v-if="isAdmin">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="warning" size="small" @click="handleAssign(row)">分配班级</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :page-sizes="[10,20,50]" :total="pagination.total" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="580px" :close-on-click-modal="false" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="课程编号" prop="courseNo"><el-input v-model="formData.courseNo" :disabled="isEdit" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="课程名称" prop="name"><el-input v-model="formData.name" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="课程类型" prop="type"><el-select v-model="formData.type"><el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="学分" prop="credit"><el-input-number v-model="formData.credit" :min="0" :max="10" :step="0.5" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="任课教师" prop="teacherId"><el-select v-model="formData.teacherId"><el-option v-for="t in teacherOptions" :key="t.value" :label="t.label" :value="t.value" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="所属专业" prop="majorId"><el-select v-model="formData.majorId" clearable><el-option v-for="m in majorOptions" :key="m.value" :label="m.label" :value="m.value" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="年级" prop="grade"><el-select v-model="formData.grade"><el-option v-for="g in grades" :key="g" :label="g+'级'" :value="g" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="学期" prop="semester"><el-input v-model="formData.semester" placeholder="如 2024-2025第二学期" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="状态" prop="status"><el-radio-group v-model="formData.status"><el-radio value="enabled">启用</el-radio><el-radio value="disabled">停用</el-radio></el-radio-group></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button></template>
    </el-dialog>

    <!-- 分配班级弹窗 -->
    <el-dialog v-model="assignVisible" title="分配班级" width="500px">
      <el-checkbox-group v-model="selectedClassIds">
        <div v-for="c in classOptions" :key="c.value" style="margin-bottom:8px">
          <el-checkbox :value="c.value">{{ c.label }}</el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer><el-button @click="assignVisible=false">取消</el-button><el-button type="primary" :loading="assignLoading" @click="doAssign">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getCourseList, getCourseById, createCourse, updateCourse, deleteCourse, assignClasses, getCourseClasses } from '@/api/courses'
import { getMajorOptions, getTeacherOptions, getClassOptions } from '@/api/options'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.role === 'admin')
const grades = ['2021','2022','2023','2024']
const typeOptions = [{label:'必修',value:'required'},{label:'选修',value:'elective'},{label:'公共课',value:'public'},{label:'实践课',value:'practice'}]
const typeLabel = (v) => ({required:'必修',elective:'选修',public:'公共课',practice:'实践课'}[v]||v)
const typeTag = (v) => ({required:'',elective:'success',public:'warning',practice:'info'}[v]||'')

const searchForm = reactive({ keyword:'', type:'', teacherId:'', semester:'' })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ page:1, pageSize:10, total:0 })

const majorOptions = ref([])
const teacherOptions = ref([])
const classOptions = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增课程')
const isEdit = ref(false)
const editId = ref(null)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({ courseNo:'', name:'', type:'required', credit:3, teacherId:'', majorId:'', grade:'', semester:'', status:'enabled', remark:'' })
const formRules = {
  courseNo: [{ required: true, message: '请输入课程编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  semester: [{ required: true, message: '请输入学期', trigger: 'blur' }]
}

// 分配班级
const assignVisible = ref(false)
const assignCourseId = ref(null)
const assignLoading = ref(false)
const selectedClassIds = ref([])

const loadOptions = async () => {
  try { majorOptions.value = await getMajorOptions() } catch (e) {}
  try { teacherOptions.value = await getTeacherOptions() } catch (e) {}
  try { classOptions.value = await getClassOptions() } catch (e) {}
}

const loadData = async () => {
  loading.value = true
  try { const d = await getCourseList({ page:pagination.page, pageSize:pagination.pageSize, ...searchForm }); tableData.value = d.list; pagination.total = d.pagination.total } catch (e) {} finally { loading.value = false }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(searchForm, { keyword:'', type:'', teacherId:'', semester:'' }); handleSearch() }

const handleAdd = () => {
  isEdit.value = false; editId.value = null; dialogTitle.value = '新增课程'
  Object.assign(formData, { courseNo:'', name:'', type:'required', credit:3, teacherId:'', majorId:'', grade:'', semester:'', status:'enabled', remark:'' })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true; editId.value = row.id; dialogTitle.value = '编辑课程'
  try {
    const d = await getCourseById(row.id)
    Object.assign(formData, { courseNo:d.courseNo, name:d.name, type:d.type, credit:d.credit, teacherId:d.teacherId, majorId:d.majorId||'', grade:d.grade, semester:d.semester, status:d.status, remark:d.remark||'' })
    dialogVisible.value = true
  } catch (e) {}
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除课程「${row.name}」吗？`, '删除确认', { type: 'warning' })
    .then(async () => { await deleteCourse(row.id); ElMessage.success('删除成功'); loadData() }).catch(() => {})
}

const handleAssign = async (row) => {
  assignCourseId.value = row.id; selectedClassIds.value = []
  try { const classes = await getCourseClasses(row.id); selectedClassIds.value = classes.map(c => c.id) } catch (e) {}
  assignVisible.value = true
}

const doAssign = async () => {
  assignLoading.value = true
  try { await assignClasses(assignCourseId.value, selectedClassIds.value); ElMessage.success('分配成功'); assignVisible.value = false; loadData() } catch (e) {} finally { assignLoading.value = false }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const p = { ...formData, teacherId:parseInt(formData.teacherId), majorId:formData.majorId?parseInt(formData.majorId):null, credit:Number(formData.credit) }
      if (isEdit.value) { await updateCourse(editId.value, p); ElMessage.success('编辑成功') }
      else { await createCourse(p); ElMessage.success('新增成功') }
      dialogVisible.value = false; loadData()
    } catch (e) {} finally { submitLoading.value = false }
  })
}

const handleDialogClose = () => { formRef.value?.resetFields() }

onMounted(() => { loadOptions(); loadData() })
</script>

<style scoped>
.course-page { padding: 0; }
.page-header { margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; margin: 0 0 4px 0; }
.page-header p { font-size: 13px; color: #909399; margin: 0; }
.search-card { margin-bottom: 12px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.toolbar { margin-bottom: 12px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
