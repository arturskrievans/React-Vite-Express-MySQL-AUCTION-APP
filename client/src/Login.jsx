import { useState, useEffect } from 'react'
import './login.css'
import axios from "axios"
import { useNavigate } from "react-router"
import {useLogin} from './LoginContext.jsx'
import socket from './socket.jsx'

function Login({setOpenLogin}) {

  const [credentials, setCredentials] = useState("");
  const [pswd, setPswd] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useLogin();

  const LoginUser = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:8080/api/login", 
      { credentials, pswd },
      { withCredentials: true } 
    );

    if (res.data.status === "error") {
        setError(res.data.message);
    } else {

      socket.disconnect();
      socket.connect();
      setOpenLogin();
      
      const res = await axios.get("http://localhost:8080/api/user", 
        { withCredentials: true });
      if (res.data.status !== 'error') {
        setUser(res.data.user);
      }
    }
  };

  return (
    <>
      <div className='modal-overlay'>
        <div className='login-block'>
          <div className='login-wrap'>

            <img src='/form-image.png' className='form-image'/>

            <div className='info-block'>

              <span onClick = {setOpenLogin} className='close-form'>
                <h1>&times;</h1>
              </span>

              <h2>Login Form</h2>

              <form onSubmit={LoginUser}>
                <label> Username or email: <br/>
                  <input type="text"
                  value = {credentials}
                  onChange={(e)=> setCredentials(e.target.value)}
                  required/>
                </label><br/>
                <label> Password: <br/>
                  <input type="password"  
                  onChange={(e)=> setPswd(e.target.value)}
                  required/>
                </label><br/>
                <input type="submit" value="Submit"/>
              </form>
              <p className='error-message'>
                {error ? <b>Invalid Login details!</b> : '\u00A0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </> 
  )
}

export default Login