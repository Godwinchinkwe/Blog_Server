const express = require ('express')
const cors = require ('cors')
const mongoose = require ('mongoose')
require('dotenv').config()
const upload = require("express-fileupload")

const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const {notFound, errorHandler} = require('./middleware/errorMiddleware')


const DB = process.env.MONGO_URI;
const app = express();
app.use(express.json({extended:true}))
app.use(express.urlencoded({extended:true}))
app.use(cors({credentials: true, origin: "http://localhost:3000" }))
app.use(upload())
// app.use('./uploads', express.static(_dirname + '/uploads') )

app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.get('/', (req, res) => {
    res.status(200).json({message:'WELCOME ON BOARD'})
})

app.use(notFound)
app.use(errorHandler)
mongoose.set('strictQuery', true)
mongoose.connect(DB,{    
}).then(() => {
    console.log('mongoose connected')
}).catch((error) => {
    console.log(error.message)
}).then(() => {
    app.listen(process.env.PORT, () => {
        console.log('Backend server running')
    })
});
