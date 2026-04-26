<template>
  <div class="class-detail-page">
    <div class="page-header">
      <el-button @click="$router.push('/classes')" :icon="ArrowLeft">返回列表</el-button>
      <h2>{{ classInfo.name || '班级详情' }}</h2>
    </div>

    <!-- 班级基本信息 -->
    <el-card shadow="never" class="info-card">
      <template #header><span>班级信息</span></template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="班级编号">{{ classInfo.classNo }}</el-descriptions-item>
        <el-descriptions-item label="班级名称">{{ classInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ classInfo.grade }}级</el-descriptions-item>
        <el-descriptions-item label="所属专业">{{ classInfo.majorName }}</el-descriptions-item>
        <el-descriptions-item label="院系">{{ classInfo.majorDepartment }}</el-descriptions-item>
        <el-descriptions-item label="班主任">{{ classInfo.headTeacherName || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="学生人数">{{ classInfo.studentCount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="classInfo.status==='enabled'?'success':'info'" size="small">{{ classInfo.status==='enabled'?'启用':'停用' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 学生列表 -->
    <el-card shadow="never" class="student-card">
      <template #header>
        <div class="card-header">
          <span>班级学生（共 {{ studentPagination.total }} 人）</span>
          <el-input v-model="studentKeyword" placeholder="学号/姓名搜索" clearable style="width: 220px" @clear="loadStudents" @keyup.enter="loadStudents">
            <template #append><el-button @click="loadStudents"><el-icon><Search /></el-icon></el-button></template>
          </el-input>
        </div>
      </template>
      <el-table :data="studentList" v-loading="studentLoading" stripe>
        <el-table-column prop="studentNo" label="学号" width="140" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="70" align="center">
          <template #default="{ row }">{{ row.gender==='male'?'男':row.gender==='female'?'女':'未知' }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="status" label="学籍状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentDate" label="入学日期" width="120">
          <template #default="{ row }">{{ row.enrollmentDate?.split('T')[0] }}</template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="studentPagination.page" v-model:page-size="studentPagination.pageSize"
          :page-sizes="[10,20,50]" :total="studentPagination.total"
          layout="total, sizes, prev, pager, next" @size-change="loadStudents" @current-change="loadStudents"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { getClassById, getClassStudents } from '@/api/classes'

const route = useRoute()
const classId = parseInt(route.params.id)

const classInfo = ref({})
const studentList = ref([])
const studentLoading = ref(false)
const studentKeyword = ref('')
const studentPagination = reactive({ page: 1, pageSize: 10, total: 0 })

const statusLabel = (s) => ({ studying: '在读', suspended: '休学', withdrawn: '退学', graduated: '毕业' }[s] || s)
const statusType = (s) => ({ studying: 'success', suspended: 'warning', withdrawn: 'danger', graduated: 'info' }[s] || 'info')

const loadClassInfo = async () => {
  try { classInfo.value = await getClassById(classId) } catch (e) {}
}

const loadStudents = async () => {
  studentLoading.value = true
  try {
    const data = await getClassStudents(classId, { page: studentPagination.page, pageSize: studentPagination.pageSize, keyword: studentKeyword.value })
    studentList.value = data.list; studentPagination.total = data.pagination.total
  } catch (e) {} finally { studentLoading.value = false }
}

onMounted(() => { loadClassInfo(); loadStudents() })
</script>

<style scoped>
.class-detail-page { padding: 0; }
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; margin: 0; }
.info-card { margin-bottom: 16px; }
.student-card { margin-bottom: 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
