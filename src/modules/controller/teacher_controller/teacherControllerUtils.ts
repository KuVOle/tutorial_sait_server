import mongoose from 'mongoose'
import userSchema from '../../model/db_user_schema.js'

const getStudentList = async (): Promise<any> => {
  const Users = mongoose.model('users', userSchema)
  const studentList = await Users.find({ currentRole: 'student' })
  return studentList
}

export { getStudentList }
