<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <h2>我的成绩</h2>

    <!-- 统计卡片 -->
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

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" label-width="80px" inline>
        <el-form-item label="学期">
          <el-input v-model="searchForm.semester" placeholder="学期" clearable />
        </el-form-item>
        <el-form-item label="课程">
          <el-input v-model="searchForm.keyword" placeholder="课程名称" clearable />
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

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="courseName" label="课程" min-width="150" />
        <el-table-column prop="semester" label="学期" width="120" />
        <el-table-column prop="usualScore" label="平时成绩" width="100" />
        <el-table-column prop="finalScore" label="期末成绩" width="100" />
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
import { ref, reactive, onMounted } from 'vue'
import { getScoreList, getScoreStatistics } from '@/api/scores'
import { getEnumLabel } from '@/utils/enums'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  semester: '',
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