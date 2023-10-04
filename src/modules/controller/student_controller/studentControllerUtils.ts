import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import { promisify } from 'util'
import fs from 'fs'
import convert from 'heic-convert'
import AdmZip from 'adm-zip'
import { getDirName } from '../../utils/utils.js'
import mongoose from 'mongoose'

// dont lib import start
import {
  checkCurrentClass,
  checkFirstNameOrLastName,
  checkCurrentPhoneNumber,
  firstLetterToUpperCase,
  preparePhone,
} from '../autorization_controller/autorization_controller_util.js'
import userSchema from '../../model/db_user_schema.js'
// dont lib import end

const filePathDir = path.join(getDirName(import.meta.url), '../../', 'storage')

const checkImage = (imageFormat: string | null): boolean => {
  if (imageFormat == null) {
    return false
  }
  switch (imageFormat.slice(imageFormat.lastIndexOf('.') + 1).toLowerCase()) {
    case 'jpg':
    case 'heic':
    case 'png':
    case 'jpeg':
      return true
    default:
      return false
  }
}
const findFormatPicture = (fileName: string | null): string | null => {
  if (fileName === null) {
    return null
  }
  if (fileName?.lastIndexOf('.') !== -1) {
    return fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()
  }

  return null
}
const fileArray = (files: any): any => {
  const paths = []
  for (const file of files) {
    const formatFile = findFormatPicture(file.name)
    if (checkImage(formatFile)) {
      paths.push(file)
    }
  }
  return paths
}

const promisisFromSaveFile = (allFiles: any): any =>
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  allFiles.map((file: any, numberFile: any): Promise<any> => {
    return new Promise((resolve) => {
      const formatFile = findFormatPicture(file.name)
      file.mv(`${filePathDir}/${numberFile}.${formatFile}`, (err: any) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (err) {
          console.error(err)
        }
        resolve(`${filePathDir}/${numberFile}.${formatFile}`)
      })
    })
  })

const convertHeicPitureInJpg = async (filePath: string): Promise<any> => {
  const inputBuffer = await promisify(fs.readFile)(filePath)
  const outputBuffer = await convert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'JPEG', // output format
    quality: 1, // the jpeg compression quality, between 0 and 1
  })
  await promisify(fs.writeFile)(
    `${filePath.replace('.heic', '.jpg')}`,
    String(outputBuffer)
  )
  fs.unlink(filePath, (err) => {
    if (err !== null) console.error(`cant delited file ${filePath}`)
  })
  return `${filePath.replace('.heic', '.jpg')}`
}

const promisisFromConvert = (filesPaths: any[string]): any => {
  return Promise.all(
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    filesPaths.map((el: string) => {
      if (el.includes('.heic')) {
        return new Promise((resolve) => {
          const newPath = convertHeicPitureInJpg(el)
          resolve(newPath)
        })
      }
      return new Promise((resolve) => {
        resolve(el)
      })
    })
  )
}

const promisCompress = async (res: any): Promise<any> => {
  return await new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip()
      const outputFile = `${uuidv4()}.zip`
      zip.addLocalFolder(filePathDir)
      zip.writeZip(outputFile)
      res.forEach((el: string) => {
        fs.unlink(el, (err) => {
          if (err !== null) {
            console.error(err)
            // logger.error(`cannot compress ${res}.${e}`)
            // reject(err)
          }
        })
      })
      resolve(outputFile)
    } catch (err) {
      //   logger.error(`cannot compress ${res}.${e}`)
      console.log(err)
      // reject(e)
    }
  })
}

interface InterfaceUserChengeInfo {
  firstName: string | null
  lastName: string | null
  phone: string | null
  parentName: string | null
  parentPhone: string | null
  currentClass: number | null
}
function filterUserInfo(obj: any): object {
  const result: any = {}
  for (const key in obj) {
    console.log('key', obj[key])
    if (obj[key] !== null) {
      result[key] = obj[key]
    }
  }
  return result
}
const checkAndPrepareFieldsFromChengeStudentInfo = (
  user: InterfaceUserChengeInfo
): object => {
  const tmpUser: InterfaceUserChengeInfo = {
    firstName: null,
    lastName: null,
    phone: null,
    parentName: null,
    parentPhone: null,
    currentClass: null,
  }
  if (user.firstName !== null && checkFirstNameOrLastName(user.firstName))
    tmpUser.firstName = firstLetterToUpperCase(user.firstName)
  if (user.lastName !== null && checkFirstNameOrLastName(user.lastName))
    tmpUser.lastName = firstLetterToUpperCase(user.lastName)
  if (user.parentName !== null && checkFirstNameOrLastName(user.parentName))
    tmpUser.parentName = firstLetterToUpperCase(user.parentName)
  if (user.phone !== null && checkCurrentPhoneNumber(user.phone))
    tmpUser.phone = preparePhone(user.phone)
  if (user.parentPhone !== null && checkCurrentPhoneNumber(user.parentPhone))
    tmpUser.parentPhone = preparePhone(user.parentPhone)
  if (
    user.currentClass !== null &&
    checkCurrentClass(user?.currentClass?.toString())
  )
    tmpUser.currentClass = +user.currentClass

  return filterUserInfo(tmpUser)
}
const chengeStudentProfile = async (
  userInfo: any,
  _id: string
): Promise<object> => {
  const User = mongoose.model('user', userSchema)
  const user = await User.findById(_id)
  if (user !== null) {
    await User.findByIdAndUpdate(_id, userInfo)
  }
  return {}
}

const readZipArchive = async (filePath: string): Promise<any> => {
  try {
    const zip = new AdmZip(filePath)

    for (const zipEntry of zip.getEntries()) {
      console.log(zipEntry.name)
    }
  } catch (e: any) {
    console.log(`Something went wrong. ${e}`)
  }
}

export {
  checkAndPrepareFieldsFromChengeStudentInfo,
  chengeStudentProfile,
  fileArray,
  promisisFromSaveFile,
  promisisFromConvert,
  promisCompress,
  readZipArchive,
}
