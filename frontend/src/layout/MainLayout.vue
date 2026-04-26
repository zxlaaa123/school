<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="layout-aside">
      <Sidebar :is-collapsed="isCollapsed" />
    </el-aside>

    <!-- 右侧区域 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="layout-header" height="56px">
        <HeaderBar @toggle="toggleSidebar" />
      </el-header>

      <!-- 内容区域 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import HeaderBar from './HeaderBar.vue'

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
  min-height: calc(100vh - 56px);
}
</style>
