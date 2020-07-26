const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const {User} = require('./models/User')
const config = require('./config/key')

//application/x-www-form-urlencoded을 가져오기 위한 것
app.use(bodyParser.urlencoded({extended: true}))

//application/json을 가져오기 위한 것
app.use(bodyParser.json())

const mongoose = require('mongoose')
const { mongoURI } = require('./config/dev.js')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=>console.log('MongoDB Connected...'))
.catch(err=>console.log(err))

app.post('/register', (req, res)=>{
    //회원가입 시 필요한 정보들을 클라이언트에서 가져오면 그것들을 db에 넣어줌
    const user = new User(req.body)
    user.save((err, userInfo)=>{
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))