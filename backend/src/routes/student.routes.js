const express = require('express')
const router = express.Router()
const studentController = require('../controllers/student.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(authenticate)

// 查看：管理员、教师
router.get('/', authorize('admin', 'teacher'), studentController.getStudents)
router.get('/:id', authorize('admin', 'teacher'), studentController.getStudentById)

// 管理：仅管理员
router.post('/', authorize('admin'), studentController.createStudent)
router.put('/:id', authorize('admin'), studentController.updateStudent)
router.delete('/:id', authorize('admin'), studentController.deleteStudent)

module.exports = router
