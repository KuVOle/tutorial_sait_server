import dotenv from 'dotenv'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import md5 from 'md5'
import bcrypt from 'bcrypt'

// not library imports start
import userSchema from '../../model/db_user_schema.js'
import activateMessage from '../../mailSend/activate_message.js'
import restorePasswordMessage from '../../mailSend/restore_message.js'
import { type Request } from 'express'
// not library imports end
// config start
dotenv.config()
// config end

const genereteJwt = (_id: string, email: string, role: string): string =>
  jwt.sign({ _id, email, role }, String(process.env.JWT_ACCESS_SECRET), {
    expiresIn: '12h',
  })

const generatePassword = (password: string): string =>
  bcrypt.hashSync(password, 5)

const checkEmail = (email: string): boolean => {
  const variblesEmail =
    /^[-a-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-a-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*(?:aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$/
  if (variblesEmail.test(email.trim().toLowerCase())) {
    return true
  }
  return false
}

const checkFirstNameOrLastName = (name: string): boolean => {
  const currentName = name.trim()
  const variblesNameOrLastName = /^[а-яёА-ЯЁA-Za-z]+$/
  if (variblesNameOrLastName.test(currentName) && currentName.length !== 0) {
    return true
  }
  return false
}

const checkCurrentClass = (currentClass: string): boolean => {
  const variblesClass = /^([1-9]{1}|10|11)$/
  if (variblesClass.test(currentClass)) {
    return true
  }
  return false
}

const checkCurrentPhoneNumber = (phoneNumber: string): boolean => {
  const variblesPhoneNumber = /^(\+?7|8)9{1}\d{9}$/
  if (variblesPhoneNumber.test(phoneNumber.trim())) {
    return true
  }
  return false
}

const checkPassword = (password: string): boolean => {
  if (password.length > 7) {
    return true
  }
  return false
}

// const checkSelectedSubject = arrSubject => {
//   // fix it add subject schemas in db and prepare checkers
// }

const checkAllFields = async (req: Request): Promise<boolean> => {
  const {
    firstName,
    lastName,
    phone,
    email,
    password,
    currentСlass,
    // selectedSubject,
    parentEmail,
    parentName,
    parentPhone,
  } = req.body

  if (
    checkEmail(email) &&
    checkEmail(parentEmail) &&
    checkFirstNameOrLastName(firstName) &&
    checkFirstNameOrLastName(lastName) &&
    checkFirstNameOrLastName(parentName) &&
    checkCurrentClass(currentСlass) &&
    checkCurrentPhoneNumber(phone) &&
    checkCurrentPhoneNumber(parentPhone) &&
    checkPassword(password) &&
    !(await checkEmailInDB(email.trim().toLowerCase()))
  ) {
    return true
  }
  return false
}

const firstLetterToUpperCase = (word: string): string =>
  word
    .trim()
    .toLowerCase()
    .split('')
    .map((key, item) => {
      if (item === 0) {
        key = key.toUpperCase()
      }
      return key
    })
    .join('')

const preparePhone = (phone: string): string =>
  phone
    .trim()
    .split('')
    .map((key, item) => {
      if ((item === 0 && key === '8') || (item === 0 && key === '7')) {
        key = '+7'
      }
      return key
    })
    .join('')

interface interfaceDataFromDB {
  firstName: string
  lastName: string
  parentName: string
  email: string
  parentEmail: string
  phone: string
  parentPhone: string
  currentСlass: number
  selectedSubject: any[]
  password: string
  urlFromActivate: string
}

const prepareDataFromDataBase = (
  objData: interfaceDataFromDB
): interfaceDataFromDB => {
  objData.firstName = firstLetterToUpperCase(objData.firstName)
  objData.lastName = firstLetterToUpperCase(objData.lastName)
  objData.parentName = firstLetterToUpperCase(objData.parentName)
  objData.email = objData.email.trim().toLowerCase()
  objData.parentEmail = objData.parentEmail.trim().toLowerCase()
  objData.phone = preparePhone(objData.phone)
  objData.parentPhone = preparePhone(objData.parentPhone)
  objData.currentСlass = +objData.currentСlass
  //   objData.slectedSubject = objData.selectedSubject
  const password = generatePassword(objData.password)
  objData.password = password
  objData.urlFromActivate = `token-${md5(objData.email)}`

  return objData
}

const addNewUser = async (
  userInfo: interfaceDataFromDB
): Promise<interfaceDataFromDB | never> => {
  const funcName = 'addNewUser'
  const newUser = prepareDataFromDataBase(userInfo)
  try {
    const newUserDB = mongoose.model('user', userSchema)
    await newUserDB.create(newUser)
    activateMessage(newUser)
    // logger.info(`${funcName}. New user created successfully. Email: ${newUser.email}`)
    console.log(
      `${funcName}. New user created successfully. Email: ${newUser.email}`
    )
    return newUser
  } catch (err: any) {
    // logger.error(`${funcName}. Error: Cant created new user. Err: ${err}`)
    console.log(`${funcName}. Error: Cant created new user. Err: ${err}`)
    throw new Error(err)
    // add middleware error
    // return {}
  }
}

const checkEmailInDB = async (email: string): Promise<boolean> => {
  // true => find , false => not found
  const Users = mongoose.model('user', userSchema)
  const condidate = await Users.findOne({ email })

  if (condidate != null) {
    return true
  }
  return false
}

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
}

const checkTokenActivated = async (
  token: string
): Promise<interfaceUser | null> => {
  const Users = mongoose.model('user', userSchema)
  return await Users.findOne({ urlFromActivate: token })
}

const activateProfile = async (condidate: interfaceUser): Promise<void> => {
  const Users = mongoose.model('user', userSchema)
  await Users.findByIdAndUpdate(condidate._id, {
    urlFromActivate: '',
    accountIsActive: true,
  })
}

const sendRestorePassword = async (email: string): Promise<void> => {
  const User = mongoose.model('user')
  const condidate = await User.findOne({ email })
  const tokenRestorePassword =
    'tokenRestorePassword-' + md5(condidate.email + Date.now())
  await User.findByIdAndUpdate(condidate._id, { tokenRestorePassword })
  await restorePasswordMessage(condidate, tokenRestorePassword)
  //   logger.info(`user: ${condidate.email} want restorePassword`)
}

const chengePassword = async (
  user: interfaceUser,
  password1: string
): Promise<void> => {
  const User = mongoose.model('user')
  const password = generatePassword(password1)
  await User.findByIdAndUpdate(user._id, { password, tokenRestorePassword: '' })
}
interface UserInterface {
  urlFromActivate: string
  email: string
  firstName: string
}
const repeatActivateMessage = (user: UserInterface): void => {
  activateMessage(user)
}

export {
  checkAllFields,
  addNewUser,
  genereteJwt,
  checkEmailInDB,
  checkTokenActivated,
  activateProfile,
  sendRestorePassword,
  chengePassword,
  repeatActivateMessage,
  checkCurrentClass,
  checkFirstNameOrLastName,
  checkCurrentPhoneNumber,
  firstLetterToUpperCase,
  preparePhone,
}
