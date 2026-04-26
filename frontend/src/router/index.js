import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '首页', roles: ['admin', 'teacher', 'student'] }
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/students/StudentList.vue'),
        meta: { title: '学生管理', roles: ['admin', 'teacher'] }
      },
      {
        path: 'teachers',
        name: 'Teachers',
        component: () => import('@/views/teachers/TeacherList.vue'),
        meta: { title: '教师管理', roles: ['admin'] }
      },
      {
        path: 'majors',
        name: 'Majors',
        component: () => import('@/views/majors/MajorList.vue'),
        meta: { title: '专业管理', roles: ['admin', 'teacher', 'student'] }
      },
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('@/views/classes/ClassList.vue'),
        meta: { title: '班级管理', roles: ['admin', 'teacher'] }
      },
      {
        path: 'classes/:id',
        name: 'ClassDetail',
        component: () => import('@/views/classes/ClassDetail.vue'),
        meta: { title: '班级详情', roles: ['admin', 'teacher'] }
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('@/views/courses/CourseList.vue'),
        meta: { title: '课程管理', roles: ['admin', 'teacher', 'student'] }
      },
      {
        path: 'courses/:id',
        name: 'CourseDetail',
        component: () => import('@/views/courses/CourseDetail.vue'),
        meta: { title: '课程详情', roles: ['admin', 'teacher', 'student'] }
      },
      {
        path: 'scores',
        name: 'Scores',
        component: () => import('@/views/scores/ScoreList.vue'),
        meta: { title: '成绩管理', roles: ['admin', 'teacher'] }
      },
      {
        path: 'my-scores',
        name: 'MyScores',
        component: () => import('@/views/scores/MyScores.vue'),
        meta: { title: '我的成绩', roles: ['student'] }
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/views/attendance/AttendanceList.vue'),
        meta: { title: '考勤管理', roles: ['admin', 'teacher'] }
      },
      {
        path: 'my-attendance',
        name: 'MyAttendance',
        component: () => import('@/views/attendance/MyAttendance.vue'),
        meta: { title: '我的考勤', roles: ['student'] }
      },
      {
        path: 'rewards-punishments',
        name: 'RewardsPunishments',
        component: () => import('@/views/rewardsPunishments/RewardPunishmentList.vue'),
        meta: { title: '奖惩管理', roles: ['admin', 'teacher'] }
      },
      {
        path: 'my-rewards-punishments',
        name: 'MyRewardsPunishments',
        component: () => import('@/views/rewardsPunishments/MyRewardPunishment.vue'),
        meta: { title: '我的奖惩', roles: ['student'] }
      },
      {
        path: 'notices',
        name: 'Notices',
        component: () => import('@/views/notices/NoticeList.vue'),
        meta: { title: '通知公告', roles: ['admin', 'teacher', 'student'] }
      },
      {
        path: 'notices/:id',
        name: 'NoticeDetail',
        component: () => import('@/views/notices/NoticeDetail.vue'),
        meta: { title: '公告详情', roles: ['admin', 'teacher', 'student'] }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserList.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/Profile.vue'),
        meta: { title: '个人中心', roles: ['admin', 'teacher', 'student'] }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/logs/OperationLogList.vue'),
        meta: { title: '操作日志', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/Forbidden.vue'),
    meta: { title: '无权限' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 学生管理系统` : '学生管理系统'

  const userStore = useUserStore()

  // 不需要认证的页面直接放行
  if (to.meta.requiresAuth === false) {
    // 已登录用户访问登录页，跳转到首页
    if (to.path === '/login' && userStore.isLoggedIn) {
      return next('/dashboard')
    }
    return next()
  }

  // 需要认证但未登录
  if (!userStore.isLoggedIn) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 检查角色权限
  if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    return next('/403')
  }

  next()
})

export default router
