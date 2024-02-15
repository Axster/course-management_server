import express from "express";
import { Request, Response } from "express"
import { Course } from "../models/Course";
import { matchedData, param } from "express-validator";
import {checkValidation} from "../middlewares/validation"
import { filterCourses, isOkCourse, isOkPatch, notExistingCourse, searchCourses } from "../middlewares/courses";
import { isAdmin } from "../middlewares/authAdmins";

const router = express.Router()

//1 e 6
router.get("/", filterCourses, searchCourses, async (req:Request, res:Response) =>{
    const courses =  await Course.find(res.locals.search)
    if (courses.length === 0){
        res.status(404).json({message: "there are no active courses with this params"})
    }
    res.json(courses)
})

//2
router.get("/:_id", param('_id').isMongoId(), checkValidation, async (req:Request, res:Response) =>{
    const course =  await Course.findById(req.params._id)
    if (!course){
        res.status(404).json({message: "course not found"})
    }
    res.json(course)
})

//3
router.get("/category/:category", param('category').trim(), async (req:Request, res:Response) =>{
    const courses =  await Course.find(matchedData(req)) //ricerco i dati sanificati
    if (courses.length===0){
        res.status(404).json({message: "course not found"})
    }
    res.json(courses)
})



//i seguenti endpoint sono accessibilii solo agli admin 
//gli utenti non dovrebbero accedere a questi servizi infatti utilizzo il middleware auth

//4
router.delete("/:_id",
isAdmin, param('_id').isMongoId(),
checkValidation,
async (req:Request, res:Response) =>{
    const course =  await Course.findByIdAndDelete(req.params._id)
    if (!course){
        res.status(404).json({message: "Course not found"})
    }
    res.json(course)
})

//5
router.post("/",
isAdmin,
isOkCourse,
checkValidation,
notExistingCourse,
async(req:Request, res:Response) =>{
    try{
        const course = new Course(req.body)
        res.json(await course.save())
    }
    catch(err){
        res.status(500).json(err)
    }
})


//extra - PUT
router.put("/:_id",
isAdmin,
param('_id').isMongoId(),
isOkCourse, checkValidation,
async(req:Request, res:Response) =>{
    try{
        const course = await Course.findByIdAndUpdate(req.params._id, req.body,  { new: true })//new per far restituire il nuovo corso
        if(!course){
            res.status(404).json({mesage: `Course with _id: ${req.body._id} not found`})
        }
        res.json(course)
    }
    catch(err){
        res.status(500).json(err)
    }
})


//extra - PATCH
router.patch("/:_id",
    isAdmin,
    param('_id').isMongoId(),
    isOkPatch,
    checkValidation,
    async(req:Request, res:Response) =>{
    try{
        const course = await Course.findByIdAndUpdate(req.params._id, req.body,  { new: true })//new per far restituire il nuovo user
        if(!course){
            res.status(404).json({mesage: `Course with _id: ${req.body._id} not found`})
        }
        res.json(course)
    }
    catch(err){
        res.status(500).json(err)
    }
})


export default router