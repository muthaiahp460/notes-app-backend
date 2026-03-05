const {pool}=require("../db")
const asyncHandler=require("../utils/asyncHandler")
const {AppError}=require("../utils/AppError")

const deleteUser=asyncHandler(async(req,res)=>{
    const {id}=req.body
    if(!id)
        throw new AppError("Id should not be empty",403)
    const [result]=await pool.query("select * from user where id=?",[id]);
    if(result.length==0)
        throw new AppError(`NO member with ${id} exists`,403)
    const [status]=await pool.query("update user set is_deleted=? where id=?",[true,id])
    if(!status)
        throw new AppError("Internal server error",500)
    return res.status(200).json({message:`user with id ${id} deleted successfully`})
})

const changeRole=asyncHandler(async(req,res)=>{
    const {id,toRole}=req.body;
    if(!id || !toRole)
        throw new AppError("Id should not be empty",403)
    if(!(toRole==="admin" || toRole==="member"))
        throw new AppError("Enter a valid role",403)
    const [result]=await pool.query("select * from user where id=?",[id]);
    if(result.length==0)
        throw new AppError(`NO member with ${id} exists`,403)
    if(result[0].role===toRole)
        throw new AppError(`user${id} is already an ${toRole}`,400)
    const [status]=await pool.query("update user set role=? where id=?",[toRole,id])
    if(!status)
        throw new AppError("Internal server error",500)
    return res.status(200).json({message:`role of user${id} is changed to ${toRole} successfully`})
})

const getUsers=asyncHandler(async(req,res)=>{ //pagination
    const curr_page=parseInt(req.query.curr_page);
    const limit=parseInt(req.query.limit);
    const skip=(curr_page-1)*limit;
    const [count]=await pool.query("select count(*) as cnt from user");
    const total=count[0].cnt;
    const total_pages=Math.ceil(total/limit);
    const hasnextPage=(curr_page<total_pages)?true:false;
    const hasprevPage=(curr_page>1)?true:false;
    const [result]=await pool.query("select * from user limit ? offset ?",[limit,skip])
    if(result.length==0)
        throw new AppError("No users found",404)
    return res.status(200).json({success:true,pagination:{total:total,page:curr_page,total_pages:total_pages,hasnextPage:hasnextPage,hasprevPage:hasprevPage},data:result})
})

module.exports={deleteUser,getUsers,changeRole}