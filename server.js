//Dependencies
const { signinHandler } = require('./Controllers/signin');
const { registerHandler } = require('./Controllers/register');
const { profileHandler } = require('./Controllers/profile');
const { imageHandler } = require('./Controllers/image');

//Knex
const knex = require('knex');
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'arturito',
        database: 'postgres'
    }
});

//Express
const express = require('express');
const app = express();
app.use(express.json());

//Cors
const cors = require('cors');
app.use(cors());

//Clarifai API (Here we get the image border information)
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key f9fc9ac54eea4e24b07463b58ea7cd42");

//bcrypt (hash system)
const bcrypt = require('bcrypt');

//Root used to get all users in the Database
app.get('/', (req, res)=>{
    db.select('*').from('users')
    .then(user => res.json(user));
})

//Compares the user infomation submited in the sign in form with the database
app.post('/signin', (req, res) => {signinHandler(req, res, db, bcrypt)})

//Adds the new user to the database
app.post('/register', (req, res) => {registerHandler(req, res, db, bcrypt)})

//Checks the id of the new created user and returns it if found in the database 
app.get('/profile/:id', (req, res) => {profileHandler(req, res, db)})

//Returns the information from the clarifai API and increments the user entries
app.put('/image', (req, res) => {imageHandler(req, res, db)});

//Run the following at start
app.listen(3000, () => console.log("Operating on route 3000"));