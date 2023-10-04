import { type NextFunction, type Request, type Response } from 'express'
import { ApiError } from '../errorMiddleWare/apiError.js'
// import mongoose from 'mongoose'

const checkStudentRoleMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.body.user.role === 'student') {
    next()
  } else {
    next(ApiError.unauthorizedError('didnt passed student role'))
  }
}

export default checkStudentRoleMiddleWare
