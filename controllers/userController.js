const deleteUser=async(req,res)=>{
    try{
        const {id}=req.body
        if(!id)
            return res.status(403).json({message:"Id should not be empty"})
        const [result]=await pool.query("select * from user where id=?",[id]);
        if(result.length==0)
            return res.status(403).json({message:`NO member with ${id} exists`})
        const [status]=await pool.query("update user set is_deleted=? where id=?",[true,id])
        if(!status)
            return res.status(500).json({message:"Internal server error"})
        return res.status(200).json({message:`user with id ${id} deleted successfully`})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:"Internal server error"})
    }
}

const changeRole=async(req,res)=>{
    try{
        const {id,toRole}=req.body;
         if(!id || !toRole)
            return res.status(403).json({message:"Id should not be empty"})
        if(!(toRole==="admin" || toRole==="member"))
            return res.status(403).json({message:"Enter a valid role"})
        const [result]=await pool.query("select * from user where id=?",[id]);
        if(result.length==0)
            return res.status(403).json({message:`NO member with ${id} exists`})
        console.log(result)
        if(result[0].role===toRole)
            return res.status(400).json({message:`user${id} is already an ${toRole}`})
        const [status]=await pool.query("update user set role=? where id=?",[toRole,id])
        if(!status)
            return res.status(500).json({message:"Internal server error"})
        return res.status(200).json({message:`role of user${id} is changed to ${toRole} successfully`})

    }
    catch{
        return res.status(500).json({message:"Internal server error"})
    }
}

const getUsers=async(req,res)=>{ //pagination
    try{
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
            return res.status(400).json({message:"No users found"})
        return res.status(200).json({success:true,pagination:{total:total,page:curr_page,total_pages:total_pages,hasnextPage:hasnextPage,hasprevPage:hasprevPage},data:result})

    }
    catch(err){
        console.log(err)
        res.status(500).json({message:"Something went wrong"})
    }
}

module.exports={deleteUser,getUsers,changeRole}