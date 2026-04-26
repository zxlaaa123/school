<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <h2>我的考勤</h2>

    <!-- 统计卡片 -->
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
          <el-input v-model="searchForm.keyword" placeholder="课程名称" clearable />
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
        <el-table-column prop="courseName" label="课程" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recorderName" label="记录人" width="100" />
        <el-table-column prop="remark" label="备注" min-width="120" />
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
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { getAttendanceList, getAttendanceStatistics } from '@/api/attendance'
import { getEnumLabel } from '@/utils/enums'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  keyword: '',
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

async function loadData() {
  loading.value = true
  try {
    const params = { ...searchForm, page: pagination.page, pageSize: pagination.pageSize }
    const res = await getAttendanceList(params)
    tableData.value = res.list || []
    pagination.total = res.pagination?.total || 0

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
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-container h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
}

.stat-cards {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
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