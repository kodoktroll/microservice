const express = require('express')
const pkg = require('sqlite3')
const { Database } = pkg

const app = express()
const db = new Database('outlet.db')

app.use(express.json())

app.listen(9001, () => {
    db.run(`CREATE TABLE IF NOT EXISTS outlet(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        address TEXT,
        account_id INTEGER
    )`)

    console.log('outlet service running in port 9001')
})

function buildQuery(curr, toBeAdded) {
    if (curr === '') {
        return ` WHERE ${toBeAdded}`
    }
    return `${curr} && ${toBeAdded}`
}

app.get('/api/v1/outlets', (req, res) => {
    const queryPrefix = 'SELECT * FROM outlet'
    const account_id = req.query.account_id
    let filter = ''
    if(req.query.account_id) {
        filter = buildQuery(filter, `account_id = ${account_id}`)
    }
    db.all(queryPrefix + filter, (err, data) => {
        if(err){
            res.send(err)
        }
        res.send({outlets:data})
    })
})

app.post('/api/v1/outlet', (req,res) => {
    const body = req.body
    db.run(`INSERT into outlet('name', 'address', 'account_id') VALUES ('${body.name}', '${body.address}', '${body.account_id}')`, (err, data) => {
        if(err) {
            res.send(err)
        }
        res.send("success")
    })
})