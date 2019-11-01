const conn = require('../connection/index')
const router = require('express').Router()
const valid = require('validator')
const bcryptjs = require('bcryptjs')
const sendVerification = require('../emails/nodemailer')

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
        if (err) return res.send(err)

        //  kirim email verifikasi
        sendVerification(data)

        conn.query(sql2, (err, result) => {
            if (err) return res.send(err)

            res.send(result)
        })
    })
})

// UPDATE USER
router.patch('/users/:userid', (req, res) => {
    let sql = `UPDATE users SET ? WHERE id = ?`
    let data = [req.body, req.params.userid]

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
        if (err) return res.send(err)
        // Jika user tidak ditemukan
        if (result.length == 0) return res.send({ error: "User not found" })
        // User dipindahkan ke variabel, agar mudah dalam penggunaan
        let user = result[0]
        // Bandingkan password inputan dg yang ada di database, return true or false
        let hash = await bcryptjs.compare(password, user.password)
        // Jika hash bernilai false, kirim object error
        if (!hash) return res.send({ error: "Wrong password" })
        // Kirim user sebagai respon
        res.send(user)

    })
})

// VERIFICATION
router.get('/verification/:username', (req, res) => {
    let sql = `UPDATE users SET verified = true WHERE username  = '${req.params.username}'`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        res.send("Verifikasi berhasil")
    })
})

// READ PROFILE




















module.exports = router