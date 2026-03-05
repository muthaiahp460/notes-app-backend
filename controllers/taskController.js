const assignTasks=async(req,res)=>{
    try{
        const {title,description,assigned_to,due_date}=req.body;
        if(!title || !description || !assigned_to || !due_date)
            return res.status(400).json({message:"All fields are required"})
        const [userStatus]=await pool.query("select id from user where id=?",[assigned_to])
        if(userStatus.length==0)
            return res.status(404).json({message:`user with id ${assigned_to} not found`})
        const [team_id]=await pool.query("select team_id from team_members where user_id=?",[assigned_to]);
        if(!team_id[0].id)
            return res.status(403).json({message:"The user is not assigned to any team"})
        const [status]=await pool.query("insert into tasks (title,description,status,assigned_to,team_id,created_by,due_date values (?,?,?,?,?,?,?)",[title,description,"pending",assigned_to,team_id[0].id,req.user.id,due_date])
        if(status.length==0)
            res.status(500).json({message:"Failed to assign task"})
        res.status(200).json({message:"Task assigned successfully"}) 
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to assign task"})
    }
}

const getTasks=async(req,res)=>{
    try{
        const [status]=await pool.query("select * from tasks where assigned_to=?",[req.user.id])
        if(!status)
            return res.status(500).json({message:"Failed to fetch tasks"})
        return res.status(200).json({message:"Tasks fetched successfully",data:status})
    }
    catch{
        return res.status(500).json({message:"Failed to fetch tasks"})
    }
}

const getTeamTasks=async(req,res)=>{
    try{
        const [team]=await pool.query("select team_id from team_members where user_id=?",[req.user.id])
        const teamId=team[0].team_id;
        if(!teamId)
        {
            const [status]=await pool.query("select * from tasks where assigned_to=?",[req.user.id])
            if(!status)
                return res.status(500).json({message:"Failed to fetch tasks"})
            return res.status(200).json({message:"Tasks fetched successfully",data:status})
        }
        const [status]=await pool.query("select * from tasks where team_id=?",[teamId])
        if(!status)
            return res.status(500).json({message:"Failed to fetch tasks"})
        return res.status(200).json({message:"Tasks fetched successfully",data:status})
        
    }
    catch{
        return res.status(500).json({message:"Failed to fetch tasks"})
    }
}




const ChangeTaskStatus=async(req,res)=>{
    try{
        const id=req.params.id;
        const status=req.params.status;
        if(!id || !status)
            return res.status(400).json({message:"Invalid request"})
        if(!(status==="pending" || status==="in_progress" || status==="completed"))
            return res.status(403).json({message:"Invalid task status"})

        const [existingStatus]=await pool.query("select * from tasks where id=?",[id])
        if(existingStatus[0].assigned_to!=req.user.id)
            return res.status.json({message:"Unauthorized you are not allowed to do this action"})
        if(existingStatus[0].status==status)
            return res.status(403).json({message:`The status of task ${id} is already in ${status} status`})
        const [result]=await pool.query("update tasks set status=? where id=?",[status,id])
        if(result.affectedRows==0)
            return res.status(500).json({message:"Internal server error"})
        return res.status(200).json({message:"Task status updated successfully"})
    }
    catch{
        return res.status(500).json({message:"Internal server error"})
    }
}

module.exports={assignTasks,getTasks,getTeamTasks,ChangeTaskStatus}