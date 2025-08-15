import { Outlet } from "react-router";
import { useState, useEffect } from 'react'
import {useLogin} from './LoginContext.jsx'
import Navbar from "./Navbar.jsx";
import Login from "./Login.jsx";
import Signup from "./Singup.jsx";
import Chat from "./Chat.jsx";
import axios from "axios"
import socket from "./socket.jsx";


function Layout() {

    const { openLogin, setOpenLogin, openSignup, setOpenSignup } = useLogin();

    const [openChat, setOpenChat] = useState( () => {
        const res = sessionStorage.getItem('openChat');
        return res === "true";
    });


    useEffect( () => {
        const res = openChat ? "true" : "false";
        sessionStorage.setItem('openChat', res);
        }, [openChat])


    return (
        <>  
            <Navbar setOpenChat={()=>setOpenChat(prev=>!prev)} 
                setOpenLogin={()=>setOpenLogin(prev=>!prev)}
                setOpenSignup={()=>setOpenSignup(prev=>!prev)}
            />
            { openLogin && <Login setOpenLogin={()=>setOpenLogin(prev=>!prev)} />}
            { openSignup && <Signup setOpenSignup={()=>setOpenSignup(prev=>!prev)} />}

            <Chat openChat={openChat} 
                setOpenChat={()=>setOpenChat(prev=>!prev)}
                setOpenLogin={()=>setOpenLogin(prev=>!prev)}
            />
            
            <Outlet />
        </>
    )
}

export default Layout;