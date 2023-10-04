import express from 'express'
// not library imports start
import { authorizationRouter } from './autorization_route.js'
import studentRoute from './student_route.js'
import teacherRoute from './teacher_route.js'
// not library imports end
const router = express.Router()

router.use('/authorization', authorizationRouter)
router.use('/mainStudent', studentRoute)
router.use('/teacher', teacherRoute)

export { router }
