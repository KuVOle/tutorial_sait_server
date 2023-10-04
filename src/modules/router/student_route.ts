/* eslint-disable @typescript-eslint/no-misused-promises */
// /* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import studentController from '../controller/student_controller/studentController.js'
import { authorizationMiddleWare } from '../middleWare/authorizationMiddleWare/authorizationMiddleWare.js'
import checkStudentRoleMiddleWare from '../middleWare/authorizationMiddleWare/checkStudentRoleMiddleWare.js'

const router = Router()

router.get(
  '/',
  authorizationMiddleWare,
  checkStudentRoleMiddleWare,
  studentController.main
)

router.post(
  '/sendHomeWork',
  authorizationMiddleWare,
  studentController.sendHomeWork
)
router.get(
  '/getProfile',
  authorizationMiddleWare,
  studentController.ProfileInfo
)
router.put(
  '/putSudentProfile',
  authorizationMiddleWare,
  checkStudentRoleMiddleWare,
  studentController.chengeStudentProfile
)

router.get(
  '/getHomeWork/:id',
  authorizationMiddleWare,
  checkStudentRoleMiddleWare,
  studentController.getHomeWork
)

export default router
