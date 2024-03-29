import { useState } from "react"
import { ViewQuestionEdit } from "./ViewQuestionEdit"
import { Question, Quiz } from "../classes.mjs"
import play_svg from  "../assets/play.svg"
import add_svg from  "../assets/add.svg"
import delete_svg from "../assets/delete.svg"
import back_svg from "../assets/back.svg"
import { Footer } from "./Footer"
import { local_store_user, user } from "../data.mjs"
import { useNavigate } from "react-router-dom"
import { callView } from "./App";
import { ViewLibrary } from "./ViewLibrary"



/**
 * 
 * @param {{set_view, quiz:Quiz, quizInd:number}} args 
 */
export const ViewQuestionList = ({set_view,quiz,quizInd})=>{
    const [flag, set_flag] = useState(false)
    let navigate = useNavigate()
    
    function update() {
        local_store_user(user)
        set_flag(!flag)
    }

    return(
        <div className="ViewQuestionList">

            <h3>Quiz title</h3>
            <input type="text" value={quiz.title} onChange={v=>{
                quiz.title = v.target.value
                update()
            }} style={{width:'100%'}}/>

            <h3>Questions</h3>
            <div className="grid-questionList">
                {quiz.questions.map((question,index)=>[
                    <div>{index}</div>,
                    <button className="hstack" onClick={()=>{
                        set_view(callView(()=>ViewQuestionEdit({set_view, question, quiz}), 'Edit question')) 
                    }} style={{flexGrow:1}}>
                        <div className="listItem">
                            {question.text}
                        </div>
                    </button>,
                    <button onClick={()=>{
                        quiz.questions.splice(index, 1)
                        update()
                    }}>
                        <img src={delete_svg} className="icon" alt="" />
                    </button>
                ])}
            </div>


            

            <Footer bottom='3em'>
                <div className="buttons-container">
                    <button onClick={()=>{
                        set_view(callView(()=>ViewLibrary({set_view}), 'Library'))
                    }}>
                        <img src={back_svg} alt="back" className='icon'/>
                    </button>
                    <button onClick={()=>{
                        console.log(quiz.questions);
                        quiz.questions.push(new Question('new',[]))
                        update()
                    }}><img src={add_svg} className="icon"/></button>
                    
                    <button onClick={()=>{ // start host
                        navigate(`/play/${user.id}`, {state: {quiz, ind: quizInd}})
                    }}><img src={play_svg} className="icon"/></button>
                </div>
            </Footer>
        </div>
    )
}