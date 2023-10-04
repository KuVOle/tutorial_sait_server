import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userSchema from './db_user_schema.js'
import homeWorkSchema from './db_home_work.js'
//   config start
dotenv.config()
//   config end
const connectDB = async (): Promise<void> => {
  await mongoose.connect(
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_COLLECTION}`
  )
  mongoose.model('user', userSchema)
  mongoose.model('homeWork', homeWorkSchema)
}

export { connectDB }
