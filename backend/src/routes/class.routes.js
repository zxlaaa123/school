const express = require('express')
const router = express.Router()
const classController = require('../controllers/class.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(authenticate)

// 查看权限：管理员、教师
router.get('/', authorize('admin', 'teacher'), classController.getClasses)
router.get('/:id', authorize('admin', 'teacher'), classController.getClassById)
router.get('/:id/students', authorize('admin', 'teacher'), classController.getClassStudents)

// 管理权限：仅管理员
router.post('/', authorize('admin'), classController.createClass)
router.put('/:id', authorize('admin'), classController.updateClass)
router.delete('/:id', authorize('admin'), classController.deleteClass)

module.exports = router
