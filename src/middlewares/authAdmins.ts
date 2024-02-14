import jwt from 'jsonwebtoken'
import {genSaltSync} from 'bcrypt'
import { Request, Response, NextFunction } from "express"
import { body } from 'express-validator';
import { Admin } from '../models/Admin';

export const jwtsalt = 'pippo'
export const salt = genSaltSync(3) //genero il sale per maggiore sicurezza

//array di validazioni e sanificazioni
export const isOkAdmin = [
    body('_id').optional().trim().isMongoId(),
    body("name").notEmpty().isString().trim(),
    body("surname").notEmpty().isString().trim(),
    body("email").trim().isEmail(),
    body('password').isStrongPassword(),
    body("avatar").optional().isString().trim()
]

//per trasformare i nomi e i cognomi in "Titoli"
export const toName = (req:Request, res:Response, next: NextFunction) =>{
    if (req.body.name){
        const name = req.body.name
        const cleanedName = name.replace(/[^a-zA-Z]+/g, '').toLowerCase()
        req.body.name = cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
    }
    if (req.body.surname){
        const surname = req.body.surname
        const cleanedSurname = surname.replace(/[^a-zA-Z]+/g, '').toLowerCase()
        req.body.surname = cleanedSurname.charAt(0).toUpperCase() + cleanedSurname.slice(1);
    }
    next()
}

//se l'admin esiste non permetto che venga sovrascritto, perchè altrimenti si deve usare il metodo PUT
export const notExistingAdmin = async (req:Request, res:Response, next: NextFunction) =>{ 
    if (await Admin.findById(req.body._id)){
        return res.status(409)
        .json({message: `Admin with _id: ${req.body._id} already exixsts, if you want to replace it use PUT`})
    }
    next()
}


export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
      res.locals.admin = jwt.verify(String(req.headers.token), jwtsalt);
      next();
      //se il token non è stato generato con quella chiave gestisco l'errore lanciato da verify
    } catch (err) {
      return res.status(401).json({ message: "You are not auth!" });
    }
  };
  