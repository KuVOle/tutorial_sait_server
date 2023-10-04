import { type NextFunction, type Request, type Response } from 'express'
import { ApiError } from '../errorMiddleWare/apiError.js'

const checkTeacherRoleMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.body.user.role === 'teacher') {
    next()
  } else {
    next(ApiError.unauthorizedError('didnt passed teacher role'))
  }
}

export default checkTeacherRoleMiddleWare
