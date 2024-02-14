import request from "supertest";
import * as assert from "assert";
import { Course } from "../models/Course";
import app from "../app";
import jwt from 'jsonwebtoken'
import { jwtsalt } from "../middlewares/authAdmins";
import { connect, disconnect } from "mongoose";
import { config } from "dotenv";
import path from "path"
import { signedAdmin } from "./authAdmins";


//faccio in modo che i test siano indipendenti l'uno dall'altro 

config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`)})


const course = {
    _id:'657af10c415e41f083547dc3',
    name: 'Java',
    category: 'IT',
    duration:'100',
    cost : '100', 
    maxNumMembers: '100'
}

const testCourse = {
    name: 'test',
    category: 'test',
    duration:'100',
    cost : '100', 
    maxNumMembers: '100'
}

before(async () => {
    await connect(process.env.MONGODB as string)
})
//salvo il corso per testare gli endpoint
beforeEach(async () => {
    await new Course(course).save()
});
//alla fine di tutti i test elimino i corsi salvati nel db di testing
afterEach(async () => {
  await Course.deleteMany()
});


describe("server status", () => {
  it("Status is running 200", async () => {
        const { status } = await request(app).get("/status"); //interogo l'endpoint status
        assert.equal(status, 200);
  });
})

describe("Search courses", () => {
  //non uso il before per attendere la connessione al db perche uso il middlewares connection
  it("GET /courses 200", async () => {
    const { status } = await request(app).get("/courses")
    assert.equal(status, 200);
  });

  it("GET /courses 200 all query params", async () => {
    const { status } = await request(app)
    .get("/courses?category=IT&&MaxCost=200&&MaxDuration=200&&MaxNumberMembers=200")
    assert.equal(status, 200);
  });

  it("GET /courses 200 category query param", async () => {
    const { status } = await request(app).get("/courses?category=IT")
    assert.equal(status, 200);
  });
  it("GET /courses 200 MaxCost query param", async () => {
    const { status } = await request(app).get("/courses?MaxCost=200")
    assert.equal(status, 200);
  });
  it("GET /courses 200 MaxDuration query param", async () => {
    const { status } = await request(app).get("/courses?MaxDuration=200")
    assert.equal(status, 200);
  });
  it("GET /courses 200 MaxNumberMembers query param ", async () => {
    const { status } = await request(app).get("/courses?MaxNumberMembers=200")
    assert.equal(status, 200);
  });
  //per brevità non scrivo tutte le combinazioni pssibili
  it("GET /courses 404 no courses ", async () => {
    const { status } = await request(app).get("/courses?MaxDuration=100")
    assert.equal(status, 404);
  })

});

describe("Search course by id", () => {
    it("GET courses/:_id 200 course found"), async () =>{
        const { status } = await request(app).get("/courses/657af10c415e41f083547dc8")
        assert.equal(status, 200);
    }
    it("GET courses/:_id 404 course not found"), async () =>{
        const { status } = await request(app).get("/courses/657af10c415e41f083547dc0")
        assert.equal(status, 404);
    }
    it("GET courses/:_id 400 bad request"), async () =>{
        const { status } = await request(app).get("/courses/993")
        assert.equal(status, 400);
    }
})

describe("Search course by category", () => {
    it("GET courses/:category 200 course found"), async () =>{
        const { status } = await request(app).get("/courses/IT")
        assert.equal(status, 200);
    }
    it("GET courses/:category 404 course not found"), async () =>{
        const { status } = await request(app).get("/courses/chemistry")
        assert.equal(status, 404);
    }
})

describe("Delete course by id", () => {
    it("DELETE courses/:_id 200 course deleted"), async () =>{
        //salvo un utente nel db 
        const {_id} = await new Course(testCourse).save()
        const { status } = await request(app).get(`/courses/${_id}`)
        assert.equal(status, 200);
    }
    it("DELETE courses/:_id 404 course not found"), async () =>{
        //passo un mongoDb che non esiste nel db
        const { status } = await request(app).get(`/courses/657af10c415e41f083547dc2`)
        assert.equal(status, 404);
    }
    it("DELETE courses/:_id 400 bad request"), async () =>{
        const { status } = await request(app).get(`/courses/7474`)
        assert.equal(status, 400);
    }
})


describe("insert course", () => {
    it("POST /courses 200 course created"), async () =>{
        //salvo un utente nel db 
        const course = await new Course(testCourse).save()
        const {_id, name, surname, confirmedEmail} = signedAdmin
        const { status } = await request(app).get(`/courses`).send(course)
        .set({token: jwt.sign({_id: _id, email: confirmedEmail, name: name, surname:surname}, jwtsalt)})
        assert.equal(status, 200);
    }
    it("POST /courses 401 wrong token", async () => {
        const { status, body } = await request(app).post("/auth/me").set({token:'wrong token'});
        assert.equal(status, 401);
        assert.equal(body.message, "You are not auth!");
    });

})





