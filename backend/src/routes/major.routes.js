const express = require('express')
const router = express.Router()
const majorController = require('../controllers/major.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

// 所有接口需要登录
router.use(authenticate)

// 查看权限：管理员、教师、学生
router.get('/', authorize('admin', 'teacher', 'student'), majorController.getMajors)
router.get('/:id', authorize('admin', 'teacher', 'student'), majorController.getMajorById)

// 管理权限：仅管理员
router.post('/', authorize('admin'), majorController.createMajor)
router.put('/:id', authorize('admin'), majorController.updateMajor)
router.delete('/:id', authorize('admin'), majorController.deleteMajor)

module.exports = router
