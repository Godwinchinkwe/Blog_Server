const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const userModel = new Schema({
    name: {type: String, required: true },
    email: {type: String, required: true},
    password: {type: String, required:true},
    avatar: {type: String},
    posts: {type: Number, default:0}
},{
    timestamps:true
})

module.exports = mongoose.model('User', userModel)