

const jwt = require('jsonwebtoken')

const protect=async(req,res,next)=>{
    try{
        const token=req.cookies.token
        req.user=await jwt.verify(token,process.env.JWT_SECRET_KEY)
        next()
    }
    catch{
        return res.status(401).json({message:"unauthorized user"})
    }
}

const isAdmin=async(req,res,next)=>{
    if(!(req.user.role==="admin"))
        return res.status(403).json({"message":"Acess restricted Admin only"})
    next()
}

const isMember=async(req,res,next)=>{
    if(!(req.user.role==="member"))
        return res.status(403).json({"message":"Acess restricted Member only"})
    next()
}

module.exports={protect,isAdmin,isMember}