import request from "supertest";
import * as assert from "assert";
import { Course } from "../models/Course";
import app from "../app";
import jwt from 'jsonwebtoken'
import { jwtsalt } from "../middlewares/authAdmins";
import { connect } from "mongoose";
import { config } from "dotenv";
import path from "path"


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
  //creo un array di possibili query params e lo uso per creare tutte le possibili combinazioni
  //di ricerca 
  const queries = ['category=IT', 'maxCost=200', 'maxDuration=200', 'maxNumberMembers=200'];
  it("GET /courses 200 query params", async () => {
    for (let i = 0; i < queries.length; i++) {
      for (let j = i + 1; j <= queries.length; j++) {
        const queryString = queries.slice(i, j).join('&&')
        const { status } = await request(app).get(`/courses?${queryString}`)
        assert.equal(status, 200);
      }
    }
  });
  const badQueries = ['category=NO', 'maxCost=1', 'maxDuration=1', 'maxNumberMembers=1'];
  it("GET /courses 404 courses not found ", async () => {
    for (let i = 0; i < badQueries.length; i++) {
      for (let j = i + 1; j < badQueries.length; j++) {
        const queryString = badQueries.slice(i, j).join('&&')
        const { status } = await request(app).get(`/courses?${queryString}`)
        assert.equal(status, 404);
      }
    }
  })
});


describe("Search course by id", () => {
    it("GET courses/:_id 200 course found", async () =>{
        const { status } = await request(app).get(`/courses/${course._id}`)
        assert.equal(status, 200);
    })
    it("GET courses/:_id 404 course not found", async () =>{
        const { status } = await request(app).get("/courses/657af10c415e41f083547dc0")
        assert.equal(status, 404);
    })
    it("GET courses/:_id 400 bad request", async () =>{
        const { status } = await request(app).get("/courses/993")
        assert.equal(status, 400);
    })
})


describe("Search course by category", () => {
    it("GET courses/category/:category 200 course found", async () =>{
        const { status } = await request(app).get("/courses/category/IT")
        assert.equal(status, 200);
    })
    it("GET courses/category/:category 404 course not found", async () =>{
        const { status } = await request(app).get("/courses/category/chemistry")
        assert.equal(status, 404);
    })
})


describe("Delete course by id", () => {
  const token = jwt.sign({admin:'pippo'}, jwtsalt)
  it("DELETE courses/:_id 200 course deleted", async () =>{
      //salvo un utente nel db 
      const {_id} = await new Course(testCourse).save()
      const { status } = await request(app).delete(`/courses/${_id}`).set({token: token}) 
      assert.equal(status, 200);
  })
  it("DELETE courses/:_id 404 course not found", async () =>{
      //passo un mongoDb che non esiste nel db
      const { status } = await request(app).delete(`/courses/657af10c415e41f083547dc2`).set({token: token}) 
      assert.equal(status, 404);
  })
  it("DELETE courses/:_id 400 bad request", async () =>{
      const { status } = await request(app).delete(`/courses/7474`).set({token: token}) 
      assert.equal(status, 400);
  })
})


describe("Insert course", () => {
  const token = jwt.sign({admin:'pippo'}, jwtsalt)
  it("POST /courses 200 course created", async () =>{
      const { status } = await request(app).post(`/courses`).send(testCourse)
      .set({token: token}) 
      //invio un token generato dallo stesso sale che usa il middleware
      assert.equal(status, 200);
  })
  it("POST /courses 401 wrong token", async () => {
      const { status, body } = await request(app).post("/courses").send(testCourse)
      .set({token:'wrong_token'});
      assert.equal(status, 401);
      assert.equal(body.message, "You are not auth!");
  });
  it("POST /courses 400 missing name", async () => {
    const { status } = await request(app).post("/courses").send({...testCourse, name:undefined})
    .set({token: token}) 
    assert.equal(status, 400);
  });
  it("POST /courses 400 missing category", async () => {
    const { status } = await request(app).post("/courses").send({...testCourse, category:undefined})
    .set({token: token}) 
    assert.equal(status, 400);
  });
  it("POST /courses 400 missing duration", async () => {
    const { status } = await request(app).post("/courses").send({...testCourse, duration:undefined})
    .set({token: token}) 
    assert.equal(status, 400);
  });
  it("POST /courses 400 missing cost", async () => {
    const { status } = await request(app).post("/courses").send({...testCourse, cost:undefined})
    .set({token: token}) 
    assert.equal(status, 400);
  });
  it("POST /courses 400 missing maxNumMembers", async () => {
    const { status } = await request(app).post("/courses").send({...testCourse, maxNumMembers:undefined})
    .set({token: token}) 
    assert.equal(status, 400);
  });
  it("POST /courses 409 existing course", async () => {
    const { status } = await request(app).post("/courses").send(course)
    .set({token: token}) 
    assert.equal(status, 409);
  });
})





