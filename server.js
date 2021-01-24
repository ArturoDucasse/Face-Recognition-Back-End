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

//Clarifai 
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key f9fc9ac54eea4e24b07463b58ea7cd42");

//bcrypt 
const bcrypt = require('bcrypt');
const saltRounds = 10;


// db.select('*').from('users').then(data => {
//     console.log(data)
// });


app.get('/', (req, res)=>{
    db.select('*').from('users')
    .then(user => res.json(user));
})

//Gets the user information that signs in 
app.post('/signin', (req,res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    //Selecting the email and hash value from user that email is equal to request email
    .then(data => {
        bcrypt.compare(req.body.password, data[0].hash, function(err, result) {
        if(result){
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('Imposible to get user'))
        }    
        res.status(400).json('Wrong sign in information')
    });
    })
    .catch(err => res.status(400).json('Wrong sign in information'))
})

//Adds the new user registered in the page to the database
app.post('/register', (req,res)=>{
    //Destructuring values expected from the body
    const {email,name,password} = req.body;
    bcrypt.hash(password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
        // Store hash in your password DB.
        db.transaction(trx =>{
            trx.insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0], 
                        name: name, 
                        joined: new Date()
                    })
                    .then(user =>{
                        res.json(user[0]);          
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('Unable to deliver' + err))
        });
    })

//Checks the id of the new created user and returns it if found in the database 
app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    db.select('*').from('users').where({id})
    .then(user =>{
        //If the array is not empty then...
        if(user.length) res.json(user[0])
        else res.status(400).json('User not found')
    })
    .catch(err => res.status(400).json('Error getting user', err))
})

//Incremets the user entries at the database
app.put('/image', (req, res) =>{
    const {id, imageUrl} = req.body;
    //This objects holds the inf that will be return to the front end
    let data = {
        entries: '',
        imageBox: {}
    }
    
    //Getting the data from the clarifai API 
    stub.PostModelOutputs(
    {
        // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
        model_id: "d02b4508df58432fbb84e800597b8959",
        inputs: [{data: {image: {url: imageUrl}}}]
    },
    metadata,
    (err, response) => {
        if (err) {
            res.status(404).json("Error: " + err);
            return;
        }

        if (response.status.code !== 10000) {
            res.status(404).json("Received failed status: " + response.status.description + "\n" + response.status.details);
            return;
        }

        db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            data.entries = entries[0]
            data.imageBox = response.outputs[0].data.regions[0].region_info.bounding_box;
            res.json(data);
        })
        .catch(err => res.status(400).json('Unable to get entries'))
    });
})

//Do the following at start
app.listen(3000, () =>{
    console.log("Operating on route 3000");
})