import express from "express";
import { Request, Response } from "express"
import { Admin } from "../models/Admin";
import { body, matchedData, param } from "express-validator";
import { isOkAdmin, salt, toName, isAdmin, jwtsalt} from "../middlewares/authAdmins";
import {checkValidation} from "../middlewares/validation"
import bcrypt from 'bcrypt'
import {v4} from 'uuid'
import jwt from 'jsonwebtoken'
import { mail, sender} from "../utils/mail";


const router = express.Router()

//registrazione dell'admin
router.post("/signup", isOkAdmin, checkValidation, toName, 
async (req:Request, res:Response) =>{
  const admin = new Admin(matchedData(req))
  admin.password = bcrypt.hashSync(admin.password, salt) //cripto la password
  admin.confirmationCode = v4() //creo un uuid per la validazione via mail
  try{
    const newAdmin = await admin.save()
    const { _id, name, surname, email } = newAdmin 
    res.status(201).json({ _id, name, surname, email})
    mail.to = email
    mail.text = `${mail.text} http://localhost:3000/auth/emailvalidation/${admin.confirmationCode}`
    await sender.sendMail(mail) //per vedere la mail inviata: https://ethereal.email/messages
  }
  catch(err){
    res.status(409).json({ message:'existing email', err });
  }
})


//validazione utente
router.get("/emailvalidation/:uuid", param('uuid').isUUID(), checkValidation, 
async (req:Request, res:Response) =>{
    const admin = await Admin.findOne({confirmationCode:req.params.uuid})
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }
    admin.isConfirmedEmail = true
    admin.confirmedEmail = admin.email
    admin.confirmationCode = undefined
    try{
      await admin.save()// sovrascrivo l'admin nel db attivando il suo account 
    }
    catch(err){res.status(500).json(err)}
    
    res.json({ message: "validation carried out successfully" });
})


//login
router.post("/login", body('email').trim().isEmail(), body('password').trim(), checkValidation, 
async (req:Request, res:Response) =>{
  const admin = 
  await Admin.findOne({confirmedEmail:req.body.email, isConfirmedEmail:true})
  if(!admin || !bcrypt.compareSync(req.body.password, admin.password)){
    return res.status(401).json({ message: "Invalid credentials" })
  }
  const {_id, confirmedEmail, name, surname} = admin

  //invio un token all'admin da usere per effettuare chiamate per operazioni di scrittura sul db
  res.json({token: jwt.sign({_id: _id, email: confirmedEmail, name: name, surname:surname}, jwtsalt)});
})


//creo un endpoint per permettere all'admin di accedere tramite token
router.post('/me', isAdmin, (req:Request, res:Response) =>{
  res.json({message: `Hello ${res.locals.admin.name}!`})
})

export default router 