<template>
  <div class="page-container">
    <!-- 页面标题和统计卡片 -->
    <div class="page-header">
      <h2>成绩管理</h2>
      <div class="stat-cards">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">平均分</span>
            <span class="stat-value">{{ statistics.average || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">最高分</span>
            <span class="stat-value">{{ statistics.max || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">最低分</span>
            <span class="stat-value">{{ statistics.min || 0 }}</span>
          </div>
        </el-card>
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <span class="stat-label">及格率</span>
            <span class="stat-value">{{ statistics.passRate || 0 }}%</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" label-width="80px" inline>
        <el-form-item label="学期">
          <el-input v-model="searchForm.semester" placeholder="学期" clearable />
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="searchForm.courseId" placeholder="选择课程" clearable>
            <el-option
              v-for="course in courseOptions"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="选择班级" clearable>
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
        <el-form-item label="等级">
          <el-select v-model="searchForm.level" placeholder="选择等级" clearable>
            <el-option label="优秀" value="excellent" />
            <el-option label="良好" value="good" />
            <el-option label="中等" value="medium" />
            <el-option label="及格" value="pass" />
            <el-option label="不及格" value="fail" />
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
        新增成绩
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
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="courseName" label="课程" width="150" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column label="平时成绩" width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.usualScore"
              :min="0"
              :max="100"
              size="small"
              controls-position="right"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="期末成绩" width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.finalScore"
              :min="0"
              :max="100"
              size="small"
              controls-position="right"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总评" width="90" />
        <el-table-column prop="level" label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">
              {{ getLevelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recorderName" label="录入教师" width="100" />
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
        <el-form-item label="学期" prop="semester">
          <el-input v-model="formData.semester" placeholder="如：2023-2024-1" />
        </el-form-item>
        <el-form-item label="平时成绩" prop="usualScore">
          <el-input-number
            v-model="formData.usualScore"
            :min="0"
            :max="100"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="期末成绩" prop="finalScore">
          <el-input-number
            v-model="formData.finalScore"
            :min="0"
            :max="100"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总评成绩">
          <el-input-number :model-value="calculatedTotal" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="成绩等级">
          <el-tag :type="getLevelTagType(calculatedLevel)">{{ getLevelLabel(calculatedLevel) }}</el-tag>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getScoreList, getScoreDetail, createScore, updateScore, deleteScore, getScoreStatistics } from '@/api/scores'
import { getMajorOptions, getClassOptions, getCourseOptions, getStudentOptions } from '@/api/options'
import { useUserStore } from '@/stores/user'
import { getEnumLabel, SCORE_LEVEL_OPTIONS } from '@/utils/enums'

const userStore = useUserStore()
const userRole = computed(() => userStore.role)

const loading = ref(false)
const tableData = ref([])
const courseOptions = ref([])
const classOptions = ref([])
const studentOptions = ref([])

const searchForm = reactive({
  semester: '',
  courseId: '',
  classId: '',
  keyword: '',
  level: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const statistics = reactive({
  average: 0,
  max: 0,
  min: 0,
  passRate: 0,
  count: 0,
  levelDistribution: {}
})

const dialogVisible = ref(false)
const dialogTitle = computed(() => (isEdit.value ? '编辑成绩' : '新增成绩'))
const formRef = ref(null)
const isEdit = ref(false)
const currentId = ref(null)

const formData = reactive({
  studentId: '',
  courseId: '',
  semester: '',
  usualScore: 0,
  finalScore: 0,
  remark: ''
})

const formRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  semester: [{ required: true, message: '请输入学期', trigger: 'blur' }],
  usualScore: [{ required: true, message: '请输入平时成绩', trigger: 'blur' }],
  finalScore: [{ required: true, message: '请输入期末成绩', trigger: 'blur' }]
}

const hasPermission = computed(() => userRole.value === 'admin' || userRole.value === 'teacher')

const calculatedTotal = computed(() => {
  const usual = Number(formData.usualScore) || 0
  const final = Number(formData.finalScore) || 0
  return Number((usual * 0.4 + final * 0.6).toFixed(1))
})

const calculatedLevel = computed(() => {
  const total = calculatedTotal.value
  if (total >= 90) return 'excellent'
  if (total >= 80) return 'good'
  if (total >= 70) return 'medium'
  if (total >= 60) return 'pass'
  return 'fail'
})

function getLevelLabel(level) {
  return getEnumLabel(level)
}

function getLevelTagType(level) {
  const map = {
    excellent: 'success',
    good: 'warning',
    medium: '',
    pass: '',
    fail: 'danger'
  }
  return map[level] || ''
}

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
    const res = await getScoreList(params)
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
    const res = await getScoreStatistics(params)
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
    semester: '',
    usualScore: 0,
    finalScore: 0,
    remark: ''
  })
  dialogVisible.value = true
}

async function handleEdit(row) {
  isEdit.value = true
  currentId.value = row.id
  const res = await getScoreDetail(row.id)
  Object.assign(formData, {
    studentId: res.studentId,
    courseId: res.courseId,
    semester: res.semester,
    usualScore: res.usualScore,
    finalScore: res.finalScore,
    remark: res.remark || ''
  })
  dialogVisible.value = true
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这条成绩记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteScore(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

function handleScoreChange(row) {
  // 实时计算并显示总评和等级（前端提示）
  const total = Number((row.usualScore * 0.4 + row.finalScore * 0.6).toFixed(1))
  const level = getLevelLabel(total)
  ElMessage.info(`总评：${total}，等级：${level}`)
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (isEdit.value) {
        await updateScore(currentId.value, formData)
        ElMessage.success('修改成功')
      } else {
        await createScore(formData)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      console.error('保存失败:', error)
    }
  })
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
  min-width: 150px;
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