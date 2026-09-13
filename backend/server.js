const express=require("express");
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://xevoprop.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
require("dotenv").config();
const {pool,initializeDatabase}=require("./config/db");
const { authenticateToken } = require("./middleware/authMiddleware");const authorizeRoles=require("./middleware/roleMiddleware");
const propertyRoutes=require("./routes/propertyRoutes");
const uploadRoutes=require("./routes/uploadRoutes");
const visitRoutes=require("./routes/visitRoutes");
const enquiryRoutes=require("./routes/enquiryRoutes");
const authRoutes=require("./routes/authRoutes");
const favoriteRoutes=require("./routes/favoriteRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes=require("./routes/projectRoutes");
const searchRoutes=require("./routes/searchRoutes");
const notificationRoutes=require("./routes/notificationRoutes");
const app=express();
const PORT=process.env.PORT||5000;
const allowedOrigins=(process.env.FRONTEND_URL||"http://localhost:5173").split(",").map(v=>v.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=>{if(!origin||allowedOrigins.includes(origin))return cb(null,true);return cb(new Error("CORS blocked"));},credentials:true}));
app.use(express.json({limit:"2mb"}));
app.get("/",(req,res)=>res.json({success:true,message:"Xevoprop API is running"}));
app.get("/api/health",async(req,res)=>{try{await pool.query("SELECT 1");res.json({success:true,status:"healthy",database:"connected"});}catch(e){res.status(503).json({success:false,status:"unhealthy",database:"disconnected"});}});
app.use("/api/auth",authRoutes);
app.use("/api/properties",propertyRoutes);
app.use("/api/upload",uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visits",visitRoutes);
app.use("/api/enquiries",enquiryRoutes);
app.use("/api/favorites",favoriteRoutes);
app.use("/api/projects",projectRoutes);
app.use("/api/search",searchRoutes);
app.use("/api/notifications",notificationRoutes);
app.get("/api/users-table",async(req,res)=>{try{const r=await pool.query(`SELECT column_name,data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position`);res.json({success:true,columns:r.rows});}catch(e){res.status(500).json({success:false,message:e.message});}});
app.get("/api/test-users",async(req,res)=>{try{const r=await pool.query("SELECT id,name,email,role FROM users ORDER BY id");res.json({success:true,users:r.rows});}catch(e){res.status(500).json({success:false,message:"Failed to fetch users"});}});
app.get("/api/protected",authenticateToken,(req,res)=>res.json({success:true,message:"Protected route",user:req.user}));
app.get("/api/buyer-test",authenticateToken,authorizeRoles("Buyer"),(req,res)=>res.json({success:true,message:"Buyer access granted",user:req.user}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({success:false,message:err.message||"Server error"});});
app.use((req,res)=>res.status(404).json({success:false,message:"API route not found"}));
const startServer=async()=>{await initializeDatabase();app.listen(PORT,()=>console.log(`Xevoprop backend running on port ${PORT}`));};
startServer();
