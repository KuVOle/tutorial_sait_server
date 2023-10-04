/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import teacherController from '../controller/teacher_controller/teacherController.js'
import { authorizationMiddleWare } from '../middleWare/authorizationMiddleWare/authorizationMiddleWare.js'
import checkTeacherRoleMiddleWare from '../middleWare/authorizationMiddleWare/checkTeacherRoleMiddleWare.js'

const router = Router()

router.get(
  '/',
  authorizationMiddleWare,
  checkTeacherRoleMiddleWare,
  teacherController.main
)
router.post(
  '/createNewHomeWork',
  authorizationMiddleWare,
  checkTeacherRoleMiddleWare,
  teacherController.createNewHomeWorks
)
router.put(
  '/setNewPrice',
  authorizationMiddleWare,
  checkTeacherRoleMiddleWare,
  teacherController.setNewPrice
)

router.delete(
  '/deleteUser/:userId',
  authorizationMiddleWare,
  checkTeacherRoleMiddleWare,
  teacherController.deleteUser
)

export default router
