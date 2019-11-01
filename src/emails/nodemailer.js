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

let mail = {
    from: 'Dery Dev <derydeviandi@gmail.com>',
    to: 'derydeviandi@gmail.com',
    subject: 'Selamat Datang',
    html: `<h1>Hello Lads</h1>`
}



let sendVerification = (data) => {
    let mal = {
        from: 'Dery Dev <derydeviandi@SpeechGrammarList.com>',
        to: email,
        subject: 'Selamat Datang',
        html: `<h1>hello, ${data.name}</h1>`
    }
    transporter.sendMail(mail, (err, result) => {
        if (err) return console.log(err)

        console.log('Email berhasil dikirim')
    })
}