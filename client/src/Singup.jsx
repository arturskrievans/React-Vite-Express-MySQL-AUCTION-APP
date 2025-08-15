import { useState, useEffect } from 'react'
import './login.css'
import axios from "axios"
import { useNavigate } from "react-router"
import {useLogin} from './LoginContext.jsx'
import socket from './socket.jsx'

function Signup({setOpenSignup}) {

  const [username, setFormUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pswd, setPswd] = useState("");
  const [pswdConfirm, setPswdConfirm] = useState("");
  
  const [error, setError] = useState("");

  const { setUser } = useLogin();
  const navigate = useNavigate();

  const saveUser = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:8080/api/register", 
      {username, email, pswd, pswdConfirm},
      { withCredentials: true } 
    );

    if (res.data.status === "error") {
        setError(res.data.message);
    } else {

      socket.disconnect();
      socket.connect();

      const res = await axios.get("http://localhost:8080/api/user", 
      { withCredentials: true });
      if (res.data.status !== 'error') {
        setUser(res.data.user);
      }

      setOpenSignup();
      navigate(res.data.link);
    }
  };

  return (
    <>
      <div className='modal-overlay'>
        <div className='login-block'>
          <div className='login-wrap'>
            <div>
              <h1 className='form-welcome'>
                Welcome To Our Auction Webstore!
              </h1>
              <p className='form-bidding'>Join Us and start bidding now!</p>
              <img src='/form-image.png' className='form-image'/>
            </div>
            <div className='info-block'>
              <span onClick = {setOpenSignup} className='close-form'>
                <h1>&times;</h1>
              </span>
              <h2>Sign Up Form</h2>
              <form onSubmit={saveUser}>
                <label> Username: <br/>
                  <input type="text"
                  value = {username}
                  onChange={(e)=> setFormUsername(e.target.value)}
                  required/>
                </label><br/>
                <label> Email: <br/>
                  <input type="email"
                  value = {email}
                  onChange={(e)=> setEmail(e.target.value)}
                  required/>
                </label><br/>
                <label> Password: <br/>
                  <input type="password"  
                  onChange={(e)=> setPswd(e.target.value)}
                  required/>
                </label><br/>
                <label> Confirm password: <br/>
                  <input type="password"  
                  onChange={(e)=> setPswdConfirm(e.target.value)}
                  required/>
                </label><br/>
                <input type="submit" value="Submit"/>
              </form>
              <p className='error-message'>
                {error ? <b>{error}</b> : '\u00A0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </> 
  )
}

export default Signup