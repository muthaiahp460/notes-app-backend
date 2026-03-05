const {pool}=require("../db")
const {AppError}=require("../utils/AppError")
const asyncHandler=require("../utils/asyncHandler")
const assignTasks=asyncHandler(async(req,res)=>{
    const {title,description,assigned_to,due_date}=req.body;
    if(!title || !description || !assigned_to || !due_date)
        throw new AppError("All fields are required",400)
    const [userStatus]=await pool.query("select id from user where id=?",[assigned_to])
    if(userStatus.length==0)
        throw new AppError(`user with id ${assigned_to} not found`,404)
    const [team_id]=await pool.query("select team_id from team_members where user_id=?",[assigned_to]);
    if(!team_id[0].id)
        throw new AppError("The user is not assigned to any team",403)
    const [status]=await pool.query("insert into tasks (title,description,status,assigned_to,team_id,created_by,due_date) values (?,?,?,?,?,?,?)",[title,description,"pending",assigned_to,team_id[0].id,req.user.id,due_date])
    if(!status)
        throw new AppError("Failed to assign task",500)
    res.status(200).json({message:"Task assigned successfully"}) 
})

const getTasks=asyncHandler(async(req,res)=>{
    const [status]=await pool.query("select * from tasks where assigned_to=?",[req.user.id])
    if(!status)
        throw new AppError("Failed to fetch tasks",500)
    res.status(200).json({message:"Tasks fetched successfully",data:status})
})

const getTeamTasks=asyncHandler(async(req,res)=>{
    const [team]=await pool.query("select team_id from team_members where user_id=?",[req.user.id])
    const teamId=team[0]?.team_id;
    if(!teamId)
    {
        const [status]=await pool.query("select * from tasks where assigned_to=?",[req.user.id])
        if(!status)
            throw new AppError("Failed to fetch tasks",500)
        return res.status(200).json({message:"Tasks fetched successfully",data:status})
    }
    const [status]=await pool.query("select * from tasks where team_id=?",[teamId])
    if(!status)
        throw new AppError("Failed to fetch tasks",500)
    res.status(200).json({message:"Tasks fetched successfully",data:status})
})




const ChangeTaskStatus=asyncHandler(async(req,res)=>{
    const id=req.params.id;
    const status=req.params.status;
    if(!id || !status)
        throw new AppError("Invalid request",400)
    if(!(status==="pending" || status==="in_progress" || status==="completed"))
        throw new AppError("Invalid task status",403)

    const [existingStatus]=await pool.query("select * from tasks where id=?",[id])
    if(existingStatus[0].assigned_to!=req.user.id)
        throw new AppError("Unauthorized you are not allowed to do this action",403)
    if(existingStatus[0].status==status)
        throw new AppError(`The status of task ${id} is already in ${status} status`,403)
    const [result]=await pool.query("update tasks set status=? where id=?",[status,id])
    if(result.affectedRows==0)
        throw new AppError("Internal server error",500)
    res.status(200).json({message:"Task status updated successfully"})
})

module.exports={assignTasks,getTasks,getTeamTasks,ChangeTaskStatus}