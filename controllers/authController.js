const {validateEmail,validatePassword,validateRole,validateName}=require("../helper")
const {pool}=require("../db")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const asyncHandler=require("../utils/asyncHandler")
const {AppError}=require("../utils/AppError")


const register = asyncHandler(async(req,res)=>{
    const {name,password,email,role}=req.body;
    if(!name || !email || !password || !role)
        throw new AppError("The fields should not be null",400)
    if(!validateEmail(email))
        throw new AppError("Invalid email ID",400)
    if(!validateName(name))
        throw new AppError("Invalid Name",400)
    if(!validatePassword(password))
        throw new AppError("Password is weak",400)
    if(!validateRole(role))
        throw new AppError("Invalid role",400)

    const [existingEmail]=await pool.query("select * from user where email=?",[email]);
    if(existingEmail.length>0)
        throw new AppError("User with the email already exists",400)

    const hashedPassword=await bcrypt.hash(password,10);

    const [status]=await pool.query("insert into user (name,password,email,role) values (?,?,?,?)",[name,hashedPassword,email,role])
    if(status.affectedRows==0)
        throw new AppError("Internal server error",500)

    const token=await jwt.sign({id:status.insertId,name,role},process.env.JWT_SECRET_KEY,{expiresIn:"1d"})
    res.cookie("token",token,{
        httponly:true,
        samesite:'strict'
    })
    res.status(201).json({message:"User registered successfully"})
})

const login=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    if(!validateEmail(email))
        throw new AppError("Invalid email ID",400)
    const [user]=await pool.query("select * from user where email=?",[email]);
    if(user.length==0)
        throw new AppError("No such user found",400)
    const status=await bcrypt.compare(password,user[0].password);
    if(!status)
        throw new AppError("Invalid password",400)
    
    const token=await jwt.sign({id:user[0].id,name:user[0].name,role:user[0].role},process.env.JWT_SECRET_KEY,{expiresIn:"1d"})
    res.cookie("token",token,{
        httponly:true,
        samesite:'strict'
    })
    res.status(201).json({message:"User login successfully"})
})


module.exports={register,login}