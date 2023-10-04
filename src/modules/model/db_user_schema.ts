import { Schema } from 'mongoose'

const userSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  email: { type: String },
  password: { type: String },
  currentСlass: { type: Number, min: 1, max: 11 },

  selectedSubject: { type: Array, default: [] },

  parentEmail: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },

  dateRegistartion: { type: Date, default: Date.now },
  accountIsActive: { type: Boolean, default: false },
  urlFromActivate: { type: String, default: '' },
  currentRole: { type: String, default: 'student' },

  jwtToken: { type: String, default: '' },
  tokenRestorePassword: { type: String, default: '' },

  homeWorks: { type: Array, default: [] },
  priceArr: { type: Array, default: [] },
})

export default userSchema
