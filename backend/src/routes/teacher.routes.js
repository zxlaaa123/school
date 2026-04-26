const express = require('express')
const router = express.Router()
const teacherController = require('../controllers/teacher.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

// 所有接口需要登录，仅管理员可访问
router.use(authenticate)
router.use(authorize('admin'))

router.get('/', teacherController.getTeachers)
router.get('/:id', teacherController.getTeacherById)
router.post('/', teacherController.createTeacher)
router.put('/:id', teacherController.updateTeacher)
router.delete('/:id', teacherController.deleteTeacher)

module.exports = router
