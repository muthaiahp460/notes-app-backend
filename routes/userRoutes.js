const express=require("express");
const router=express.Router();
const {protect,isAdmin}=require("../Middlewares/authMiddleware")
const {deleteUser,getUsers,changeRole}=require("../controllers/userController")

router.delete("/",protect,isAdmin,deleteUser)
router.get("/",protect,isAdmin,getUsers)
router.post("/changeRole",protect,isAdmin,changeRole)

module.exports=router