const express=require("express");
const router=express.Router();
const {protect,isAdmin}=require("../Middlewares/authMiddleware")
const {assignTasks,getTasks,getTeamTasks,ChangeTaskStatus}=require("../controllers/taskController")

router.post("/assign",protect,isAdmin,assignTasks)
router.get("/",protect,getTasks)
router.get("/team",protect,getTeamTasks)
router.post("/ChangeStatus",protect,ChangeTaskStatus)

module.exports=router