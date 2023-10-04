import sendEmail from './nodemailer.js'

interface RestoreUserInterface {
  email: string
  firstName: string
}

const restorePasswordMessage = async (user: RestoreUserInterface, tokenRestorePassword: string): Promise<void> => {
  const { email, firstName } = user

  const message = `<h1>Восстановление пароля для приложения easyToLearn!</h1>
        <p>${firstName}, для изменения пароля перейдите по ссылке:
        https://localhost:8833/forgot/${tokenRestorePassword}</p>
        <p>Если вы не собирались изменять пароль, то проигнорируйте это сообщение</p>`
  await sendEmail(email, message)
}

export default restorePasswordMessage
