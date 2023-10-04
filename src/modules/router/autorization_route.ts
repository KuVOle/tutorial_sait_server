import express from 'express'
import AuthorizationController from '../controller/autorization_controller/autorizationController.js'

const authorizationRouter = express.Router()
// eslint-disable-next-line @typescript-eslint/no-misused-promises
authorizationRouter.post('/login', AuthorizationController.login)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
authorizationRouter.post('/registration', AuthorizationController.registration)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
authorizationRouter.get('/activate/:tokenActivate', AuthorizationController.activate)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
authorizationRouter.post('/forgot', AuthorizationController.forgotPassword)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
authorizationRouter.get('/restorePassword/:tokenRestorePassword', AuthorizationController.restorePasswordGet)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
authorizationRouter.post('/restorePassword/:tokenRestorePassword', AuthorizationController.restorePasswordPost)

export { authorizationRouter }
