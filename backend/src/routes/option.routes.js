const express = require('express')
const router = express.Router()
const optionController = require('../controllers/option.controller')
const { authenticate } = require('../middlewares/auth.middleware')

router.use(authenticate)

router.get('/majors', optionController.getMajorOptions)
router.get('/teachers', optionController.getTeacherOptions)
router.get('/classes', optionController.getClassOptions)
router.get('/courses', optionController.getCourseOptions)
router.get('/students', optionController.getStudentOptions)

module.exports = router
