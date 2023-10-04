import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

import { ApiError } from '../../middleWare/errorMiddleWare/apiError.js'

import {
  checkAllFields,
  addNewUser,
  genereteJwt,
  checkEmailInDB,
  checkTokenActivated,
  activateProfile,
  sendRestorePassword,
  chengePassword,
  repeatActivateMessage,
} from './autorization_controller_util.js'
import { type Response, type Request, type NextFunction } from 'express'

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
  priceArr: any[]
}
interface interfaceRequestLogin {
  email: string
  password: string
  activateEmail: string
}

class AuthorizationController {
  // constructor() {}

  async login(
    req: Request<interfaceRequestLogin>,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { email, password, activateEmail }: interfaceRequestLogin = req.body
    const User = mongoose.model('user')
    const user: interfaceUser | null = await User.findOne({ email })

    if (user === null) {
      return res.json({ incorectData: true })
    }

    if (activateEmail !== '' && !user?.accountIsActive) {
      const repetedActivateUser = await User.findOne({ email: activateEmail })
      repeatActivateMessage(repetedActivateUser)
      // logger.info(`user: ${activateEmail} repeate activate message`)
      return res.json({})
    }

    if (!user?.accountIsActive) {
      return res.json({ noActivate: true })
    }

    if (bcrypt.compareSync(password, user.password)) {
      const jwtToken =
        'Bearer ' + genereteJwt(user._id, user.email, user.currentRole)
      await User.findByIdAndUpdate(user._id, { jwtToken })
      res.cookie('token', jwtToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        domain: 'localhost',
      })

      return res.json({ jwtToken })
    }
    return res.json({ incorectData: true })
  }

  async registration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const funcName = 'registration'
    const prepareEmail = req.body.email.trim().toLowerCase()
    if (await checkEmailInDB(prepareEmail)) {
      // logger.info(`${funcName}. User: ${prepareEmail} created previously`)
      console.log(`${funcName}. User: ${prepareEmail} created previously`)
      return res.json({ user: false })
    }
    if (await checkAllFields(req)) {
      await addNewUser(req.body)
      // logger.info(`${funcName}. User: ${prepareEmail} created`)
      console.log(`${funcName}. User: ${prepareEmail} created`)
      return res.json({ user: true })
    } else {
      // logger.info(`Error: ${funcName}. Info about user didnt passed`)
      console.log(`Error: ${funcName}. Info about user didnt passed`)
      return res.json({ user: false })
    }
  }

  async activate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | undefined> {
    const condidate = await checkTokenActivated(req.params.tokenActivate)
    if (condidate !== null) {
      await activateProfile(condidate)
      return res.json({ email: condidate.email })
    }
    next(ApiError.notFound('Pgae not found'))
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    if (!(await checkEmailInDB(req.body.email))) {
      return res.json({ email: null })
    }
    await sendRestorePassword(req.body.email)
    return res.json({ email: req.body.email })
  }

  async restorePasswordGet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | undefined> {
    const User = mongoose.model('user')
    const user = await User.findOne({
      tokenRestorePassword: req.params.tokenRestorePassword,
    })

    if (user === null) {
      next(ApiError.notFound('page not found'))
      return
    }
    return res.json({})
  }

  async restorePasswordPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | undefined> {
    // const funcName = 'restorePasswordPost'
    const User = mongoose.model('user')
    const user = await User.findOne({
      tokenRestorePassword: req.params.tokenRestorePassword,
    })

    if (user === null) {
      // logger.error(`Error: ${funcName}.` + 'didnt find user in post request')
      next(ApiError.internalServerError('server error'))
      return
    }
    if (req.body.password1 === req.body.password2) {
      try {
        await chengePassword(user, req.body.password1)
        return
        // logger.info(`user: ${user.email} changed password`)
      } catch (e) {
        // logger.error(`Error: ${  funcName}.` + e.message)
        next(ApiError.internalServerError('server error'))
        return // api error
      }
    }
    return res.json({ restore: true })
  }
}

export default new AuthorizationController()
