const nodemailer = require('nodemailer')
const emailconfig = require('./config')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'derydeviandi@gmail.com',
        clientId: emailconfig.clientId,
        clientSecret: emailconfig.clientSecret,
        refreshToken: emailconfig.refreshToken

    }
})

let sendVerification = (data) => {
    let mail = {
        from: 'Dery Dev <derydeviandi@SpeechGrammarList.com>',
        to: data.email,
        subject: 'Selamat Datang',
        html: `<h1>hello, ${data.name}</h1>
        <a href ='https://bdg-frontend-mysql.herokuapp.com/verification/${data.username}'>Klik untuk verivikasi</a>`
    }
    transporter.sendMail(mail, (err, result) => {
        if (err) return console.log(err)

        console.log('Email berhasil dikirim')
    })
}

module.exports = sendVerification