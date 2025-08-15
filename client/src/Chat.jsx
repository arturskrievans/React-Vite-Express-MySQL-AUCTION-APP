import './chat.css'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from "react-router"
import axios from "axios"
import socket from './socket.jsx'

const getLocalDate = (timestamp) => {
   return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}  

function Chat({openChat, setOpenChat, setOpenLogin}) {

    if (!openChat) {
        return (
            <div className="open-block">
                <b><span className="close" onClick={setOpenChat}>&#8612;</span></b>
            </div>
        );
    }

    
    const [messageData, setMessageData] = useState([]);
    const [curMessage, setCurMessage] = useState("");

    const [trackMessage, setTrackMessage] = useState(0);
    
    const sendMessage = async (e) => {
        e.preventDefault();

        const userRes = await axios.get("http://localhost:8080/api/username", 
            { withCredentials: true } );

        if (userRes.data.status === "error") {
            setOpenLogin();
            return;
        }
       
        socket.emit("send_message", curMessage);
        
        
        setTrackMessage(prev=>1-prev);
        setCurMessage("");
    }

    useEffect( () => {

        const getData = async () => {
            
            const messageRes = await axios.get("http://localhost:8080/api/messages",
                { withCredentials: true } );
            
            setMessageData(messageRes.data);
        };

        getData(); 

    }, []);

     useEffect( ()=> {
        

        const handleReceive = (data) => {
          setMessageData(prev => [...prev, data]);
        }
    
        socket.on("receive_message", handleReceive);
    
        return () => {
          socket.off("receive_message", handleReceive);
        }
    
      }, [])

    return (
       
        <div className="chat-block">
            <div className="close-tab">
                <b><span className="close" onClick={setOpenChat}>&#8614;</span></b>
            </div>
            <AllMessages messageData={messageData} trackMessage={trackMessage}/>
            <form onSubmit={sendMessage} className="chat-form">
            <input
                type="text"
                placeholder='Send a message....'
                value = {curMessage}
                onChange={(e)=> setCurMessage(e.target.value)}
                required
            />
            <input type="submit" value="Send Message" className='chat-form-submit'/>
            </form>

        </div>
      
    );
}

function AllMessages({messageData, trackMessage}) {

    const bottomRef = useRef(null);
    useEffect( () => {
        bottomRef.current.scrollTop = 0;
    }, [trackMessage])

    return (
      <div className="all-message-block" ref={bottomRef}>
        {[...messageData].reverse().map( (val, index) => (
            <div key={index} className="message-block">
                <div className="message-content">
                    {!val.username && "[deleted_user]"}
                    <b>{val.username}: </b> {val.message_content} 
                </div>
                <div className="message-date"> 
                    {getLocalDate(val.publish_date)}
                </div>
            </div>
        ) )}
      </div>
    );
} 

export default Chat;

