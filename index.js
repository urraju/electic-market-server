
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
require('dotenv').config()
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
    origin : ['http://localhost:5173'],
    credentials : true
  }))
  app.use(express.json())
  app.use(cookieParser())
  
  // token genarate part 
  const logger = (req,res, next) => {
    console.log(req.method, req.url);
    next()
  }
  // verify token part 
  const verifyToken = (req,res, next) => {
    const token = req.cookies.token
    console.log('token in the middle wayer', token);
    if(!token) {
      return res.status(401).send({message : 'UnAuthorized access'})
    }
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if(err){
        return res.status(401).send({message : 'Unauthorizes Access'})
      }
      req.user = decoded
      next()
    })
  }

  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zrkwx23.mongodb.net/?retryWrites=true&w=majority`;
 

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
    
         // Token post 
    app.post('/jwt', async(req,res) => {
        const user = req.body
        const token = jwt.sign(user, process.env.SECRET, {expiresIn : '1hr'})
        res
        .cookie('token', token, {
          httpOnly : true,
          secure : true,
          sameSite : 'none'
        })
        .send({success : true})
      })
      app.post('/logout', async(req,res) => {
        const user = req.body
        console.log('logged user', user);
        res
        .clearCookie('token', {maxAge : 0})
        .send({success : true})
      })
     
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      
    }
  }
  run().catch(console.dir);


  app.get('/', async(req,res) => {
    res.send('Browser Is Running Now')
})
app.listen(port, () => console.log('Server is Running on Port ||', port))

  