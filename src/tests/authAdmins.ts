import request from "supertest";
import * as assert from "assert";
import { Admin } from "../models/Admin";
import app from "../app";
import { v4 } from "uuid";
import jwt from 'jsonwebtoken'
import { jwtsalt } from "../middlewares/authAdmins";
import { Types, connect, disconnect } from "mongoose";
import { hashSync } from "bcrypt";
import {salt} from "../middlewares/authAdmins";
import {config} from 'dotenv'
import path from 'path'

//Faccio in modo che i test siano indipendenti l'uno dall'altro 

config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`)})

let idTest: string[] = []; //array degli id degli admin da eliminare

//Funzione per creare un admin da inserire nei test con Email casuale per evitare conflitti
//viene invocato v4() ogni volta che invoco admin(), in modo da avere email sempre diverse
const admin = () => {
  //istanzio un id e lo inserisco in un array, in modo da poter eliminare successivamente gli admin
  const admin = {
    _id:new Types.ObjectId().toString(), 
    name: "Aldo",
    surname:"Baglio",
    email: `${v4()}@email.com`, 
    password: "XyZ@PqR12345!" 
  }
  idTest.push(admin._id)
  return admin
}

//Admin registrato e validato che deve essere presente nel DB all'avvio dei test
const email = `${v4()}@email.com`
const signedAdmin = {
  _id: new Types.ObjectId().toString(),
  name: "Giacomo",
  surname:"Poretti",
  email:email, 
  confirmedEmail:email,
  isConfirmedEmail:true,
  password: hashSync("Yoq@ndowi21389G", salt)
}

//mi conneto allo stesso db degli endpoint e salvo un admin registrato e confermato
before(async () => {
  await connect(process.env.MONGODB as string)
  await new Admin(signedAdmin).save()
});
//tramite gli id cancello gli admin inseriti nel db in fase di testing
afterEach(async () => {
  await Admin.deleteMany({_id:{$in:idTest}})
  idTest = []
});
//alla fine di tutti i test elimino l'admin che uso come admin registrato di esempio
after(async () => {
  await connect(process.env.MONGODB as string)
  await Admin.findByIdAndDelete(signedAdmin._id)
});

describe("server status", () => {
  it("Status is running 200", async () => {
        const { status } = await request(app).get("/status"); //interogo l'endpoint status
        assert.equal(status, 200);
  });
})


describe("Auth Signup", () => {
  //non uso il before per attendere la connessione al db perche uso il middlewares connection
  it("POST /auth/signup 400 insecure password", async () => {
    const { status } = await request(app).post("/auth/signup").send({...admin(), password:'insecurePass' });
    assert.equal(status, 400);
  });

  it("POST /auth/signup 400 missing name", async () => {
    const { status } = await request(app).post("/auth/signup").send({...admin(), name:undefined});
    assert.equal(status, 400);
  });

  it("POST /auth/signup 400 missing surname", async () => {
    const { status } = await request(app).post("/auth/signup").send({...admin(), surname:undefined});
    assert.equal(status, 400);
  });

  it("POST /auth/signup 409 duplicate email", async () => {
    const duplicate = admin() 
    await request(app).post("/auth/signup").send(duplicate);
    //provo a reinserire un admin con la stessa email
    const { status } = await request(app).post("/auth/signup").send({...admin(), email:duplicate.email});
    assert.equal(status, 409);
  });

  it("POST /auth/signup 201 admin created", async () => {
    const { status } = await request(app).post("/auth/signup").send(admin());
    assert.equal(status, 201);
  });
});




describe("Auth emailValidation", () => {
  it("GET /auth/emailvalidation/:uuid 404 missing uuid", async () => {
    const { status } = await request(app).get("/auth/emailvalidation")
    assert.equal(status, 404);
  });
  it("GET /auth/emailvalidation/:uuid 401 wrong uuid", async () => {
    const { status, body } = await request(app).get(`/auth/emailvalidation/${v4()}`)
    assert.equal(status, 401);
    assert.equal(body.message, "Admin not found");
  });
  it("GET /auth/emailvalidation/:uuid 400 not uuid", async () => {
    const { status } = await request(app).get("/auth/emailvalidation/5")
    assert.equal(status, 400);
  });
  it("GET /auth/emailvalidation/:uuid 200 validated", async () => {
    const adminToSave = admin()
    //Salvo l'admin nel DB, inviandolo all'endpoint che dovrebbe generare il codice di conferma
    await request(app).post("/auth/signup").send(adminToSave);
    const adminSaved = await Admin.findById(adminToSave._id)//recupero l'intero admin salvato
    const {confirmationCode} = adminSaved!//recupero il codice per inviare la richiesta get
    //invio la richiesta per attivare l'admin
    const { status } = await request(app).get(`/auth/emailvalidation/${confirmationCode}`)
    const adminConfirmed = await Admin.findById(adminToSave._id)//recupero l'intero admin confermato
    const { isConfirmedEmail, email, confirmedEmail} = adminConfirmed!
    assert.equal(status, 200);
    assert.equal(isConfirmedEmail, true);
    assert.equal(confirmedEmail, email); 
  });
});


describe("Auth Login", () => {
  it("POST /auth/login 401 wrong password", async () => {
    const {email} = signedAdmin
    const { status, body } = await request(app).post("/auth/login").send({password:'wrongpass', email:email});
    assert.equal(status, 401);
    assert.equal(body.message, "Invalid credentials");
  });

  it("POST /auth/login 401 wrong email", async () => {
    const {password} = signedAdmin
    const { status, body } = await request(app).post("/auth/login").send({password:password, email:'wrongEmail@email.it'});
    assert.equal(status, 401);
    assert.equal(body.message, "Invalid credentials");
  });

  it("POST /auth/login 401 not confiremad email", async () => {
    //salvo nel db un admin non validato
    const notConfirmedAdmin = await new Admin(admin()).save()
    const {email, password} = notConfirmedAdmin
    const { status, body } = await request(app).post("/auth/login").send({password:password, email:email});
    assert.equal(status, 401);
    assert.equal(body.message, "Invalid credentials");
  });

  it("POST /auth/login 200 login success", async () => {
    const {email} = signedAdmin
    const { status} = await request(app).post("/auth/login").send({password:"Yoq@ndowi21389G", email:email});
    assert.equal(status, 200);
  });
});


describe("Auth token", () => {
  it("POST /auth/me 401 wrong token", async () => {
    const { status, body } = await request(app).post("/auth/me").set({token:'wrong token'});
    assert.equal(status, 401);
    assert.equal(body.message, "You are not auth!");
  });

  it("POST /auth/me 200 correct token", async () => {
    const {_id, name, surname, confirmedEmail} = signedAdmin
    const { status } = await request(app).post("/auth/me")
    //con set invio nell'header un token generato a partire dal sale e dai dati dell'admin regitrato
    .set({token: jwt.sign({_id: _id, email: confirmedEmail, name: name, surname:surname}, jwtsalt)})
    assert.equal(status, 200);
  });
});
