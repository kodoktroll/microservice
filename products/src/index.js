const express = require('express')
const pkg = require('sqlite3')
const { Database } = pkg

const app = express()
const db = new Database('product.db')

app.use(express.json())

app.listen(9002, () => {
    db.run(`CREATE TABLE IF NOT EXISTS product(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price INTEGER,
        account_id INTEGER
    )`)
    console.log('outlet service running in port 9002')
})

function buildQuery(curr, toBeAdded) {
    if (curr === '') {
        return ` WHERE ${toBeAdded}`
    }
    return `${curr} && ${toBeAdded}`
}

app.get('/api/v1/products', (req, res) => {
    const queryPrefix = 'SELECT * FROM product'
    const account_id = req.query.account_id
    let filter = ''
    if(req.query.account_id) {
        filter = buildQuery(filter, `account_id = ${account_id}`)
    }
    db.all(queryPrefix + filter, (err, data) => {
        if(err){
            res.send(err)
        }
        res.send({
            products: data
        })
    })
})

app.post('/api/v1/product', (req,res) => {
    const body = req.body
    db.run(`INSERT into product('name', 'price', 'account_id') VALUES ('${body.name}', '${body.price}', '${body.account_id}')`, (err, data) => {
        if(err) {
            res.send(err)
        }
        res.send("success")
    })
})