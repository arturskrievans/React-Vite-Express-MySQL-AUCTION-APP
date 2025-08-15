import { useState, useEffect } from 'react';
import axios from 'axios';
import socket from './socket.jsx';
import {useLogin} from './LoginContext.jsx'

function useItems() {



    const [itemData, setItemData] = useState([]);
    const [userId, setUserId] = useState(null);
    const { user, setUser } = useLogin();

    
    useEffect( ()=> {
        setUserId(user?.id);
    }, [user])

    useEffect(() => {
        const getItems = async () => {
            const res = await axios.get("http://localhost:8080/api/items", { withCredentials: true });
            const itemData = res.data;
            itemData.sort((a, b) => a.info.isSold - b.info.isSold);
            setItemData(itemData);
        };
        getItems();
    }, []);

    useEffect(() => {
        const handleReceive = (data) => {
            setItemData((prev) => [data, ...prev]);
        };
        socket.on("receive_item", handleReceive);
        return () => {
            socket.off("receive_item", handleReceive);
        };
    }, []);

    useEffect(() => {

        const handleRemoveItem = (id) => {
            setItemData(prev=>prev.filter((item)=>item.info.id!==id));
        };

        socket.on("receive_removeItem", handleRemoveItem);
        return () => {
            socket.off("receive_removeItem", handleRemoveItem);
        };
    }, [itemData]);

    useEffect( ()=> {
    
        const handleItemSold = (item_id) => {
            setItemData(prev=> {
                const updated = [...prev];
                for (let i = 0; i < updated.length; ++i) {
                    if (updated[i].info.id === item_id) {
                        updated[i].info.isSold = 1;
                        break;
                    }
                }
                return updated;
            });
        }
        socket.on('receive_itemSold_public', handleItemSold);

        return ()=> {
            socket.off('receive_itemSold_public', handleItemSold);
        }

    }, [itemData]);

    useEffect( ()=> {

        const handleRemoveUser = (id) => {
            setItemData(prev=>prev.filter((item)=>item.info.isSold || item.info.user_id!==id));
        }

        socket.on('receive_removeUser', handleRemoveUser);

        return ()=> {
            socket.off('receive_removeUser', handleRemoveUser);
        }

    }, [itemData])

    return {
        itemData: itemData,
        userId: userId
    };
}


export default useItems;