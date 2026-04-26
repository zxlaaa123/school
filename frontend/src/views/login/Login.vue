<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>学校学生管理网页仿真系统</h1>
        <p>本地运行 / 毕设演示系统</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="demo-accounts">
        <h3>演示账号</h3>
        <el-table :data="demoAccounts" size="small" stripe>
          <el-table-column prop="role" label="角色" width="80" />
          <el-table-column prop="username" label="账号" width="120" />
          <el-table-column prop="password" label="密码" width="100" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { login as loginApi } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const demoAccounts = [
  { role: '管理员', username: 'admin', password: '123456' },
  { role: '教师', username: 'teacher001', password: '123456' },
  { role: '学生', username: 'student001', password: '123456' }
]

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const data = await loginApi({
        username: loginForm.username,
        password: loginForm.password
      })

      // 保存 token 和用户信息
      userStore.setToken(data.token)
      userStore.setUserInfo(data.user)

      ElMessage.success('登录成功')
      router.push('/dashboard')
    } catch (error) {
      // 错误信息已在 request.js 拦截器中统一提示
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 440px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 22px;
  color: #303133;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
}

.demo-accounts {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.demo-accounts h3 {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px 0;
  text-align: center;
}
</style>
