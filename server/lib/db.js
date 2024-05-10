const sqlite3 = require('sqlite3').verbose()
let db = null 
// CREATE TABLE domains(id INTEGER PRIMARY KEY, domain)
// `INSERT INTO domains(domain) values("http://localhost:3000/")`
// UPDATE transaction SET transaction="${wallet}" WHERE email="asdasda.asd" AND date="1324"
// http://localhost:3000/

module.exports.initDB = async () => {
    db = new sqlite3.Database("./db/database.db", sqlite3.OPEN_READWRITE, async (err) => {
        if(err){console.error(err.message)} else {
            console.log("база подключена")
        }
    })    
}

module.exports.get = async (query) => { // запрос на получене базы
    return await new Promise((resolve) => {
        db.all(query, (err, res) => {
            if(err) {
                console.error(err.message)
                resolve(false)
            }
            resolve(res)
          
        })
    })
}

module.exports.push = async (query) => { // запись в базу
    return await new Promise((resolve) => {
        db.run(query, (err) => {
            if(err) {
                console.error(err.message)
                resolve(false)
            }
            resolve(true)
          
        })
    })
}
