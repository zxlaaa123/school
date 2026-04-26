<template>
  <div class="course-detail-page">
    <div class="page-header">
      <el-button @click="$router.push('/courses')" :icon="ArrowLeft">返回列表</el-button>
      <h2>{{ courseInfo.name || '课程详情' }}</h2>
    </div>

    <el-card shadow="never" class="info-card">
      <template #header><span>课程信息</span></template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程编号">{{ courseInfo.courseNo }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ courseInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="课程类型">
          <el-tag :type="typeTag(courseInfo.type)" size="small">{{ typeLabel(courseInfo.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="学分">{{ courseInfo.credit }}</el-descriptions-item>
        <el-descriptions-item label="任课教师">{{ courseInfo.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="所属专业">{{ courseInfo.majorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ courseInfo.grade }}级</el-descriptions-item>
        <el-descriptions-item label="学期">{{ courseInfo.semester }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="courseInfo.status==='enabled'?'success':'info'" size="small">{{ courseInfo.status==='enabled'?'启用':'停用' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ courseInfo.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header><span>关联班级</span></template>
      <el-table :data="courseInfo.classes || []" stripe>
        <el-table-column prop="name" label="班级名称" />
        <el-table-column prop="grade" label="年级" width="80" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getCourseById } from '@/api/courses'

const route = useRoute()
const courseId = parseInt(route.params.id)
const courseInfo = ref({})

const typeLabel = (v) => ({required:'必修',elective:'选修',public:'公共课',practice:'实践课'}[v]||v)
const typeTag = (v) => ({required:'',elective:'success',public:'warning',practice:'info'}[v]||'')

onMounted(async () => { try { courseInfo.value = await getCourseById(courseId) } catch (e) {} })
</script>

<style scoped>
.course-detail-page { padding: 0; }
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; margin: 0; }
.info-card { margin-bottom: 16px; }
</style>
