import jwt from 'jsonwebtoken'
import { ApiError } from '../errorMiddleWare/apiError.js'
import dotenv from 'dotenv'
import { type NextFunction, type Request, type Response } from 'express'

// config start
dotenv.config()
// config end

const authorizationMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (req.method === 'OPTIONS') {
      next()
      return
    }

    const authorization = req.headers.authorization
    if (authorization === undefined) {
      next(ApiError.unauthorizedError('отказано в доступе'))
      return
    }
    const accessToken = authorization.split(' ')[1]
    if (accessToken === undefined) {
      next(ApiError.unauthorizedError('отказано в доступе'))
      return
    }
    const userData = jwt.verify(
      accessToken,
      String(process.env.JWT_ACCESS_SECRET)
    )
    if (userData === null) {
      next(ApiError.unauthorizedError('отказано в доступе'))
      return
    }
    req.body.user = userData
    next()
  } catch (e: any) {
    next(ApiError.unknownError(e))
  }
}
export { authorizationMiddleWare }
