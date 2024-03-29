/* eslint-disable react/prop-types */

import { useEffect, useState } from "react"


const Endgame = ({scores}) => {
  const connected =JSON.parse(localStorage.getItem('connections'))
  console.log("Received scores :", scores)
  console.log("Connected people:", connected)
  // connected.push({userName: "console.log", userId:"BBBBB"})

  const modifiedObj = (object) => {
    console.log("Object before mutating:", object)
    console.log("Objecy filtration:", connected.filter(a => a.userId == object.userId))
    return {userId: object.userId, userName: connected.filter(a => a.userId == object.userId)[0].userName, score: object.coins}
  }

  let modifiedScores = []
    if (scores.length > 0){
      console.log("Scores length:", scores.length)
      for (let i = 0; i < scores.length; i++){
        console.log(i)
        console.log(scores[i])
        modifiedScores.push(modifiedObj(scores[i]))
      }
      console.log("Counted scroes:", modifiedScores)
    }

  let notZeros = []
  for (var k = 0; k < modifiedScores.length; k++) {
    notZeros.push(modifiedScores[k].userId);
  }
  console.log("Not zeros (people with scores):", notZeros)

  let zeros = connected.filter(usr => notZeros.indexOf(usr.userId) == -1);
  console.log("Zeros (people without scores):", zeros)

  for (let i = 0; i < zeros.length; i++){
    modifiedScores.push({userId: zeros[i].userId, userName: connected.filter(a => a.userId == zeros[i].userId)[0].userName, score: 0})
  }
  console.log("Modified Scores", modifiedScores)
  let finalScores = modifiedScores

  const [ScoreComp, setScoreComp] = useState(renderScores(finalScores))
  
  
  function renderScores(arr) {
    let tempor = []
    for (let i = 0; i < arr.length; i++) {
      tempor.push(<div key={arr[i].userId} className="user-score">
        <div className={i == 0 ? "index first" : "index"}>{i + 1}</div>
        <div className={i == 0 ? "name first" : "name"}>{arr[i].userName}</div>
        <div className={i == 0 ? "score first" : "score"}>{arr[i].score}</div>
        </div>)
    }
    return <div className="user-scores">{tempor}</div>
  }

  return (
    <div className="game_geometry">
        {ScoreComp}
    </div>
  )
}

export default Endgame