import { useState, useEffect } from 'react'
import './app.css'
import {useLogin} from './LoginContext.jsx'
import {Link} from "react-router-dom"

function App() {

  const { user, setUser, openLogin, setOpenLogin, openSignup, setOpenSignup } = useLogin();

  return (
    <>
      <div className='main-page-container'>
          <div>

            <div className='background-banner'>
  
            </div>

            <div className='main-page-info'>
              <h1 style={{textAlign:"center"}}>Welcome to a real-time bidding webstore!</h1>
              {user ? 
                <div style={{textAlign:"center"}}>
                  <h2>Interested in new offers?</h2>
                  <div>
                  <Link to={`/products`} className='user-button'>
                    Shop Now
                  </Link>
                  <Link to={`/user/${user.username}/new_product`} className='user-button'>
                    Sell Item
                  </Link>
                  </div>
                </div> :
                <div className='register-info-block'>
                    <h2>Join Us and start bidding today!</h2>
                    <button onClick={()=>setOpenLogin(true)} className='user-button'>
                      Login
                    </button>
                    <button onClick={()=>setOpenSignup(true)} className='user-button'>
                      Sign Up
                    </button>
                </div>  
              }
              <div className='read-more-block'>
                <Link to='/about' className='read-more'>
                  Read More About Our Website
                </Link>
              </div>
            </div>
          </div>
      </div>
    </> 
  )
}

export default App
