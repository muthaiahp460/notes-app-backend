const express=require("express");
const router=express.Router();
const {protect,isAdmin}=require("../Middlewares/authMiddleware")
const {getTeams,createTeam}=require("../controllers/teamController")

router.post("/create",protect,isAdmin,createTeam)
router.get("/",protect,getTeams)

module.exports=router