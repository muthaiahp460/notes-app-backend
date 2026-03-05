

const jwt = require('jsonwebtoken')
const asyncHandler=require("../utils/asyncHandler")
const {AppError}=require("../utils/AppError")

const protect=asyncHandler(async(req,res,next)=>{
    const token=req.cookies.token
    if(!token)
        throw new AppError("Unauthorized user",401)
    req.user=await jwt.verify(token,process.env.JWT_SECRET_KEY)
    next()
})

const isAdmin=(req,res,next)=>{
    if(!(req.user.role==="admin"))
        throw new AppError("Access restricted Admin only",403)
    next()
}

const isMember=(req,res,next)=>{
    if(!(req.user.role==="member"))
        throw new AppError("Access restricted Member only",403)
    next()
}

module.exports={protect,isAdmin,isMember}