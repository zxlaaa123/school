const express = require('express')
const router = express.Router()
const attendanceController = require('../controllers/attendance.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(authenticate)

// 考勤统计
router.get('/statistics', authorize('admin', 'teacher', 'student'), attendanceController.getAttendanceStatistics)

// 查看：管理员、教师、学生（学生只能看个人）
router.get('/', authorize('admin', 'teacher', 'student'), attendanceController.getAttendance)
router.get('/:id', authorize('admin', 'teacher', 'student'), attendanceController.getAttendanceById)

// 新增/编辑：管理员、教师（教师只能管理自己课程）
router.post('/', authorize('admin', 'teacher'), attendanceController.createAttendance)
router.post('/batch', authorize('admin', 'teacher'), attendanceController.batchCreateAttendance)
router.put('/:id', authorize('admin', 'teacher'), attendanceController.updateAttendance)

// 删除：仅管理员
router.delete('/:id', authorize('admin'), attendanceController.deleteAttendance)

module.exports = router