const {validateEmail,validatePassword,validateRole,validateName}=require("../helper")
const {pool}=require("../db")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")


const register = async(req,res)=>{
    try{
        const {name,password,email,role}=req.body;
        if(!name || !email || !password || !role)
            return res.status(400).json({message:"The fields should not be null"})
        if(!validateEmail(email))
            return res.status(400).json({message:"Invalid email ID"})
        if(!validateName(name))
            return res.status(400).json({message:"Invalid Name"})
        if(!validatePassword(password))
            return res.status(400).json({message:"Password is weak"})
        if(!validateRole(role))
            return res.status(400).json({message:"Invalid role"})

        const [existingEmail]=await pool.query("select * from user where email=?",[email]);
        if(existingEmail.length>0)
            return res.status(400).json({message:"User with the email already exists"})

        const hashedPassword=await bcrypt.hash(password,10);

        const [status]=await pool.query("insert into user (name,password,email,role) values (?,?,?,?)",[name,hashedPassword,email,role])
        if(status.affectedRows==0)
            return res.status(500).json({message:"Internal server error"})

        const token=await jwt.sign({id:status.insertId,name,role},process.env.JWT_SECRET_KEY,{expiresIn:"1d"})
        res.cookie("token",token,{
            httponly:true,
            samesite:'strict'
        })
        res.status(201).json({message:"User registered successfully"})
    }
    catch(e){
        return res.status(500).json({message:"Internal server error"})
    }
}

const login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!validateEmail(email))
                return res.status(400).json({message:"Invalid email ID"})
        const [user]=await pool.query("select * from user where email=?",[email]);
        if(user.length==0)
            return res.status(400).json({message:"No such user found"})
        const status=await bcrypt.compare(password,user[0].password);
        if(!status)
            return res.status(400).json({message:"Invalid password"})
        
        const token=await jwt.sign({id:user[0].id,name:user[0].name,role:user[0].role},process.env.JWT_SECRET_KEY,{expiresIn:"1d"})
        res.cookie("token",token,{
            httponly:true,
            samesite:'strict'
        })
        res.status(201).json({message:"User login successfully"})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:"Internal sever error"})
    }

}



module.exports={register,login}