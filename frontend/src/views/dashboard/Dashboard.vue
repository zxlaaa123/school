<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h2>首页数据看板</h2>
      <p>欢迎使用学校学生管理网页仿真系统</p>
    </div>

    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #e6f7ff">
              <el-icon :size="28" color="#1890ff"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">--</div>
              <div class="stat-label">学生总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #fff7e6">
              <el-icon :size="28" color="#fa8c16"><Avatar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">--</div>
              <div class="stat-label">教师总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #f6ffed">
              <el-icon :size="28" color="#52c41a"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">--</div>
              <div class="stat-label">班级总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #fff0f6">
              <el-icon :size="28" color="#eb2f96"><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">--</div>
              <div class="stat-label">课程总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>学生人数统计</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表将在后续阶段实现" :image-size="80" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>成绩分布统计</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表将在后续阶段实现" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { User, Avatar, OfficeBuilding, Reading } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-placeholder {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
