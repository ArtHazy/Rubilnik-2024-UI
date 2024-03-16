import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './nav_/App.jsx'
import './index.scss'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ViewGame from './nav_play/ViewGame.jsx';
import { ViewLogin } from './nav_authorizaztion/ViewLogin.jsx';
import { ViewRegister } from './nav_authorizaztion/ViewRegister.jsx';


export const SERVER_URL = "http://192.168.0.165:3000"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/play",
    element: <ViewGame />,
  },
  {
    path: "/login",
    element: <ViewLogin />,
  },
  {
    path: "/register",
    element: <ViewRegister />,
  },

]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)