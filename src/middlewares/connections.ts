import { connect } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import path from 'path'
import {config} from 'dotenv'
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`)})

let connected: boolean = false;

const isConnected = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!connected) {
            await connect(process.env.MONGODB as string);
            connected = true;
            console.log('Connected to DB');
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err });
    }
}

export default isConnected