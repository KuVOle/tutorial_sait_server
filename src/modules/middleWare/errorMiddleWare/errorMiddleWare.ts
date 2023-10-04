import { ApiError } from './apiError.js'
import { type NextFunction, type Request, type Response } from 'express'
import type HttpException from './httpExpection.js'

const errorMiddleWare = (err: HttpException, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ApiError) {
    console.error(err.status)
    res.status(err.status).json({
      status: err.status,
      message: err.message
    })
  } else {
    console.error(err.status)
    res.status(500).json({
      status: 500,
      message: 'Undefined Error'
    })
  }
}

export default errorMiddleWare
