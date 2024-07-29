const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const moment = require("moment");
moment.locale('sr');
const UserRepository = require("./repositories/UserRepository.js")
const UserModel = require("./repositories/UserModel.js");
const BodyRepository = require("./repositories/BodyRepository.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "GeometrySolverBot";
const port = 3000;
var logUserSessions = false;

mongoose.connect("mongodb://localhost:27017/GeometrySolver");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

io.on("connection", socket =>{

  socket.emit("message",`${moment().format('LT')}: Welcome to GeometrySolver`);
  
  if(logUserSessions == true)
  {
    // io.emit("comment",`#${botName}#: "${socket.id} has entered comment section"`);
    console.log(`"#${socket.id}# has entered comment section"`);
  }

  socket.on("openbody",(bodyID)=>
  {
    socket.join(bodyID);
    // console.log(`User has opened project ${bodyID}`);
  })

  socket.on("comment",(comment)=>{

      io.to(comment.bodyID).emit("comment",`${comment.user} ${moment().format('LT')} ${comment.content}`);
        
    });
    
  socket.on("figureAdded",(body)=>{
    io.to(body.bodyID).emit("figureAdded",body);
  });

  socket.on("disconnect",()=>{
    const user = socket.id;
    if(user){
        if(logUserSessions == true)
        {
          // io.emit("comment",`#${botName}#: "${user} has left comment section"`);
          console.log(`"#${socket.id}# has left comment section"`)
        }
    }
  })

});

//user crud
app.get('/getUserByUsername', async (req, res) => {
  try {
    const username = req.query;
    const user = await UserRepository.getUserByUsername(username);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/createUser', async (req, res) => {
    try {
      const userData = req.body;
      const newUser = await UserRepository.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/getUserById/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await UserRepository.getUserById(userId);
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

//body crud
app.get('/getAllBodies', async (req, res) => {
  try {
    const bodies = await BodyRepository.getAllBodies();
    res.json(bodies);
  } catch (error) {
    console.error('Error fetching bodies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getBody', async (req, res) => {
  try {
    const id = req.query.id;
    const body = await BodyRepository.getBodyById(id);
    res.json(body);
  } catch (error) {
    console.error('Error fetching bodies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/getWriteUser", async (req, res) => {
  try {
    const id = req.query.id;
    const body = await BodyRepository.getWriteUser(id);
    res.json(body);
  } catch (error) {
    console.error('Error fetching bodies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/createBody", async(req,res)=>{
  try{
    
    const body = await BodyRepository.createBody(req.body);
    const project = {
      projectid: body._id
    }
    await UserRepository.addProject(req.body.creatorID,project);
    res.json(body);
  }
  catch (error) {
    console.error('Error creating body:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete("/deleteBody", async (req, res) => {
  try {
    const result = await BodyRepository.deleteBody(req.body.id);

    // Remove bodyID from the user's myProjects array
    await UserRepository.removeProject(req.body.userID, req.body.id);

    res.json(result);
  } catch (error) {
    console.error('Error deleting body:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put("/addComment", async(req,res)=>{
  try{
    const comment = {
      user: req.body.user,
      time: moment().format('LT'),
      content: req.body.content
    }
    const cmt = await BodyRepository.addComment(req.body.id,comment);
    res.json(comment);
  }
  catch (error) {
    console.error('Error commenting:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put("/addFigure", async(req,res)=>{
  try{
    const bodyID = req.query.id;
    const fig = await BodyRepository.addFigure(bodyID,req.body);
    const duzina =
    {
      length: fig.length
    }
    res.json(duzina);
  }
  catch (error) {
    console.error('Error commenting:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put("/addWatcher", async(req,res)=>{
  try{
    const watcher =
    {
      userID: req.body.user
    }
    await BodyRepository.addWatcher(req.body.body,watcher);
    res.json(watcher);
  }
  catch (error) {
    console.error('Error adding watcher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete("/deleteWatcher", async (req, res) => {
  try {
    const result = await BodyRepository.removeWatcher(req.body.userID, req.body.id);

    res.json(result);
  } catch (error) {
    console.error('Error deleting body:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

server.listen(port, () => console.log(`Server running on port ${port}`));