import { useState, useEffect } from 'react'
import './userpage.css'
import axios from "axios"
import authenticate from './authenticate.jsx'
import {useParams} from 'react-router-dom'
import {Link} from "react-router-dom"
import {useLogin} from './LoginContext.jsx'
import socket from './socket.jsx'
import { useNavigate } from "react-router"

function UserPage() {


    const { username } = useParams();
    authenticate(username);

    const navigate = useNavigate();

    const {user, setUser} = useLogin();
    const [bids, setBids] = useState(null);

    const [deleteAccount, setDeleteAccount] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [password, setPassword] = useState("");
    
    const logout = async () => {
        await axios.post("http://localhost:8080/api/logout", {},
                { withCredentials: true } 
        );
        socket.disconnect();
        socket.connect();
        setUser(null);
    }

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        const res = await axios.post("http://localhost:8080/api/confirm_password", 
            { password }, { withCredentials: true } );
        
        if (res.data.status==="error") {
            setPasswordError("Incorrect Passowrd!");
        } else {
            socket.emit('send_removeUser', user.id);

            socket.disconnect();
            socket.connect();
            setUser(null);

            navigate('/');
        }
        
        setPassword("");
    }

    const getBids = async () => {
        const res = await axios.get(`http://localhost:8080/api/user/${user?.id}/bid`, 
        { withCredentials: true });
        
        const resData = res.data;
        resData.forEach((bid)=>{
            if (bid.isSold) {
                bid.status = "purchased";
            }
        })
        
        resData.sort((a, b)=> a.isSold - b.isSold);
        setBids(resData);
    }

    const removeBid = (user_id, item_id) => {
        socket.emit("send_removeBid", user_id, item_id);
        setBids(prev=>prev.filter((bids)=>bids.item_id !== item_id));
    }

    const handleDiscard = (user_id, item_id) => {
        removeBid(user_id, item_id);
    }

    const handlePurchase = (user_id, item_id) => {
        socket.emit("send_itemSold", user_id, item_id);
    }

    useEffect( ()=> {

        if (!user) return;
        
        const handleBidWinner = (item_id) => {
            setBids(prevBids=>{
                const updated = [...prevBids];
                for (let i = 0; i < updated.length; ++i) {
                    if (updated[i].item_id === item_id) {
                        updated[i].winner = true;
                        break;
                    }
                }
                return updated;
            })
        }

        socket.on(`receive_user/${user.id}/bid_winner`, handleBidWinner);

        return () => {
          socket.off(`receive_user/${user.id}/bid_winner`, handleBidWinner);
        }

    }, [user])    

    useEffect ( ()=> {

        const handleItemSold = (user_id, item_id) => {
            setBids(prevBids=>{
                const updated = [...prevBids];
                for (let i = 0; i < updated.length; ++i) {
                    if (updated[i].item_id === item_id) {
                        if (updated[i].user_id === user_id) {
                            updated[i].isSold = true;
                            updated[i].status = "purchased";
                        } else {
                            updated.splice(i, 1);
                        }
                        break;
                    }
                }
                return updated;
            })
        }   
        socket.on("receive_itemSold", handleItemSold);

        return () => {
          socket.off("receive_itemSold", handleItemSold);
        }
    }, [bids]);


    useEffect( ()=> {

        if (!user) return;
        getBids();
        
    }, [user])


    useEffect( ()=> {

        const handleRemoveBid = (id) => {
            setBids(prev=>prev.filter((bid)=>bid.item_id !== id));
        }

        socket.on('receive_removeBid', handleRemoveBid);

        return () => {
            socket.off('receive_removeBid', handleRemoveBid);
        }

    }, [bids])

    useEffect( ()=> {

        if (!bids) return;

        bids.forEach((bid)=> {
            socket.emit("join_item_room", bid.item_id);
        })

    }, [bids])

    return (
        <>

            <div className='full-user-page'>
                <div className='user-page-wrap'>
                    <div className='user-nav'> User Info: </div>
                    <div className='user-full-block'>
                        <div>
                            <div>
                                <img src='/user-default.png' className='user-img'/>
                            </div>
                            <button className='user-button' onClick={()=>setDeleteAccount(prev=>!prev)}>Delete Account</button>
                            <Link to="/">
                                <button onClick={logout} className='user-button'>Logout</button>
                            </Link>
                            { Boolean(deleteAccount) && 
                                <div className='password-confirm-form'>
                                    <form onSubmit={handleDeleteAccount}>
                                        <input 
                                            type='password' 
                                            placeholder='Confirm with password...' 
                                            value={password}
                                            onChange={(e)=>setPassword(e.target.value)}
                                            className='password-confirm-field' 
                                            required/> 
                                        <input type='submit' value='Confirm' className='user-button' style={{fontSize:"14px"}}/>
                                    </form>
                                    <p className='error-message'>
                                        {passwordError ? <b>{passwordError}</b> : '\u00A0'}
                                    </p>
                                </div>
                            }
                        </div>
                        <div className='user-info-block'>
                            <h3>Username: {user?.username} </h3>
                            <h3>Email: {user?.email} </h3>
                            <h3>Active Balance: {user?.balance}$ </h3>
                        
                            <Link to={`/user/${username}/new_product`} className='user-info-links'>
                                <h2>Sell A Product</h2>
                            </Link>
                            <Link to={`/user/${username}/products`} className='user-info-links'>
                                <h2>My Products</h2>
                            </Link>
                            <Link to={`/user/${username}/purchases`} className='user-info-links'>
                                <h2>My Purchases</h2>
                            </Link>

                        </div>
                    </div>
                    <div className='user-nav next'> Active Bids: </div>
                    <div className='active-user-bids'>
                        {bids && bids.filter((val)=>!val.isSold).map((val, index) => (
                            <div key={index} className='user-bid-info'>
                                <div className='bid-info-wrap'>
                                    <div className='bid-info-1'>{index+1}. Bid for: {val.bid}$ </div>
                                    <div className='bid-info-2'>Item - <Link to={`/product/${val.item_id}`} style={{color:"black"}}>{val.title}</Link></div>
                                </div>
                                <div className='remove-bid' onClick={()=>removeBid(val.user_id, val.item_id)}>&times; REMOVE BID</div>
                            </div>
                        ))}
                    </div>
                    <div className='user-nav next'>Notifications:</div>
                    <div>
                        <p className='notif-info'>Recently won bids. Accept to complete the purchase or decline it respectively. Both actions are irreversible!</p>
                        <div className='user-bid-notifications'>
                            {bids && bids.filter((val)=>val.winner).map( (val, index) => (
                                <div key={index} className='user-bid-info' style={{marginTop:"10px"}}>
                                    <div className='bid-info-wrap'>
                                        <div className='bid-info-1'>{index+1}. Bid for: {val.bid}$ </div>
                                        <div className='bid-info-2'>Item - <Link to={`/product/${val.item_id}`} style={{color:"black"}}>{val.title}</Link></div>
                                    </div>
                                    <div>
                                        {val?.status==="purchased" ? 
                                        <div className='item-purchased'>
                                        ✔ Purchased
                                        </div>    : 
                                        <>
                                            <button className='item-discard-button' onClick={()=>handleDiscard(val.user_id, val.item_id)}>Discard</button>
                                            <button 
                                            className='item-purchase-button' 
                                            disabled={user && parseFloat(user.balance) < parseFloat(val.bid)}
                                            onClick={()=>handlePurchase(val.user_id, val.item_id)}>Purchase</button>
                                        </>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
           
        </>
    )

};


export default UserPage;