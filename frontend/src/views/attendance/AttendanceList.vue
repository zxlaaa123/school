<template>
  <div class="page-container">
    <!-- 页面标题和统计卡片 -->
    <div class="page-header">
      <h2>考勤管理</h2>
      <div class="stat-cards">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">总考勤数</span>
            <span class="stat-value">{{ statistics.total || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">正常</span>
            <span class="stat-value" style="color: #67c23a">{{ statistics.normal || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">迟到</span>
            <span class="stat-value" style="color: #e6a23c">{{ statistics.late || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">早退</span>
            <span class="stat-value" style="color: #e6a23c">{{ statistics.leaveEarly || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">请假</span>
            <span class="stat-value" style="color: #909399">{{ statistics.leave || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">缺勤</span>
            <span class="stat-value" style="color: #f56c6c">{{ statistics.absent || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">正常率</span>
            <span class="stat-value" style="color: #409eff">{{ statistics.normalRate || 0 }}%</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" label-width="80px" inline>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="searchForm.courseId" placeholder="选择课程" clearable filterable>
            <el-option
              v-for="course in courseOptions"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="选择班级" clearable filterable>
            <el-option
              v-for="cls in classOptions"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学生">
          <el-input v-model="searchForm.keyword" placeholder="学号/姓名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="迟到" value="late" />
            <el-option label="早退" value="leave_early" />
            <el-option label="请假" value="leave" />
            <el-option label="缺勤" value="absent" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd" v-if="hasPermission">
        <el-icon><Plus /></el-icon>
        新增考勤
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="attendanceDate" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.attendanceDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="courseName" label="课程" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recorderName" label="记录人" width="100" />
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)" v-if="hasPermission">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)" v-if="hasPermission && userRole === 'admin'">
              删除
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
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
        <el-form-item label="学生" prop="studentId">
          <el-select
            v-model="formData.studentId"
            placeholder="选择学生"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="student in studentOptions"
              :key="student.id"
              :label="`${student.studentNo} - ${student.name} (${student.className})`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select
            v-model="formData.courseId"
            placeholder="选择课程"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="course in courseOptions"
              :key="course.id"
              :label="`${course.courseNo} - ${course.name}`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="attendanceDate">
          <el-date-picker
            v-model="formData.attendanceDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="选择状态" style="width: 100%">
            <el-option label="正常" value="normal" />
            <el-option label="迟到" value="late" />
            <el-option label="早退" value="leave_early" />
            <el-option label="请假" value="leave" />
            <el-option label="缺勤" value="absent" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAttendanceList, getAttendanceDetail, createAttendance, updateAttendance, deleteAttendance, getAttendanceStatistics } from '@/api/attendance'
import { getClassOptions, getCourseOptions, getStudentOptions } from '@/api/options'
import { useUserStore } from '@/stores/user'
import { getEnumLabel } from '@/utils/enums'

const userStore = useUserStore()
const userRole = computed(() => userStore.role)

const loading = ref(false)
const tableData = ref([])
const courseOptions = ref([])
const classOptions = ref([])
const studentOptions = ref([])

const searchForm = reactive({
  studentId: '',
  courseId: '',
  classId: '',
  status: '',
  startDate: '',
  endDate: ''
})

const dateRange = ref([])
watch(dateRange, (val) => {
  if (val && val.length === 2) {
    searchForm.startDate = val[0]
    searchForm.endDate = val[1]
  } else {
    searchForm.startDate = ''
    searchForm.endDate = ''
  }
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statistics = reactive({
  total: 0,
  normal: 0,
  late: 0,
  leaveEarly: 0,
  leave: 0,
  absent: 0,
  normalRate: 0,
  abnormalRate: 0
})

const dialogVisible = ref(false)
const dialogTitle = computed(() => (isEdit.value ? '编辑考勤' : '新增考勤'))
const formRef = ref(null)
const isEdit = ref(false)
const currentId = ref(null)

const formData = reactive({
  studentId: '',
  courseId: '',
  attendanceDate: '',
  status: 'normal',
  remark: ''
})

const formRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  attendanceDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const hasPermission = computed(() => userRole.value === 'admin' || userRole.value === 'teacher')

async function loadOptions() {
  try {
    const [courses, classes, students] = await Promise.all([
      getCourseOptions(),
      getClassOptions(),
      getStudentOptions()
    ])
    courseOptions.value = courses || []
    classOptions.value = classes || []
    studentOptions.value = students || []
  } catch (error) {
    console.error('加载选项失败:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    const params = { ...searchForm, page: pagination.page, pageSize: pagination.pageSize }
    const res = await getAttendanceList(params)
    tableData.value = res.list || []
    pagination.total = res.pagination?.total || 0

    // 加载统计
    await loadStatistics()
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadStatistics() {
  try {
    const params = { ...searchForm }
    const res = await getAttendanceStatistics(params)
    Object.assign(statistics, res)
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  Object.keys(searchForm).forEach(key => searchForm[key] = '')
  dateRange.value = []
  pagination.page = 1
  loadData()
}

function handleSizeChange() {
  pagination.page = 1
  loadData()
}

function handleCurrentChange() {
  loadData()
}

function handleAdd() {
  isEdit.value = false
  currentId.value = null
  Object.assign(formData, {
    studentId: '',
    courseId: '',
    attendanceDate: '',
    status: 'normal',
    remark: ''
  })
  dialogVisible.value = true
}

async function handleEdit(row) {
  isEdit.value = true
  currentId.value = row.id
  const res = await getAttendanceDetail(row.id)
  Object.assign(formData, {
    studentId: res.studentId,
    courseId: res.courseId,
    attendanceDate: res.attendanceDate ? res.attendanceDate.split('T')[0] : '',
    status: res.status,
    remark: res.remark || ''
  })
  dialogVisible.value = true
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这条考勤记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAttendance(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

function handleSubmit() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return

    try {
      if (isEdit.value) {
        await updateAttendance(currentId.value, formData)
        ElMessage.success('修改成功')
      } else {
        await createAttendance(formData)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      console.error('保存失败:', error)
    }
  })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.split('T')[0]
}

function getStatusLabel(status) {
  return getEnumLabel(status)
}

function getStatusTagType(status) {
  const map = {
    normal: 'success',
    late: 'warning',
    leave_early: 'warning',
    leave: 'info',
    absent: 'danger'
  }
  return map[status] || ''
}

onMounted(() => {
  loadOptions()
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
}

.stat-cards {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.stat-card {
  min-width: 120px;
  flex: 1;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.search-card {
  margin-bottom: 15px;
}

.table-card {
  margin-top: 15px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>