const express=require('express');

const app = express();

app.use(express.json());

const cors=require('cors');
app.use(cors());

const path=require('path');

const {open}=require('sqlite');
const sqlite3=require('sqlite3');
const dbPath=path.join(__dirname,'userdetails.db');
let db=null;
const initializeDbAndServer=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database,
        });
        // create user table 
        await db.run(`CREATE TABLE IF NOT EXISTS user(
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           name TEXT NOT NULL
        )`);
        
        // create table address 
        await db.run(`CREATE TABLE IF NOT EXISTS address(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              street TEXT,
              city TEXT,
              state TEXT,
              zip_code TEXT,
              FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
        )`);
    



        app.listen(3000,()=>{
            console.log("Server Running at http://localhost:3000/");
        });
    }catch(e){
        console.log(`DB Error:${e.message}`);
        process.exit(1);
    }
};

initializeDbAndServer();

// post user details
app.post('/users',async(request,response)=>{
    const {name}=request.body
    const createUserQuery=`INSERT INTO user(name) VALUES('${name}')`;
    const dbResponse=await db.run(createUserQuery);
    response.send("User Added Successfully");



});
// post user address details
app.post('/users/:id/address',async(request,response)=>{
    const {id}=request.params;
    const {street,city,state,zip_code}=request.body;
    const createUserAddressQuery=`INSERT INTO address(user_id,street,city,state,zip_code) VALUES('${id}','${street}','${city}','${state}','${zip_code}')`;
    const dbResponse=await db.run(createUserAddressQuery);
    response.send("User Address Added Successfully");
});


// get all users 
app.get('/users',async(request,response)=>{
    const getUsersQuery=`SELECT * FROM user`;
    const dbResponse=await db.all(getUsersQuery);
    response.send(dbResponse);
});
// get user address details
app.get('/users/:id/address',async(request,response)=>{
    const {id}=request.params;
    const getUserAddressQuery=`SELECT * FROM address WHERE user_id=${id}`;
    const dbResponse=await db.all(getUserAddressQuery);
    response.send(dbResponse);
});
