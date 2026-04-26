const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 路由
const authRoutes = require('./routes/auth.routes')
const majorRoutes = require('./routes/major.routes')
const teacherRoutes = require('./routes/teacher.routes')
const classRoutes = require('./routes/class.routes')
const studentRoutes = require('./routes/student.routes')
const courseRoutes = require('./routes/course.routes')
const optionRoutes = require('./routes/option.routes')
const scoreRoutes = require('./routes/score.routes')
const attendanceRoutes = require('./routes/attendance.routes')
const noticeRoutes = require('./routes/notice.routes')

// 健康检查接口（无需认证）
app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务正常',
    data: {
      status: 'ok',
      time: new Date().toISOString()
    }
  })
})

// 认证路由
app.use('/api/auth', authRoutes)

// 业务路由
app.use('/api/majors', majorRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/options', optionRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/notices', noticeRoutes)

// 启动服务
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
