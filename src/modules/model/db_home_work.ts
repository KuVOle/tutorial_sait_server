import { Schema } from 'mongoose'

const homeWorkSchema = new Schema({
  subject: { type: String },
  example: { type: String },
  taskDate: { type: Date },
  done: { type: Boolean, default: false },
  carriedOut: { type: Boolean, default: false },
  archiveName: { type: String },
  comment: { type: String, default: '' },
  grade: { type: String },
})

export default homeWorkSchema
