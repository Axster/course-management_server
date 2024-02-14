import { validationResult } from "express-validator"
import { Request, Response, NextFunction } from "express"

export const checkValidation = (req:Request, res:Response, next: NextFunction) =>{
    const result = validationResult(req)
    result.isEmpty() ? next() : res.status(400).json(result.array())
}