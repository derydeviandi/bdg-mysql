// Hasil konfigurasi yang ada di file index.js pada folder connection
const conn = require('../connection/index')
const router = require('express').Router()

// GET ALL TASKS
router.get('/tasks', (req, res) => {

    let sql = `SELECT * FROM tasks`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})

// GET ALL OWN TASKS
router.get('/owntasks/:userid', (req, res) => {
    let sql = `SELECT * FROM tasks WHERE user_id = '${req.params.userid}'`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})

// GET TASK BY ID
router.get('/tasks/:taskid', (req, res) => {
    let sql = `SELECT * FROM tasks WHERE id = '${req.params.taskid}'`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})

// CREATE TASK
router.post('/tasks', (req, res) => {

    let sql = `INSERT INTO tasks SET ?`
    let data = req.body
    let sql2 = `SELECT * FROM tasks`

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err.sqlMessage)

        conn.query(sql2, (err, result) => {
            if (err) return res.send(err.sqlMessage)

            res.send(result)
        })
    })
})

// UPDATE TASK
router.patch('/tasks/:taskid', (req, res) => {
    let sql = `UPDATE tasks SET ? WHERE id = ?`
    let data = [req.body, req.params.taskid]

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})

// DELETE TASK
router.delete('/tasks/:taskid', (req, res) => {
    let sql = `DELETE FROM tasks WHERE id = '${req.params.taskid}'`

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})


module.exports = router

/*
    Untuk SQL yang menggunakan tanda tanya (?), maka pada conn.query akan menerima 3 parameter
    yaitu : sql, data, (err, result) => {}

    Jika tanda tanya yang digunaka lebih dari satu, variabel data akan berisi array of data,
    urutan data pada array harus sama dengan urutan tanda tanya pada SQL
*/





