import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import bodyParser from 'body-parser'
import path from 'path'
import dotenv from 'dotenv'

// not library imports start
import { getDirName } from './modules/utils/utils.js'
import { connectDB } from './modules/model/db_main.js'
import { router } from './modules/router/main_router.js'
import errorMiddleware from './modules/middleWare/errorMiddleWare/errorMiddleWare.js'
// not library imports end
// important start
const app = express()
connectDB()
  .then(() => {
    console.log('db started')
  })
  .catch((err) => {
    console.error(err)
  })
// important end
// config start
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  express.static(path.join(getDirName(import.meta.url), 'modules', 'storage'))
)
app.use(
  express.static(
    path.join(getDirName(import.meta.url), 'modules', 'archivesHomeWorks')
  )
)
dotenv.config()
// config end
app.use('/', router)
// middleware start
app.use(errorMiddleware)
// middleware end
app.listen(Number(process.env.PORT), String(process.env.HOST), () => {
  console.log(`Server running at PORT:${process.env.PORT}`)
})
