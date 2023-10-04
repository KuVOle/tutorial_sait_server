import mongoose from 'mongoose'
import homeWorkSchema from '../../model/db_home_work.js'
import { getDirName } from '../../utils/utils.js'
import path from 'path'
// const logger = require('../../logs/logger')
import { ApiError } from '../../middleWare/errorMiddleWare/apiError.js'
import { type Request, type Response, type NextFunction } from 'express'
import {
  checkAndPrepareFieldsFromChengeStudentInfo,
  chengeStudentProfile,
  fileArray,
  promisisFromSaveFile,
  promisisFromConvert,
  promisCompress,
} from './studentControllerUtils.js'

interface interfaceUser {
  _id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
  currentСlass: number
  selectedSubject: any[]
  parentEmail: string
  parentName: string
  parentPhone: string
  dateRegistartion: Date
  accountIsActive: boolean
  urlFromActivate: string
  currentRole: string
  jwtToken: string
  tokenRestorePassword: string
  role: string
  homeWorks: any[]
}

class StudentController {
  async main(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | any> {
    const User = mongoose.model('user')
    const user = await User.findById(req.body.user._id)
    if (user !== null) {
      const HomeWorks = mongoose.model('homeWorks', homeWorkSchema)
      const notHeldClasses: any = (
        await HomeWorks.find({
          _id: { $in: user.homeWorks },
        })
      ).filter((el) => !el.carriedOut)

      const serverResult = {
        user: { firstName: user.firstName, lastName: user.lastName },
        notHeldClasses,
      }
      return res.json(serverResult)
    }
    next(ApiError.badRequest('user didnt find'))
  }

  async sendHomeWork(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    console.log('sendHomeWork')
    if (Object.keys({ ...req.files }).length <= 0) {
      next(ApiError.badRequest('No files in sendHomeWork'))
      return
    }
    req.files[Symbol.iterator] = function () {
      const properties = Object.keys(this)
      let count = 0
      return {
        next() {
          if (count < properties.length) {
            const key = properties[count]
            const res = { done: false, value: req.files[key] }
            count++
            return res
          } else {
            return { done: true }
          }
        },
      }
    }
    const { comment, _id } = req.body
    console.log(req.body)
    const HomeWorks = mongoose.model('HomeWorks', homeWorkSchema)
    const fileArrayTMP = fileArray(req.files)
    await Promise.all(promisisFromSaveFile(fileArrayTMP))
      .then((filePaths) => promisisFromConvert(filePaths))
      .then(async (res) => await promisCompress(res))
      .then(async (file) => {
        await HomeWorks.findByIdAndUpdate(_id, {
          archiveName: file,
          done: true,
          comment,
        })
        console.log(file)
      })
      .catch((err) => {
        console.log(err)
        return res.json({ statusSendHomeWork: false })
      })
    return res.json({ statusSendHomeWork: true })
  }

  async ProfileInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const User = mongoose.model('user')
    const user: interfaceUser | null = await User.findById(req.body.user._id)
    if (user !== null)
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        currentСlass: user.currentСlass,
        selectedSubject: user.selectedSubject,
        parentName: user.parentName,
        parentPhone: user.parentPhone,
        currentRole: user.currentRole,
      })
    else {
      console.error('didnt find user info')
      next(ApiError.notFound('didnt find user info'))
    }
  }

  async chengeStudentProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    console.log(req.body)
    try {
      const infoWhatChenge = checkAndPrepareFieldsFromChengeStudentInfo(
        req.body
      )
      await chengeStudentProfile(infoWhatChenge, req.body.user._id)
      res.json({ status: true })
    } catch (err) {
      next(ApiError.badRequest('Error after chenge Profile'))
    }
  }

  async getHomeWork(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const HomeWorks = mongoose.model('homeWorks', homeWorkSchema)
    try {
      console.log('send file')
      const homeWork = await HomeWorks.findById(req.params.id)
      if (homeWork?.archiveName !== null) {
        console.log(
          path.join(
            getDirName(import.meta.url) +
              '/../../archivesHomeWorks/' +
              homeWork?.archiveName
          )
        )
        res.sendFile(
          path.join(
            getDirName(import.meta.url) +
              '/../../archivesHomeWorks/' +
              homeWork?.archiveName
          )
        )
        return res.json({})
      }
      throw new Error('didnt find homeWorks')
    } catch (err) {
      next(ApiError.internalServerError('cant return homeWorks'))
    }
  }
}

export default new StudentController()
