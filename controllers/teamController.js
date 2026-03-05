const getTeams=async(req,res)=>{
    try{
        if(req.user.role==="admin"){
            const [teams]=await pool.query("select * from team_members");
            return res.status(200).json({teams});
        }
        else{
            const [teamId]=await pool.query("select team_id from team_members where user_id=?",[req.user.id])
            const [teams]=await pool.query("select * from team_members where team_id=?",[teamId[0].team_id]);
            return res.status(200).json({teams});
        }
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message:"Internal server error"})
    }
}

const createTeam=async(req,res)=>{
    const {teamName,teamMemberIds}=req.body
    if(!teamName || !teamMemberIds)
        return res.status(403).json({message:"teamname and teammebers should not be empty"})
    const connection=await pool.getConnection();
    try{
        await connection.beginTransaction();
        const [result]=await connection.query("select id from user where id in (?)",[teamMemberIds])
        const available=result.map((x=>x.id))
        const unavailable=[]
        for(let i=0;i<teamMemberIds.length;i++){
            let j;
            for(j=0;j<available.length;j++){
                if(teamMemberIds[i]==available[j])
                    break;
            }
            if(j==available.length)
                unavailable.push(teamMemberIds[i]);
        }
        if(unavailable.length>0)
                return res.status(403).json({message:`user IDs ${unavailable} unavailable`})
        const [team]=await connection.query("insert into team (name,created_by) values (?,?)",[teamName,req.user.name])
        const teamId=team.insertId;
        const teamDetails=teamMemberIds.map((teamMemberId)=>[teamId,teamMemberId])
        const [status]=await connection.query("insert into team_members (team_id,user_id) values ?",[teamDetails])
        if(!status)
            throw new Error();
        await connection.commit();
        res.status(201).json({"message":"Team created sucessfully"})
    }
    catch{
        await connection.rollback();
        res.status(500).json({message:"Team creation failed something went wrong"})
    }
    finally{
        connection.release();
    }
}

module.exports={getTeams,createTeam}
