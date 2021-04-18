//Dependencies
const { signinHandler } = require("./Controllers/signin");
const { registerHandler } = require("./Controllers/register");
const { profileHandler } = require("./Controllers/profile");
const { imageHandler } = require("./Controllers/image");

//Knex
const knex = require("knex");
const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  },
});

//Express
const express = require("express");
const app = express();
app.use(express.json());

//Cors
const cors = require("cors");
app.use(cors());

//bcrypt (hash system)
const bcrypt = require("bcrypt");

//Root used to get all users in the Database
app.get("/", (req, res) => {
  res.send("Working", process.env.DATABASE_URL);
});

//Compares the user infomation submited in the sign in form with the database
app.post("/signin", (req, res) => {
  signinHandler(req, res, db, bcrypt);
});

//Adds the new user to the database
app.post("/register", (req, res) => {
  registerHandler(req, res, db, bcrypt);
});

//Checks the id of the new created user and returns it if found in the database
app.get("/profile/:id", (req, res) => {
  profileHandler(req, res, db);
});

//Returns the information from the clarifai API and increments the user entries
app.put("/image", (req, res) => {
  imageHandler(req, res, db);
});

//Current port
const listener = app.listen(process.env.PORT || 3000, () =>
  console.log(`Operating on port ${listener.address().port}`)
);

console.log(process.env.DATABASE_URL);
console.log(process.env.PORT);
