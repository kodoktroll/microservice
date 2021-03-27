const express = require('express')
const pkg = require('sqlite3')
const fetch = require('node-fetch')
const { Database } = pkg

const app = express()
const db = new Database('account.db')

app.use(express.json())
// app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.listen(9000, () => {
    db.run(`CREATE TABLE IF NOT EXISTS account(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT
    )`)

    console.log('Account service running in port 9000')
})

app.get('/api/v1/accounts', (req, res) => {
    db.all('SELECT * FROM account', (err, data) => {
        if(err){
            res.send(err)
        }
        res.send(data)
    })
})

app.get('/api/v1/account/:accountId', async (req, res) => {
    const account_id = req.params.accountId
    const outletPromise = fetch(`http://outlet:9001/api/v1/outlets?account_id=${account_id}`)
    const productPromise = fetch(`http://product:9002/api/v1/products?account_id=${account_id}`)
    const promises = [outletPromise, productPromise]
    const [outletRes, productRes] = await Promise.all(promises)
    const outletJson = await outletRes.json()
    const productJson = await productRes.json()
    db.get(`SELECT * FROM account WHERE id = ${account_id}`, (err, data) => {
        if(err){
            res.send(err)
        }
        res.send({...data, ...outletJson, ...productJson})
    })
})

app.post('/api/v1/account', (req,res) => {
    const body = req.body
    const query = `INSERT INTO account('name', 'email') VALUES ('${body.name}', '${body.email}')`
    db.run(query, (err, data) => {
        if(err) {
            res.send(err)
        }
        res.send(body)
    })
})