import { Schema, model } from "mongoose"

type Course = {
    name:string,
    category: string,
    duration:number,
    cost : number, 
    maxNumMembers: number
    state: String
}

const courseSchema = new Schema<Course>({
    name: {type: String, required:true},
    category: {type: String, required:true},
    duration: {type: Number, required:true},
    cost: {type: Number, required:true},
    maxNumMembers : {type: Number, required:true},
    state: {type: String, default:'active'}
})

export const Course = model<Course>("Course", courseSchema);
