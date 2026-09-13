const express=require("express");
const {pool}=require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");const router=express.Router();
router.get("/",authenticateToken,async(req,res)=>{try{const explicit=await pool.query("SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",[req.user.id]);const generated=await pool.query(`
SELECT 'enquiry' AS type, e.id AS reference_id, 'New buyer enquiry' AS title,
       CONCAT(e.name,' enquired about ',p.title) AS message,e.created_at
FROM property_enquiries e JOIN properties p ON p.id=e.property_id WHERE p.owner_id=$1
UNION ALL
SELECT 'visit',v.id,'Property visit request',CONCAT(v.name,' requested a visit for ',p.title),v.created_at
FROM property_visits v JOIN properties p ON p.id=v.property_id WHERE p.owner_id=$1
UNION ALL
SELECT 'chat',em.enquiry_id,'New enquiry message',CONCAT(COALESCE(u.name,'A user'),' sent a message about ',p.title),em.created_at
FROM enquiry_messages em JOIN property_enquiries e ON e.id=em.enquiry_id JOIN properties p ON p.id=e.property_id LEFT JOIN users u ON u.id=em.sender_id
WHERE (p.owner_id=$1 OR e.buyer_id=$1) AND em.sender_id<>$1
ORDER BY created_at DESC LIMIT 100`,[req.user.id]);res.json({success:true,notifications:[...explicit.rows,...generated.rows].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))});}catch(e){console.error(e);res.status(500).json({success:false,message:"Failed to load notifications"});}});
router.post("/",authenticateToken,async(req,res)=>{try{const {user_id,type,title,message,reference_id}=req.body;if(Number(user_id)!==Number(req.user.id))return res.status(403).json({success:false,message:"Forbidden"});const r=await pool.query("INSERT INTO notifications(user_id,type,title,message,reference_id) VALUES($1,$2,$3,$4,$5) RETURNING *",[req.user.id,type,title,message,reference_id||null]);res.status(201).json({success:true,notification:r.rows[0]});}catch(e){res.status(500).json({success:false,message:"Failed to create notification"});}});
router.patch("/:id/read",authenticateToken,async(req,res)=>{try{const r=await pool.query("UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=$1 AND user_id=$2 RETURNING *",[req.params.id,req.user.id]);if(!r.rows.length)return res.status(404).json({success:false,message:"Notification not found"});res.json({success:true,notification:r.rows[0]});}catch(e){res.status(500).json({success:false,message:"Failed to update notification"});}});
module.exports=router;
