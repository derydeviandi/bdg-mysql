const path = require('path')

// .join()
// Method dari package 'path' yang berfungsi untuk menggabungkan alamat
let uploadDirectory = path.join(__dirname, '/public/uploads')

console.log(__dirname)
// console.log(__filename)
console.log(uploadDirectory)
