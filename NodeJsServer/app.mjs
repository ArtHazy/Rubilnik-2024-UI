// ESSENTIALS
import express from 'express'; 
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin: "*"}});
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(cors());


server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});

// USEFULL
import {
  doesJsonHave, handleMissingProperties, reqNotifier, logJson,
} from "./_myTools.mjs"


// test
app.get('/getTest.html', (req, res) => {
  reqNotifier(req)
  res.sendFile(path.join(__dirname, 'getTest.html'));
});


// Prisma DB functions
import {
  deleteAllUsers,createUser,deleteUserById,getUser, putUser
} from "./prisma/_userFunctions.mjs";
import { 
  updateUsersQuizzes, 
} from './prisma/_quizFunctions.mjs';


import {
  IdTree
} from "./algorithms.mjs";


async function clearDB(){
  await deleteAllUsers()
}


// At Start
clearDB()
var userIds = new IdTree(4)
var playerIds = new IdTree(5);
// var socketsData = {};


app.post('/hi', (req,res)=>{
  reqNotifier(req)
  res.status(200).send()
})

app.post('/user/verify',(req,res)=>{
  reqNotifier(req);
  if (doesJsonHave(req.body, handleMissingProperties, 'email', 'password')){
    try {
      getUser(req.body.email).then(result=>{
        if (result){
          if (result.password==req.body.password) res.status(200).json(result)
          else res.status(400).json({msg: 'Wrong password'})
        }else res.status(400).json({msg:'Failed to get'})
      })
    } catch (error) {
      res.status(500).json({msg:"Server error"})
    }
  }
})
app.post('/user',(req,res)=>{
  reqNotifier(req);
  if (doesJsonHave(req.body, handleMissingProperties, 'name','email','password')){
    try {
      var userId = userIds.getFreeId();
      if (userId) {
        createUser(userId,{...req.body},[]).then(result=>{
          if (result) res.status(200).json(result) 
          else res.status(400).json({msg:'Failed to create'})
        })
      }else{
        res.status(500).json({msg:"Failed to create: ran out of id's"})
      }
    } catch (error) {
      res.status(500).json({msg:"Server error"})
    }
  }
})
app.put('/user',(req,res)=>{
  reqNotifier(req);
  if (doesJsonHave(req.body, handleMissingProperties, 'email')){
    try{
      putUser(req.body.email, req.body).then(result=>{
        if (result) res.status(200).json(result)
        else res.status(400).json({msg:'Failed to put'})
      })
    } catch (e) {
      res.status(500).json({msg:"Server error"})
    }
  }
})
app.post('/deleteUser',(req,res)=>{
  reqNotifier(req);
  if (doesJsonHave(req.body,handleMissingProperties,'id')){
    try {
      deleteUserById(req.body.id).then(result=>{
        if (result) res.status(200).json({msg: 'Success'})
        else res.status(400).json({msg:'Failed to delete'})
      })
    } catch (error) {
      res.status(500).json({msg: 'Internal error'})
    }
  }
})
app.post('/usersQuizzes',(req,res)=>{
  reqNotifier(req);
  if (doesJsonHave(req.body,handleMissingProperties,'userId','quizzes')){
    updateUsersQuizzes(req.body.userId,req.body.quizzes).then(result=>{
      if (result) res.status(200).json({msg:'Success'})
      else res.status(400).json({msg: "Failed to update"})
    })
  }
})
app.post('/user/verify',(req,res)=>{
  reqNotifier(req)

})

// function handleSocketMissingProperties(missingProperties){
  //   if (Array.isArray(missingProperties)){
  //     socket.emit('missingProperties', {msg:`Missing required properties in socket.body: ${missingProperties.join(', ')}`})
  //   }
  // }

  function logRooms(){
    io.sockets.adapter.rooms.forEach((clients, roomId)=>{
      console.log('Room', roomId, ":", clients);
    })
  }


io.on('connection', (socket) => {
  console.log(`socket connect recieved: ${socket.id}`);
  logRooms()
  
  socket.on('bark', ({userName}) => {
    socket.rooms.forEach((room) => {
      io.to(room).emit('bark',{msg: `user ${userName} barked in room ${room}`})
    });
  })

  socket.on('join', ({roomId, userName, userId}) => {
    console.log(`join received from user ${userId} ${userName} to room: ${roomId}`);
    socket.data = {userId, userName};

    if (io.sockets.adapter.rooms.has(roomId)){

      let roommates = [];
      let room = io.sockets.adapter.rooms.get(roomId);
      room.forEach((socketId)=>{
        let socket = io.sockets.sockets.get(socketId);
        roommates.push(socket.data)
      })
      console.log('roommates', roommates );

      if (userId) {
        socket.join(roomId)
        io.to(roomId).emit('join',{userName, userId, roommates})
      } else {
        console.log(`join received from player ${userName} to room: ${roomId}`);
        var playerId = playerIds.getFreeId();
        if (playerId) {
          socket.data.userId = playerId;
          console.log(`player's id assigned ${playerId} ${userName}`);
          socket.join(roomId)
          socket.emit('joined',{playerId: playerId})

          io.to(roomId).emit('join',{userName, userId: playerId, roommates })
        } else { console.log('failed');}
      }
    } else {
      console.log(`${userName} failed to join. Room ${roomId} does not exist`);
      //socket.emit('joined',{})
    }
    logRooms()
  });

  socket.on('create', ({roomId, userName, userId}) => {
    console.log(`create received for room ${roomId}`);
    socket.data = {userId, userName};

    socket.join(roomId);
    io.to(roomId).emit('create',{})

    logRooms()
  })

  socket.on('start', ({roomId}) => {
    console.log(`start received for room: ${roomId}`)

    io.to(roomId).emit('start',{})
  })

  socket.on('choice', ({roomId, userId, questionInd, choiceInd}) => {
    console.log(`choice received for room: ${roomId} from user ${userId} on question ${questionInd} with choice: ${choiceInd}`)

    io.to(roomId).emit('choice',{userId, questionInd, choiceInd})
  })

  socket.on('next', ({roomId, questionInd, question}) => {
    console.log(`next received for room: ${roomId} with question (# ${questionInd}): ${question.text}  with choices: ${question.choices}`)

    io.to(roomId).emit('next',{question, questionInd})
  })

  socket.on('result', ({roomId,scores}) => {
    console.log(`result received for room: ${roomId} with scores: ${scores}`);
    logJson(scores)
    io.to(roomId).emit('result',{scores})
  })

  socket.on('reveal', ({roomId, choiceInd}) => {
    console.log(`reveal received for room: ${roomId} choiceInd: ${choiceInd}`);

    io.to(roomId).emit('reveal',{choiceInd})
  })

  socket.on('disconnecting', () => {
    console.log(`socket disconnect recieved: ${socket.id}`)
    console.log('socket rooms', socket.rooms)

    socket.rooms.forEach((roomId)=>{
      console.log('emit leave to', roomId)
      io.to(roomId).emit('leave', {userId: socket.data.userId, userName: socket.data.userName, socketId: socket.id}) 
    })

    if (socket.data.userId?.length == 5) { // if PlayerId
      console.log(playerIds.deleteId(socket.data.userId))
      playerIds.visualize()
    }

    logRooms()
  });
});