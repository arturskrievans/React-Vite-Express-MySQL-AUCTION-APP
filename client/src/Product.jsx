import './product.css';
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from "react-router"
import socket from './socket.jsx'
import axios from "axios"
import {useLogin} from './LoginContext.jsx'

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



function Product() {

    const { id } = useParams();
    const navigate = useNavigate();

   
    const [imageId, setImageId] = useState(0);
    const [bidVal, setBidVal] = useState(0);
    const [winner, setWinner] = useState("");

    const [bids, setBids] = useState(null);


    const [bidError, setBidError] = useState(null);
    const [winnerError, setWinnerError] = useState(null);
    const [itemData, setItemData] = useState(null);
    const [modalImage, setModalImage] = useState(null);
    const [modalBid, setModalBid] = useState(false);
    

    const { setOpenLogin, user } = useLogin();

    const getProduct = async () => {
        const res = await axios.get(`http://localhost:8080/api/product/${id}`, { withCredentials: true });
        if (res.data.status==="error") {
            navigate('/');
        } else {
            setItemData(res.data.itemData);
        }
    }

    const openBid = () => {

        if (!user) {
            setOpenLogin(true);
            return;
        }
        setModalBid(true);

    }
    const handleBid = async (e) => {
        e.preventDefault();

        const parsedBidVal = parseFloat(bidVal);
        const entryBid = parseFloat(itemData.info.starting_bid);
        const parsedBalance = parseFloat(user.balance);

        if (entryBid > parsedBidVal) {
            setBidError("The current bid must be at least match the entry bid!");
        } else if (parsedBidVal > parsedBalance) {
            setBidError("Not enough balance!");
        } else {
            setBidError(null);
            const bid = {
                user_id: user.id,
                item_id: id,
                bid: bidVal
            };
            socket.emit("send_bid", bid);
            setModalBid(false);
        }
        
    }

    const handleWinner = async (e) => {

        e.preventDefault();
        setWinnerError(null);
        const username = winner;
        setWinner("");
        const res = await axios.post(`http://localhost:8080/api/product/${id}/bid_exists`, 
            {username},
            { withCredentials: true }
        )
        if (res.data.status==="error") {
            setWinnerError(`User [${username}] did not bid on this item!`);
            return;
        }
        socket.emit("send_bidWinner", res.data.user_id, parseInt(id));
    }

    const removeBid = (user_id, item_id) => {
        socket.emit("send_removeBid", user_id, item_id);
    }

    const flipBid = () => {
        setWinner("");
        setWinnerError(null);
        socket.emit("send_flipBid", id);
    }

    const removeItem = () => {
        socket.emit("send_removeItem", parseInt(id));
    }

    const getBids = async () => {
        const res = await axios.get(`http://localhost:8080/api/product/${id}/bid`, { withCredentials: true });
        setBids(res.data);
    }

    useEffect( () => {
        getProduct();
        getBids();
    }, []);


    useEffect( ()=> {

        const handleBidData = (data) => {
            setBids(prevBids=> {
                const updated = [...prevBids, data];
                for (let i = 0; i < updated.length-1; ++i) {
                    if (updated[i].user_id === data.user_id) {
                        updated.splice(i, 1);
                        break;
                    }
                }
                const top10 = updated.sort((a, b) => b.bid - a.bid).slice(0, 10);
                return top10;
            })
        };

        socket.on(`receive_bid/${id}`, handleBidData);

        return () => {
          socket.off(`receive_bid/${id}`, handleBidData);
        }

    }, []);

    useEffect( ()=> {

        const handleRemoveBid = (user_id, item_id) => {
            setBids(prevBids=> {
                const updated = [...prevBids];
                for (let i = 0; i < updated.length; ++i) {
                    if (updated[i].user_id==user_id && updated[i].item_id==item_id) {
                        updated.splice(i, 1);
                        break;
                    }
                }
                return updated;
            })
        }

        socket.on(`receive_removeBid/${id}`, handleRemoveBid);

        return () => {
          socket.off(`receive_removeBid/${id}`, handleRemoveBid);
        }
    }, [])

    useEffect( ()=> {

        const handleItemRemoved = () => {
            navigate('/products');
        }
        socket.on(`receive_itemRemoved/${id}`, handleItemRemoved);

        return () => {
          socket.off(`receive_itemRemoved/${id}`, handleItemRemoved);
        }
    })

    useEffect( ()=> {

        const handleNavigate = () => {
            navigate('/products');
        }

        socket.on(`receive_removeItem/${id}`, handleNavigate);

        return () => {
          socket.off(`receive_removeItem/${id}`, handleNavigate);
        }

    }, [])

    useEffect( ()=> {

        const handleFlipBid = () => {
            setItemData(prevItemData=> (
                {
                    ...prevItemData,
                    info: {
                        ...prevItemData.info,
                        activeBid: 1 - prevItemData.info.activeBid
                    }
                }
            ))
        };

        socket.on(`receive_flipBid/${id}`, handleFlipBid);

        return () => {
          socket.off(`receive_flipBid/${id}`, handleFlipBid);
        }

    }, [])

    useEffect( ()=> {

        const handleItemSold = (user_id, item_id) => {
            setItemData(prevItemData=> ({
                ...prevItemData,
                info: {
                    ...prevItemData.info,
                    isSold: 1
                }
            }))
            setBids(prevBids => prevBids.filter(bid => bid.user_id === user_id));
        }
        socket.on(`receive_item/${id}/sold`, handleItemSold);

        return () => {
            socket.off(`receive_item/${id}/sold`, handleItemSold);
        }

    }, [])


    return (
        <>
            {itemData && (
                <div className='item-parent-container'>
                    <div className='single-item-container'>

                        <div className="image-wrapper">
                            {itemData.images.length > 0 ? 
                            <img src={"http://localhost:8080/" + itemData.images[imageId].img_path} 
                             onClick={() => setModalImage("http://localhost:8080/" + itemData.images[imageId].img_path)}
                            className='single-item-image'/> :
                            <img src="http://localhost:8080/uploads/default.jpg" className='single-item-image'/>
                            }
                            
                            {itemData.images.length > 1 && (
                                <>
                                <button className="image-nav left" 
                                disabled={imageId===0} 
                                onClick={()=>setImageId(prev=>prev-1)}>  &#10094; </button>
                                <button className="image-nav right" 
                                disabled={imageId+1===itemData.images.length} 
                                onClick={()=>setImageId(prev=>prev+1)}> &#10095; </button>
                                </>
                            )}
                        </div>
                        
                        <div className='date-price-flex-box'>
                            <div className='single-item-bid'>Entry bid: {itemData.info.starting_bid}$</div>
                            <div className="single-item-date">{getLocalDate(itemData.info.publish_date)}</div>
                        </div>
                        <div className="single-item-title">{itemData.info.title}</div>
                        <div className="single-item-description">{itemData.info.description}</div>

                        { !Boolean(itemData.info.isSold) && (
                            (!user || user.id !== itemData.info.user_id) ? (
                                <div className="item-nav-buttons bid">
                                    <button disabled={!itemData.info.activeBid} onClick={openBid}>
                                        <b>{itemData.info.activeBid ? <>Bid</> : <>Bidding Disabled</>}</b>
                                    </button>
                                </div>
                            ) : (
                                <>
                                <div className="item-nav-buttons button-update">
                                    <button onClick={flipBid}>
                                        <b>{itemData.info.activeBid ? <>Disable Bidding</> : <>Enable Bidding</>}</b>
                                    </button>
                                </div>
                                <div className="item-nav-buttons button-delete">
                                    <button onClick={removeItem}><b>Delete Product</b></button>
                                </div>
                                </>
                            )
                        )}

                        { Boolean(itemData.info.isSold) && (
                            <div className='item-nav-buttons bid'> 
                                <button style={{backgroundColor:"red"}} disabled>
                                    Sold
                                </button>
                            </div>
                        )}
                       
                    </div>
                    <div className='bidding-container'>
                        {itemData.info.isSold ? (
                            <h2>Winning Bid:</h2>
                            ) : (
                            <h2>Current top 10 bidders:</h2>
                        )}

                        <br/>
                        {bids?.length > 0 ? 
                        (<>
                         {bids.map( (val, index) => (
                            <div key={index} className='single-bid'>
                                <b>{val.username}: {val.bid}$</b>  
                                { (user?.id===val.user_id && !itemData.info.isSold) && 
                                <b className='remove-bid' onClick={()=>removeBid(user.id, val.item_id)}>&times; REMOVE BID</b>}
                            </div>
                         ) )}
                        </>)
                        : (<b>No active bids!</b>)}
                        {(!itemData.info.isSold && !itemData.info.activeBid && user?.id===itemData.info.user_id) && (
                            <div className='submit-bid-container'>
                                <form onSubmit={handleWinner}>
                                    <label> <b>Enter winner's username: </b><br/>
                                        <input type="text" 
                                        placeholder='Enter username' 
                                        value={winner}
                                        onChange={(e)=>setWinner(e.target.value)}
                                        required></input>
                                        <input type="submit" value="Submit" className='chat-form-submit'></input>
                                    </label>    
                                </form>   
                            </div>
                        )}
                        <p className='bidding-error-message'>
                            {winnerError ? <b>{winnerError}</b> : '\u00A0'}
                        </p> 
                    </div>
        
                </div>
            )}
            {modalImage && (
                <div className='modal-overlay' onClick={() => {setModalImage(null)}}>
                    <img src={modalImage} className="modal-image"/>
                </div>
            )}
            {modalBid && (
                <div className='modal-overlay'>
                    <div className='modal-bid-block'>
                        <div className='modal-bid-wrap'>

                            <span onClick = {()=>{setBidError(null); setModalBid(prev=>!prev)}} className='close-form'>
                                <h1>&times;</h1>
                            </span>

                            <form onSubmit={handleBid}>
                                <label> <b>Enter Your Bid:</b> <br/>
                                    <input 
                                        type="number"
                                        val={bidVal}
                                        onChange={(e)=>setBidVal(e.target.value)}
                                        min = "0"
                                        step="0.01"
                                        placeholder={`Entry bid: ${itemData.info.starting_bid}$`}
                                        required
                                    />
                                </label> <br/>
                                <input type="submit" value="Submit"/>
                            </form>

                            <p className='error-message'>
                                {bidError ? <b>{bidError}</b> : '\u00A0'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Product;