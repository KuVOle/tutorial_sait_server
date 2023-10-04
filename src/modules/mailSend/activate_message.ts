import sendEmail from './nodemailer.js'

interface UserInterface {
  urlFromActivate: string
  email: string
  firstName: string
}

const activateMessage = (user: UserInterface): void => {
  const { urlFromActivate, email, firstName } = user

  const message = `<h1>Добро пожаловать в приложение easyToLearn!</h1>
        <p>${firstName}, для завершения активации аккаунта перейдите по ссылке:
        https://localhost:8833/activate/${urlFromActivate}</p>`
  sendEmail(email, message).catch(err => {
    console.error(err)
  })
}

export default activateMessage
