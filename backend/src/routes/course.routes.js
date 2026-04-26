const express = require('express')
const router = express.Router()
const courseController = require('../controllers/course.controller')
const { authenticate } = require('../middlewares/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.use(authenticate)

// 查看：管理员、教师、学生
router.get('/', authorize('admin', 'teacher', 'student'), courseController.getCourses)
router.get('/:id', authorize('admin', 'teacher', 'student'), courseController.getCourseById)
router.get('/:id/classes', authorize('admin', 'teacher'), courseController.getCourseClasses)

// 管理：仅管理员
router.post('/', authorize('admin'), courseController.createCourse)
router.put('/:id', authorize('admin'), courseController.updateCourse)
router.delete('/:id', authorize('admin'), courseController.deleteCourse)
router.post('/:id/classes', authorize('admin'), courseController.assignClasses)

module.exports = router
