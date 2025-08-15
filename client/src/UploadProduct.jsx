import { useState, useEffect } from 'react'
import { useNavigate } from "react-router"
import { useParams } from 'react-router-dom'
import socket from "./socket.jsx"
import authenticate from './authenticate.jsx'
import axios from 'axios'
import './uploadproduct.css'



function UploadProduct() {

    const { username } = useParams();
    authenticate(username);

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [bid, setBid] = useState(0);
    const [description, setDescription] = useState("");

    const [files, setFiles] = useState([]);
    const [filePreview, setFilePreview] = useState([]);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setFiles(prev => [...prev, file]);
        setFilePreview(prev => [...prev, URL.createObjectURL(file)]);
    }

    const handleRemove = (index) => {
        const updatedFiles = [...files];
        const updatedFilePreview = [...filePreview];
        updatedFiles.splice(index, 1);
        updatedFilePreview.splice(index, 1);
        setFiles(updatedFiles);
        setFilePreview(updatedFilePreview);
    }

    const saveItem = async (e) => {

        e.preventDefault();

        const productData = new FormData();
        productData.append("title", title);
        productData.append("bid", bid);
        productData.append("description", description);
        files.forEach((file, index) => {
            productData.append("images", file);  
        });
       
        const res = await axios.post(`http://localhost:8080/api/${username}/upload`, 
             productData ,
            {   withCredentials: true,     
                headers: {
                "Content-Type": "multipart/form-data",
            }
            } 
        );
        const itemId = res.data.itemId;
        socket.emit("send_itemId", itemId);

        navigate(`/product/${itemId}`);
    }

    return (
        <>  
            <div className='sell-item-block'>
                <div className='sell-item-wrap'>
                    <div className='sell-item-intro'>
                        <h2>Sell A New Item</h2>
                    </div>
                    <form onSubmit={saveItem}>
                        <label> Product Title: <br/>
                        <input type="text"
                            value = {title}
                            onChange={(e)=> setTitle(e.target.value)}
                            required/>
                        </label><br/>
                        <label> Starting Bid: [recommended, default 0.00$] <br/>
                        <input type="number"
                            value = {bid}
                            onChange={(e)=> setBid(e.target.value)}
                            min = "0"
                            step="0.01"/>
                        </label><br/>
                        <label> Describe your product <br/>
                        <textarea className="product-description" 
                            placeholder="What Are You Selling...." 
                            maxLength="400"
                            value={description}
                            onChange={(e)=>{setDescription(e.target.value)}}></textarea>
                        </label><br/>
                        <label> Select up to 5 images: <br/>
                        <input type="file" 
                            onChange={handleFileChange} 
                            onClick={(e) => (e.target.value = null)}
                            className='select-file-btn'
                            disabled={files.length >= 5}/> 
                        </label><br/>
                        {files.length >= 5 && 
                            <p className='file-limit'>
                                <b>File Limit Reached</b>
                            </p>
                        } <br/>

                        <div className='image-container'>
                            { filePreview.map( (path, index) => (
                                <div key={index} className='product-container'>
                                    <span className='remove-image' onClick={() => handleRemove(index)}>&#10006;</span>
                                    <img src={path} className='product-image' alt='failed to load'/>
                                </div>
                            ))}
                        </div>

                        <input type="submit" value="Submit" className='list-item-btn'/>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UploadProduct;