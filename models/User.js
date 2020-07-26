const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; //salt가 몇글자인지 나타냄
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        //salt를 이용해서 비밀번호를 암호화시킴
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    //plainPassword 1234567를 암호화해서 비교해야 함
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
    //jsonwebtoken을 이용해서 토큰 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
    // user._id + 'secretToken' = token
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    //토큰을 decode
    jwt.verify(token, 'secretToken', function(err, decode){
        //유저 ID를 이용해서 유저를 찾은 후
        user.findOne({"_id": decode, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user)
        })
        //클라이언트에서 가져온 토큰과 db에 보관된 토큰이 일치하는지 확인
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }
