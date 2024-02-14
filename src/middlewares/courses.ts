
import { Request, Response, NextFunction } from "express"
import { body, query } from 'express-validator';
import { Course } from '../models/Course';

//array di validazioni e sanificazioni
export const filterCourses = [
    query("MaxCost").optional().trim(),
    query("MaxDuration").optional().trim(),
    query("category").optional().trim(),
    query('maxNumMembers').optional().trim(),
]


//Creo un middleware che mi permette di personalizzare la ricerca da effettuare sul db
export const searchCourses =  (req: Request, res: Response, next: NextFunction) => {
    let search : Object = {state:'active'} 
    if(req.query.category){
    search = {...search, category: req.query.category} 
    }
    if(req.query.MaxDuration){
        search = {...search, duration: {$lte: req.query.MaxDuration}}
    }
    if(req.query.MaxCost){
        search = {...search, cost: {$lte: req.query.MaxCost}}
    }
    if(req.query.maxNumMembers){
        search = {...search, maxNumMembers: {$lte: req.query.maxNumMembers}}
    }
    res.locals.search = search
    next()
}


export const isOkCourse = [
    body('_id').optional().trim().isMongoId(),
    body("name").notEmpty().trim(),
    body("duration").notEmpty().trim(),
    body("cost").notEmpty().trim(),
    body("maxNumMembers").notEmpty().trim(),
]

//Se l'admin esiste non permetto che venga sovrascritto, perchè altrimenti si deve usare il metodo PUT
export const notExistingCourse = async (req:Request, res:Response, next: NextFunction) =>{ 
    if (await Course.findById(req.body._id)){
        return res.status(409)
        .json({message: `Course with _id: ${req.body._id} already exixsts, if you want to replace it use PUT`})
    }
    next()
}


export const isOkPatch = [
    body("name").optional().notEmpty().trim(),
    body("duration").optional().notEmpty().trim(),
    body("cost").optional().notEmpty().trim(),
    body("maxNumMembers").optional().notEmpty().trim(),
]