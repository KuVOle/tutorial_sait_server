import nodemailer from 'nodemailer'

const sendEmail = async (userEmail: string, message: string): Promise<void> => {
  await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: 'nodeJSTetMail@yandex.ru',
      pass: '27011995Slava'
    }
  })

  await transporter.sendMail({
    from: '<nodeJSTetMail@yandex.ru>',
    to: `${userEmail}`,
    subject: 'test mail',
    text: 'autherization',
    html: message
  })
}

export default sendEmail
