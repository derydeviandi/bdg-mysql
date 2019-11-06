const conn = require('../connection/index')
const router = require('express').Router()
const valid = require('validator')
const bcryptjs = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sendVerification = require('../emails/nodemailer')
// __dirname = C:\Users\rochafi\Desktop\bdg-mysql\src\routers
const uploadDirectory = path.join(__dirname, '/../../public/uploads/')

// {
//     "fieldname": "avatar",
//     "originalname": "doggo-1.docx",
//     "encoding": "7bit",
//     "mimetype": "image/jpeg",
//     "destination": "D:\\Project\\BE-ExpressMysql\\public\\uploads",
//     "filename": "rochafi-avatar.jpg",
//     "path": "D:\\Project\\BE-ExpressMysql\\public\\uploads\\1572793683443images.jpg",
//     "size": 41880
// }

// Menentukan dimana foto akan disimpan, dan bagaimana foto tersebut di beri nama
const _storage = multer.diskStorage({
    // Menentukan folder penyimpanan foto
    destination: function (req, file, cb) {
        cb(null, uploadDirectory)
    },
    // Menentukan pola nama file
    filename: function (req, file, cb) {
        cb(null, req.params.username + '-' + file.fieldname + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: _storage,
    limits: {
        fileSize: 1000000 // Byte, max 1MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) { // will be error if the extension name is not one of these
            return cb(new Error('Please upload image file (jpg, jpeg, or png)'))
        }

        cb(undefined, true)
    }
})

// POST AVATAR
// pattern baru
// avatar-username.jpg
// hapus foto jika user not found
// fs.unlinkSync
router.post('/avatar/:username', (req, res, next) => {
    // req = {params, query, body, file, files,}
    // Mencari user berdasarkan username
    const sql = `SELECT * FROM users WHERE username = '${req.params.username}'`

    conn.query(sql, (err, result) => {
        if (err) return res.send({ err: err.message })
        // user = {id, username, email, password, avatar}
        let user = result[0]
        // Jika user tidak di temukan
        if (!user) return res.send({ err: "User not found" })
        // Menambahkan property baru pada objet 'req' yang dapat di proses di function berikutnya
        // user = {username, email, password, ...}
        req.user = user

        next()
    })

}, upload.single('avatar'), (req, res) => {

    // Jika user ditemukan, akan simpan nama foto ke dalam kolom avatar dari user tersebut
    const sql = `UPDATE users SET avatar = '${req.file.filename}'
                    WHERE username = '${req.user.username}'`

    // Simpan nama foto yang baru di upload
    conn.query(sql, (err, result) => {
        if (err) return res.send({ err: err.message })

        res.send({ filename: req.file.filename })
    })


}, (err, req, res, next) => {
    if (err) return res.send({ err: err.message })
})

// ACCESS IMAGE
router.get('/avatar/:namaFile', (req, res) => {
    // Nama File
    let namaFile = req.params.namaFile

    // Letak folder
    let letakFolder = {
        root: uploadDirectory
    }

    // Mengirim file sebagai response
    res.sendFile(namaFile, letakFolder, function (err) {
        if (err) return res.send({ err: err.message })

    })
})

// DELETE AVATAR
router.delete('/avatar/:username', (req, res) => {
    let sql = `SELECT avatar FROM users WHERE username = '${req.params.username}'`
    let sql2 = `UPDATE users SET avatar = null WHERE username = '${req.params.username}'`
    // uploadDirectory = C:\Users\rochafi\Desktop\bdg-mysql\public\uploads\

    // Ambil nama image di kolom avatar user
    conn.query(sql, (err, result) => {
        if (err) return res.send({ err: err.message })
        // result = []
        if (!result[0].avatar) {
            return res.send({ err: "user not found" })
        }

        let imgPath = uploadDirectory + result[0].avatar

        // Hapus image avatar
        fs.unlink(imgPath, (err) => {
            if (err) return res.send({ err: err.message })

            // Set null untuk property 'avatar' pada 'user'
            conn.query(sql2, (err, result) => {
                if (err) return res.send({ err: err.message })

                res.send("Berhasil di hapus")
            })
        })

    })
})

// GET ALL USERS
router.get('/users', (req, res) => {
    let sql = `SELECT * FROM users`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})


// CREATE USER V1
router.post('/usersv1', (req, res) => {
    let { username, name, email, password } = req.body

    let sql = `INSERT INTO users(username, name, email, password)
                VALUES ('${username}', '${name}', '${email}', '${password}')`

    conn.query(sql, (err, result) => {
        // Jika terdapat error
        if (err) return res.send(err)

        res.send(result)

    })
})

// CREATE USER V2
router.post('/users', (req, res) => {

    let sql = `INSERT INTO users SET ?` // tanda tanya akan diisi oleh data
    let sql2 = `SELECT * FROM users`
    let data = req.body // {username, name, email, password}

    // Cek formar email
    if (!valid.isEmail(data.email)) return res.send({ error: 'Format email is not valid' })
    // Hash password
    data.password = bcryptjs.hashSync(data.password, 8)

    conn.query(sql, data, (err, result) => {
        if (err) return res.send({ error: err.message })

        // Kirim email verifikasi
        sendVerification(data)

        conn.query(sql2, (err, result) => {
            if (err) return res.send({ error: err.message })

            res.send(result)
        })
    })
})

// UPDATE USER
router.patch('/users/:username', upload.single('avatar'), (req, res) => {
    let sql = `UPDATE users SET ? WHERE username = ?`
    let data = [req.body, req.params.username]

    // Jika user tidak mengirimkan password / tidak mengganti password
    // Hapus property password dari req.body
    if (data[0].password == '') {
        delete data[0].password
    }

    if (data[0].password) {
        data[0].password = bcryptjs.hashSync(data[0].password, 8);
    }

    conn.query(sql, data, (err, result) => {
        if (err) return res.end(err)

        res.send(result)
    })
})

// DELETE USER
router.delete('/users/:userid', (req, res) => {
    let sql = `DELETE FROM users WHERE id = ${req.params.userid}`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})

// LOGIN USER
router.post('/users/login', (req, res) => {
    let { email, password } = req.body

    let sql = `SELECT * FROM users WHERE email = '${email}'`

    conn.query(sql, async (err, result) => {
        if (err) return res.send({ error: err.message })
        // Jika user tidak ditemukan
        if (result.length == 0) return res.send({ error: "User not found" })
        // User dipindahkan ke variabel, agar mudah dalam penggunaan
        let user = result[0]
        // Bandingkan password inputan dg yang ada di database, return true or false
        let hash = await bcryptjs.compare(password, user.password)
        // Jika hash bernilai false, kirim object error
        if (!hash) return res.send({ error: "Wrong password" })
        // Apakah user sudah melakukan verifikasi
        if (!user.verified) return res.send({ error: "Please verification your email" })
        // Kirim user sebagai respon
        // user = {username, id}
        res.send(user)

    })
})

// VERIFICATION
// Browser secara default akan mengakses alamat internert dengan method GET
// Maka dari itu kita menggunakan method get pada link yang di kriim melalui email
router.get('/verification/:username', (req, res) => {
    let sql = `UPDATE users SET verified = true WHERE username = '${req.params.username}'`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        res.send('Verifikasi berhasil')
    })
})

// READ PROFILE
router.get('/users/profile/:username', (req, res) => {
    let sql = `SELECT * FROM users WHERE username = '${req.params.username}'`

    conn.query(sql, (err, result) => {
        if (err) return res.send({ err: err.message })

        let user = result[0]

        if (!user) return res.send({ err: "User not found" })

        res.send({
            ...user,
            avatar: `http://localhost:2019/avatar/${user.avatar}`
        })

        /*
            user : {
                id, username, email, avatar ..
            }
        */

    })
})



















module.exports = router

/*
    upload satu gambar
        upload.single()
        req.file = {}

    upload lebih dari satu gambar
        upload.array()
        req.files = [{}, {}, {}]
*/