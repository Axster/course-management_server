import { Schema, model } from "mongoose"

type Admin = {
    name: string,
    surname:string,
    email : string, 
    confirmedEmail?: string, 
    isConfirmedEmail : boolean,
    confirmationCode?: String, 
    password: string,
    avatar?:string, 
}

const adminSchema = new Schema<Admin>({
    name: {type: String, required:true},
    surname: {type: String, required:true},
    email : {type: String, required:true},
    confirmedEmail: {type: String, unique:true},
    isConfirmedEmail : {type: Boolean, default:false},
    confirmationCode: String,
    password: {type: String, required:true},
    avatar: String
})

export const Admin = model<Admin>("Admin", adminSchema);