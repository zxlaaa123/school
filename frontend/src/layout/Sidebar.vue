<template>
  <div class="sidebar">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <span v-if="!isCollapsed" class="logo-text">学生管理系统</span>
      <span v-else class="logo-text-mini">学管</span>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
    >
      <template v-for="item in filteredMenus" :key="item.path">
        <!-- 有子菜单 -->
        <el-sub-menu v-if="item.children" :index="item.path">
          <template #title>
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单 -->
        <el-menu-item v-else :index="item.path">
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled, User, Avatar, OfficeBuilding, School, Reading,
  DataAnalysis, Calendar, Trophy, Bell, Setting, UserFilled
} from '@element-plus/icons-vue'

defineProps({
  isCollapsed: { type: Boolean, default: false }
})

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

// 图标映射
const iconMap = {
  HomeFilled, User, Avatar, OfficeBuilding, School, Reading,
  DataAnalysis, Calendar, Trophy, Bell, Setting, UserFilled
}

// 完整菜单配置
const allMenus = [
  { title: '首页', path: '/dashboard', icon: HomeFilled, roles: ['admin', 'teacher', 'student'] },
  { title: '学生管理', path: '/students', icon: User, roles: ['admin', 'teacher'] },
  { title: '教师管理', path: '/teachers', icon: Avatar, roles: ['admin'] },
  { title: '专业管理', path: '/majors', icon: OfficeBuilding, roles: ['admin', 'teacher', 'student'] },
  { title: '班级管理', path: '/classes', icon: School, roles: ['admin', 'teacher'] },
  { title: '课程管理', path: '/courses', icon: Reading, roles: ['admin', 'teacher', 'student'] },
  { title: '成绩管理', path: '/scores', icon: DataAnalysis, roles: ['admin', 'teacher'] },
  { title: '我的成绩', path: '/my-scores', icon: DataAnalysis, roles: ['student'] },
  { title: '考勤管理', path: '/attendance', icon: Calendar, roles: ['admin', 'teacher'] },
  { title: '我的考勤', path: '/my-attendance', icon: Calendar, roles: ['student'] },
  { title: '奖惩管理', path: '/rewards-punishments', icon: Trophy, roles: ['admin', 'teacher'] },
  { title: '我的奖惩', path: '/my-rewards-punishments', icon: Trophy, roles: ['student'] },
  { title: '通知公告', path: '/notices', icon: Bell, roles: ['admin', 'teacher', 'student'] },
  {
    title: '系统管理', path: '/system', icon: Setting, roles: ['admin'],
    children: [
      { title: '用户管理', path: '/users', icon: UserFilled },
      { title: '操作日志', path: '/logs', icon: Reading }
    ]
  },
  { title: '个人中心', path: '/profile', icon: UserFilled, roles: ['admin', 'teacher', 'student'] }
]

// 根据角色过滤菜单
const filteredMenus = computed(() => {
  return allMenus.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userStore.role)
  })
})
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.logo-text-mini {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.el-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}
</style>
