import { type Request, type Response, type NextFunction } from 'express'
import homeWorkSchema from '../../model/db_home_work.js'
import userSchema from '../../model/db_user_schema.js'
import mongoose from 'mongoose'
import { ApiError } from '../../middleWare/errorMiddleWare/apiError.js'

// dont lib import start
import { getStudentList } from './teacherControllerUtils.js'
// dont lib import end

class TeacherController {
  async main(req: Request, res: Response, next: NextFunction): Promise<any> {
    const studentList = await getStudentList()
    res.json({ studentList })
  }

  async getStudentInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const studentList = await getStudentList()
    res.json({ studentList })
  }

  async createNewHomeWorks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { _id, subject, example, taskDate } = req.body
      const HomeWork = mongoose.model('homeWork', homeWorkSchema)
      const User = mongoose.model('User', userSchema)
      const homeWork = await HomeWork.create({ subject, example, taskDate })
      await User.findByIdAndUpdate(_id, { $push: { homeWorks: homeWork._id } })
      res.json({})
    } catch (err: any) {
      next(ApiError.badRequest(`cannot create new home work ${err.message}`))
    }
  }

  async setNewPrice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { _id, subject, price } = req.body
    if (_id !== undefined && subject !== undefined && price !== undefined) {
      const User = mongoose.model('user', userSchema)
      const user = await User.findById(_id)
      if (user !== null) {
        if (user?.priceArr?.find((el) => el.subject === subject) != null) {
          const res = user.priceArr.map((el) => {
            if (el.subject === subject) {
              return { subject: el.subject, price }
            }
            return el
          })
          await User.findByIdAndUpdate(_id, { priceArr: res })
        } else {
          await User.findByIdAndUpdate(_id, {
            $push: { priceArr: { subject, price } },
          })
        }
      }
    }
    res.json({})
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    console.log(req.params.userId)
    const User = mongoose.model('user', userSchema)
    const user = await User.findById(req.params.userId)
    const HomeWork = mongoose.model('homeWork', homeWorkSchema)
    try {
      HomeWork.deleteMany({ _id: { $in: user?.homeWorks } })
        .then(() => {
          console.log('delete complite')
        })
        .catch((err) => {
          console.log('cant delete homeWork')
          next(
            ApiError.internalServerError(
              `cant delete home work or user: ${err instanceof TypeError}`
            )
          )
        })
      await User.deleteOne({ _id: user?._id })
      res.json({ statusDelete: true })
    } catch (err) {
      next(
        ApiError.internalServerError(
          `cant delete home work or user: ${err instanceof TypeError}`
        )
      )
    }
  }
}

export default new TeacherController()
