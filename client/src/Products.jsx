import { useState, useEffect } from 'react'
import axios from "axios"
import { useNavigate } from "react-router"
import useItems from './useProducts.jsx'
import './products.css';



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


function Products() {


    const {itemData, userId} = useItems();

    const navigate = useNavigate();

    const visitProduct = (id) => {
        navigate(`/product/${id}`);
    }

    

    return (
        <div className='item-page-wrap'>
        <div className='item-page-container'>
            {[...itemData].reverse().map( (val, index) => (
                 ((userId === null || userId !== val.info.user_id) && !Boolean(val.info.isSold)) && 
                <div key={index} className='item-container' onClick={()=>visitProduct(val.info.id)}>
                    {val.images?.length > 0 ? 
                    <img src={"http://localhost:8080/" + val.images[0].img_path} className='item-image'/> :
                    <img src="http://localhost:8080/uploads/default.jpg" className='item-image'/>}
                   
                    <div className="item-date">{getLocalDate(val.info.publish_date)}</div>
                    <div className="item-title">{val.info.title}</div>
                    <div className="item-bid">Entry bid: <b>{val.info.starting_bid}$</b></div>
                    <div className="item-nav-buttons">
                        <button><b>View Product</b></button>
                    </div>
                </div>
            
            ))}
        </div>
        </div>
    );
}

export default Products;
