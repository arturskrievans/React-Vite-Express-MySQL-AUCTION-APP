import { useState, useEffect } from 'react'
import axios from "axios"
import {useParams} from 'react-router-dom'
import { useNavigate } from "react-router"
import useItems from './useProducts.jsx'
import './products.css';
import authenticate from './authenticate.jsx'


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


function UserProducts() {

    const { username } = useParams();
    authenticate(username);

    const {itemData, userId} = useItems();

    const navigate = useNavigate();


    const visitProduct = (id) => {
        navigate(`/product/${id}`);
    }

    return (
        <div className='item-page-container'>
            {itemData.map( (val, index) => (
                 (userId === val.info.user_id) && 
                <div key={index} className='item-container' onClick={()=>visitProduct(val.info.id)}>
                    {val.images?.length > 0 ? 
                    <img src={"http://localhost:8080/" + val.images[0].img_path} className='item-image'/> :
                    <img src="http://localhost:8080/uploads/default.jpg" className='item-image'/>}
                   
                    <div className="item-date">{getLocalDate(val.info.publish_date)}</div>
                    <div className="item-title">{val.info.title}</div>
                    <div className="item-bid">Entry bid: <b>{val.info.starting_bid}$</b></div>
                    <div className="item-nav-buttons">
                        {val.info.isSold ? 
                            <button  style={{backgroundColor:"red"}} disabled><b>Sold</b></button> :
                            <button><b>View Product</b></button>
                        }
                    </div>
                </div>
            
            ))}
        </div>
    );
}

export default UserProducts;
