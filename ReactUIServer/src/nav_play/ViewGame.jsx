/* eslint-disable react-hooks/exhaustive-deps */
import { useLocation } from "react-router-dom";
import bg_w from '../assets/bg_w.png';
import bg_b from '../assets/bg_b.png';
import Lobby from "./Lobby";
import { useEffect, useState } from "react";
import Game from "./Game";
import Endgame from "./Endgame";
import { io } from "socket.io-client";
import { SERVER_URL } from "../main";
import { local_get_user } from "../data.mjs";

const ViewGame = () => {

    let user = local_get_user()
    let socket = io(SERVER_URL)
    console.log(useLocation());

    const userId = user.id
    const userName = user.name

    const {state} = useLocation();
    const { quiz } = state;
    const length = quiz.questions.length

    let result_placeholder = []
    for (let i = 0; i < quiz.questions.length; i++) {
        result_placeholder.push({correct: quiz.questions[i].validIndex, answers: []})
    }

    let scores = []
    const[scoresState, setScoresState] = useState([])
    

    const calculateChoice = (id, choiceInd, questInd) => {
      console.log("Choice received:", id, choiceInd, questInd)
      console.log("Current valid:", quiz.questions[questInd].validIndex)
      
      if (revealed){
        console.log("Revealed, no scores calculating")
      } else {
        if (choiceInd == quiz.questions[questInd].validIndex) {
          if (scores.find(obj => obj.userId == id)){
            if (scores.find(obj => obj.userId ===id && obj.answers.indexOf(questInd) == -1)) {
              console.log("Coins of user:",scores.filter(obj => obj.userId == id)[0].coins)
              scores = [...scores.filter(user => user.userId != id), {userId: id, coins: scores.filter(obj => obj.userId == id)[0].coins + 50, answers: [...  scores.find(aa => aa.userId == id).answers, questInd]}]
              // setScores(obj => [...obj.filter(user => user.userId != id), {userId: id, coins: obj.find(aa => aa.userId === id).scores + 50, answers: [...  obj.find(aa => aa.userId == id).answers, questInd] }])
              setScoresState(scores)
              console.log("Scoring", scores)
            }
          } else {
            scores = [...scores, {userId: id, coins: 50, answers: [questInd]}]
            setScoresState(scores)
            // setScores(obj => [...obj, {userId: id, coins: 50, answers: [questInd]}])
            console.log("Scoring + creating", {userId: id, coins: 50, answers: [questInd]})
          }
        }
      }
   }
   useEffect(() => {
     console.log("scores:", scores)
   }, [scores])
   


    // const [answerLog, setAnswerLog] = useState(result_placeholder)
    
    const [start, setStart] = useState(false)
    const getStartFlag = (bool) => {
      setStart(bool)
      socket.emit('start', {roomId: userId})
      setCurrIndex(0)
    }
    const [end, setEnd] = useState(false)
    // useEffect(() => {
    //   scoresState
    // }, [end])
    

    const [connected, setConnect] = useState([])
    const [currIndex, setCurrIndex] = useState(-1)
    const next = (bool) => {
        if (bool && currIndex < quiz.questions.length - 1) {
            setRevealed(false)
            setCurrIndex(currIndex + 1)
        } else if (currIndex == quiz.questions.length - 1) {
            setRevealed(false)
            setEnd(true)
            localStorage.setItem('connections', JSON.stringify(connected))
            // socket.emit('end', {roomId: userId})
        }
    }

    const [revealed, setRevealed] = useState(false)
    const reveal = (bool) => {
      if (bool) {
        setRevealed(true)
        socket.emit('reveal', {roomId: userId})
      }
    }

    const black_bg = {
        backgroundImage: `url(${bg_b})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }
      const white_bg = {
        backgroundImage: `url(${bg_w})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }


      useEffect(() => {
        if (currIndex !== -1) {
          let tempobj = {
            text: quiz.questions[currIndex].text,
            choices: quiz.questions[currIndex].choices
          }
          console.log(tempobj)
            socket.emit('next', {roomId: userId, question: tempobj, questionInd: currIndex}) 
        }
      }, [currIndex])
      


    useEffect(() => {
        socket.connect();
        socket.emit('create', {id: userId, userName: userName})

        function onJoin(obj) {
            console.log(obj)
            setConnect(oldArray => [...oldArray,obj]);
        }
        socket.on('join', onJoin);


      socket.on('leave', (left)=>{
        setConnect(oldArray => [...oldArray.filter(obj => obj.userId !== left.userId)]);
      });


        function onChoice(obj) {
          if (!revealed) {
            console.log(obj)
            calculateChoice(obj.userId, obj.choiceInd, obj.questionInd)
          }
        }
        socket.on('choice', onChoice);


        socket.on('bark', (obj) => {console.log(obj)});

    
        return () => {
          socket.off();
          socket.disconnect();
        };
      }, []);

      const getScores = (obj) => {
        console.log("emitting:", obj)
        socket.emit('end', {roomId: userId, scores:obj})
      }



  return (
    <div className="ViewGame" style={start ? end ? {} : white_bg : black_bg}>
      {end ? <div className="spacer"></div> : ""}
      {/* {window.onresize=() => {
        console.log('window', window.innerWidth, window.innerHeight)
        console.log('body', document.body.clientWidth,document.body.clientHeight)
      }} */}

      <div className={"game-layout " + (window.innerWidth<window.innerHeight? "vertical " : "horizontal ")}>

          <div className={ (start ? (end ? "timer b " : "timer w space_top_timer ") : "timer b ") + (window.innerWidth>window.innerHeight? "horizontal ":null) }> {quiz.title.toUpperCase()}</div>
          {start ?  end ? <Endgame scores={scoresState} scoresToParent={getScores} connected={connected} socket={socket}/> : <Game question={quiz.questions[currIndex]} passNext={next} passReveal={reveal} length={length}/> : <Lobby socket={socket} users={connected} passStartFlag={getStartFlag} roomId={userId}/>}
          
      </div>

      {start ? <h1 className="logo_down hstack">
        <div className="rubil">РУБИЛЬ</div>
        <div className="nik">НИК</div>
      </h1> : ""}
      <div className="spacer-default"></div>
      <div className="vstack" style={{width:'100%'}}>
        <div style={{color: start&!end ? "black" : "white", left:0, right:0, margin:'auto' }}>connected players: {connected.length} </div>
        <div className="hstack" style={{overflow: 'scroll'}}>
          {console.log('connected', connected)}
          {connected.map((val)=>{
            return <div className="user_card hstack" style={{width:'fit-content'}}>
              <div>{val.userName}</div>
              {/* <div className="spacer-default"></div>
              <div>{val.userId}</div> */}
            </div>
          })}
        </div>
      </div>
      

    </div>
  )
}

export default ViewGame