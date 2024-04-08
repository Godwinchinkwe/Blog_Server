const User = require ('../models/userModel')
const bcrypt = require ('bcryptjs')
const fs = require('fs')
const path = require('path')
const {v4: uuid} = require('uuid')


const HTTPError = require('../models/errorModels');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res, next) => {
    try{
        const {name, email, password, password2 } =req.body;
        if (!name || !email || !password){
          return next (new HTTPError ("Fill in all fields.", 422))  
        }

        const newEmail = email.toLowerCase()

        const emailExists = await User.findOne({email:newEmail})
        if(emailExists){
            return next(new HTTPError ("Email already exist.", 422))
        }
        if((password.trim()).lenght < 6){
            return next(new HTTPError("password should be at least 6 character.", 422))
        }
        if (password !=password2) {
            return next (new HTTPError("passwords do not match.", 422))
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt);
        const newUser = await User.create({name, email: newEmail, password: hashedPass})
        res.status(201).jsons(`New User ${newUser.email} registered.`)

    } catch (error){
        return next(new HTTPError('User registration not completed.', 422))
    }  
}



const loginUser = async (req, res, next) => {
   try{
    const {email, password} = req.body;
    if(!email || !password) {
       return next(new HTTPError("fill in all fields.", 422)) 
    }
    const newEmail = email.toLowerCase();

    const user = await User.findOne({email: newEmail})
    if(!user){
        return next(new HTTPError("invalid credentials.", 422))
    }
    const comparePass = await bcrypt.compare (password, user.password)
    if(!comparePass) {
        return next (new HTTPError("Invalid credentials.", 422))
    }
    const {_id: id, name} = user;
    const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expireIn:"id"})
    
    res.status(200).json({token, id, name})
   }catch(error){
    return next(new HTTPError("login failed. please check your credentials.", 422))
   }
}





const getUser  =  async (req, res, next) => {
    try {
        const{id} = req.params;
        const user = await User.findById(id).select('-password')
        if(!user){
            return next(new HTTPError("User Not FOUND.", 404))
        }
        res.status(200).json(user);
    } catch (error) {
        return next(new HTTPError(error))
        
    }
   
}






const changeAvatar = async (req, res, next) => {
    try {
       if(!req.files.avatar){
        return next(new HTTPError("Please choose an image.", 422))
       }
       //find user from data base 
       const user = await User.findById(req.user.id)
       //delete old avatar if exists
       if(user.avatar){
        fs.unlink(path.json(_dirame, '..', 'uploads', user.avatar), (err)=>{
          if (err){
            return next(new HTTPError(err))
          }  
        })
       }
       const {avatar} = req.files;
       //check file size 
       if(avatar.size > 500000) {
        return next( new HTTPError("profile picture too bigh. should be less than 500kb"), 422)
       }
       let fileName;
       fileName = avatar.name;
       let splittedFilename = fileName.plit('.')
       let newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.lenght -1]
       avatar.mv(path.join(_dirname, '..', 'uploads', newFilename), async (err) =>{
        if(err){
            return next (new HTTPError(err))
        }
        const updatedAvatar = await User.findByIdAndUpdate(req.user.id, {avatar: newFilename}, {new: true})
        if (!updatedAvatar){
         return next( new HTTPError("Avatar couldn't be changed.", 422 ))   
        }
        res.status(200).json(updatedAvatar)
       })
    } catch (error) {
       return next(new HTTPError(error)) 
    }
}




const editUser = async (req, res, next) => {
    try {
        const {name, email, currentPassword, newPassword, ConfirmNewPassword} =req.body;
        if(!name || !email || !currentPassword || !newPassword) {
            return next(new HTTPError("Fill in all fields.", 422))
        }
        //get user from database
        const user = await User.findById(req.user.id);
        if(!user){
            return next(new HTTPError("User not found.", 403))
        }
        //make sure new email doesnt already exist
        const emailExist = await User.findOne({email});
        //we want to update other details with/without changing the email (which is a unique id because we use it to login)
        if(emailExist && (emailExist._id != req.user.id)){
           return next (new HTTPError("Email already exist.", 422))
        }
        //compare current password tp bd password
        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validateUserPassword){
            return next(new HTTPError("Invalid current password", 422))
        }

        //compare new passwords
        if(newPassword !== ConfirmNewPassword){
            return next (new  HTTPError("New passords do not match.", 422))
        }
        //hash new password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newPassword, salt);

        //update user info in database
        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password: hash}, {new: true})
        res.status(200).json(newInfo)
    } catch (error) {
        return next(new HTTPError(error))
    }
}




const getAuthors = async (req, res, next) => {
    try {
        const authors = await User.find().select("-password");
        res.json(authors)
    } catch (error) {
        return next(new HTTPError(error))
        
    }
}


module.exports = {
    registerUser, loginUser, getAuthors, changeAvatar, getUser, editUser,
}