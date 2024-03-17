//import { views } from '../../components-main/app/App';
import { ViewLibrary } from './ViewLibrary';
import { ViewProfile } from './ViewProfile';
import { ViewJoin } from './ViewJoin';
import home_svg from '../assets/home.svg'
import hub_svg from '../assets/hub.svg'
import user_svg from '../assets/user.svg'
import { callView } from '../main';
import React from 'react';

/**
 * @param { {bottom:number|string, children} } 
 * React.Dispatch<React.SetStateAction<{
    callView: () => React.JSX.Element;
    name: string;
}>>
 * @returns 
 */
export const Footer = ({bottom, children}) => {
    return (
        <div className='Footer' style={{ bottom: bottom }}>
            {children}
        </div>
    );
};

/**
 * @param {{set_view}} args 
 * @returns 
 */
export const ViewNavigation = ({set_view}) => {
    return (
        <div className='buttons-container'>
            <button onClick={ ()=>{set_view(callView(()=>ViewLibrary({set_view: set_view}), 'Library'))}}>
                <img className='icon' src={home_svg} alt="home icon" />
            </button>
            <button onClick={ ()=>{set_view(callView(()=>ViewJoin({}),'Join'))}}>
                <img className='icon' src={hub_svg} alt="hub icon" />
            </button>
            <button onClick={ ()=>{set_view(callView(()=>ViewProfile({}),'Profile'))}}>
                <img className='icon' src={user_svg} alt="user icon" />
            </button>
        </div>
    )
}


