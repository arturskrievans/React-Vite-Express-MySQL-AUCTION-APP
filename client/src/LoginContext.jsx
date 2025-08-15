import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {

    const [openLogin, setOpenLogin] = useState(() => {
        const res = sessionStorage.getItem('openLogin');
        return res === 'true';
    });

    const [openSignup, setOpenSignup] = useState(() => {
        const res = sessionStorage.getItem('openSignup');
        return res === "true";
    });


    const [user, setUser] = useState(null);

    useEffect(()=> {
        const getUser = async () => {
            const res = await axios.get("http://localhost:8080/api/user", 
            { withCredentials: true });
            if (res.data.status !== "error") {
                setUser(res.data.user);
            }
        }
        getUser();
    }, [])

    useEffect( ()=> {
        const res = openLogin ? "true" : "false";
        sessionStorage.setItem('openLogin', res); 
    }, [openLogin])

    useEffect( ()=> {
        const res = openSignup ? "true" : "false";
        sessionStorage.setItem('openSignup', res); 
        }, [openSignup])

    return (
        <LoginContext.Provider value={{ openLogin, setOpenLogin, user, setUser, openSignup, setOpenSignup }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = () => useContext(LoginContext);