const jwt = require ("jsonwebtoken")
const HTTPError = require('../models/errorModels')

const authMiddleware = async (req, res, next) => {
    const Authorization = req.header.Authorization || req.header.authorization;

    if(Authorization && Authorization.startsWith("Bearer")){
        const token = Authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET,(err, info)=>{
           if(err){
            return next(new HTTPError("Unauthorized. Invalid token.", 403))
           }
           req.user = info;
           next()
        })

    }else{
       return next(new HTTPError("Unauthorized. No token", 402)) 
    }
}

module.exports = authMiddleware