import {Link, useNavigate} from "react-router-dom"
import './navbar.css'
import { useState, useEffect } from 'react'
import {useLogin} from './LoginContext.jsx'
import axios from "axios"
import socket from "./socket.jsx"



function Navbar({setOpenChat, 
    setOpenLogin,
    setOpenSignup
}) {

    const { user, setUser } = useLogin();
    const [openNav, setOpenNav] = useState('none');

    const logout = async () => {
        await axios.post("http://localhost:8080/api/logout", {},
                { withCredentials: true } 
        );
        
        socket.disconnect();
        socket.connect();
        
        setUser(null);  
        
    }

    const NavData = () => (
        <>
            <Link to='/products' className="links">
                <h1>Shop</h1>
            </Link>
            <h1 onClick={setOpenChat} className="links">Chat</h1>
            { user?.username ? <>
                <Link to={`/user/${user.username}`} className="links">
                    <h1>My profile</h1>
                </Link>
                
                <Link to='/' className="links">
                    <h1 onClick={logout}>Logout</h1>
                </Link>

            </> : <>
                
                <h1 onClick={setOpenLogin} className="links"> Login </h1>
                <h1 onClick={setOpenSignup} className="links" style={{marginRight:"10px"}}> Sign Up </h1>
            </>}
        </>
    );


    return (
        

        <div className="full-div">

            <div className="container-2-mobile" onClick={()=> setOpenNav(prev=> (prev==='none' ? 'block' : 'none') ) }>
                <i className="fa fa-bars"></i>
                <div className='container-2-mobile-open' style={{display:openNav}}>
                    <NavData/>
                </div>
            </div>

            <div className="nav-block">
                <div className="container-1">
                    <Link to='/' className="links">
                        <h1> Auction Webstore </h1>
                    </Link>
                </div>

                <div className="container-2">
                    <NavData/>
                </div>
            </div>
        </div>
        
    )
}

export default Navbar