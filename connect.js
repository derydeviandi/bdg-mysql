// + 10 reyhan

let one = () => {
    return () => {
        console.log('Do Something')

        return () => {
            console.log('Another thing')
        }
    }
}
//  one()()()

let two = () => {

    return {
        sayHello : () => {
            console.log('Hellooooo ...')
        }
    }

}

two().sayHello()

// let hasil = two()
// hasil.sayHello()



// SISA MATERI
/*
    Simpan foto dalam folder (multer)
        package 'path'
            Untuk menentukan alamat
        package 'fs'
            Untuk bekerja dengan file
    
    Kirim email
        Nodemailer

    db4free
        Cloud untuk mysql, layaknya Atlas pada MongoDB
*/