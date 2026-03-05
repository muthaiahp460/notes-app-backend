const express=require("express")
const {pool}=require("./db")
const cookieParser=require("cookie-parser")

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const teamRoutes = require("./routes/teamRoutes")
const taskRoutes = require("./routes/taskRoutes")
const ratelimit=require("express-rate-limit")
const app=express();
app.use(express.json())
app.use(cookieParser())
const apilimit=ratelimit(
    {
        windowMs:1*1000*30,//30s
        max:3,
        message:"Too many request"
    }
)
app.use(apilimit)

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/teams", teamRoutes)
app.use("/tasks", taskRoutes)

app.get("/", (req,res)=>{
    res.json({message:"API running"})
})

app.listen(5000);


