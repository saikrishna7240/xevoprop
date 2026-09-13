const express = require("express");
const { pool } = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");const router = express.Router();

router.get("/", authenticateToken, async (req,res)=>{
  try {
    const result=await pool.query(`SELECT p.*, f.created_at AS saved_at FROM favorites f JOIN properties p ON p.id=f.property_id WHERE f.user_id=$1 ORDER BY f.created_at DESC`,[req.user.id]);
    res.json({success:true, favorites:result.rows});
  }catch(e){console.error(e);res.status(500).json({success:false,message:"Failed to load favorites"});}
});
router.post("/:propertyId", authenticateToken, async(req,res)=>{
  try{
    const p=await pool.query("SELECT id FROM properties WHERE id=$1",[req.params.propertyId]);
    if(!p.rows.length)return res.status(404).json({success:false,message:"Property not found"});
    await pool.query("INSERT INTO favorites(user_id,property_id) VALUES($1,$2) ON CONFLICT(user_id,property_id) DO NOTHING",[req.user.id,req.params.propertyId]);
    res.status(201).json({success:true,message:"Property saved"});
  }catch(e){console.error(e);res.status(500).json({success:false,message:"Failed to save property"});}
});
router.delete("/:propertyId", authenticateToken, async(req,res)=>{
  try{await pool.query("DELETE FROM favorites WHERE user_id=$1 AND property_id=$2",[req.user.id,req.params.propertyId]);res.json({success:true,message:"Property removed"});}
  catch(e){res.status(500).json({success:false,message:"Failed to remove property"});}
});
module.exports=router;
