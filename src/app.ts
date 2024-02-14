import express, { Request, Response } from "express"
import isConnected from "./middlewares/connections"
import courses from './routes/courses'
import auth from './routes/authAdmins'

const app = express()
app.use(express.json())
const PORT = 3000;

app.use(isConnected) //middleware che verifica la connesione al db - e dotenv
app.use('/courses', courses)
app.use('/auth', auth)

app.get("/status", (req: Request, res: Response) => {
    res.json({ message: "Server is running!" });
});

app.listen(PORT, () => console.log(`Server is runnning on port: ${PORT}`));

export default app

/*NEL PACKAGE.JSON METTO LA DOPPIA E COMMERCIALE '&&' ATTACCATA AL VALORE DA ASSEGNARE A NODE_ENV
PERCHE ALTRIMENTI NELLA VAR D'AMBIENTE NODE_ENV INSERISCE ANCHE UNO SPAZIO INDESIDERATO
INOLTRE USO SET E NON EXPORT PERCHE SONO SU WINDOWS
ES.  "start:stage": "SET NODE_ENV=stage&& tsc && node dist/app.js",*/