import { useEffect } from 'react'
import axios from "axios"
import { useNavigate } from "react-router"


export default function authenticate(username) {

    const navigate = useNavigate();

    useEffect( ()=> {
        const check = async () => {
            const res = await axios.get(`http://localhost:8080/api/authenticate/${username}`, 
                { withCredentials: true } 
            );
            if (res.data.status==="error") {
                navigate(res.data.link);
            }
        }
        check();
    }, [username]);
}