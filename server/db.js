import mysql from 'mysql2'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getMessages() {
    const [rows] = await pool.query(`
        SELECT messages.* , users.username
        FROM messages  
        LEFT JOIN users ON messages.user_id = users.id  
        ORDER BY publish_date asc
        LIMIT 100
    `)
    return rows;
}

export async function saveMessage(user_id, message) {
    const [result] = await pool.query(`
        INSERT INTO messages (user_id, message_content)
        VALUES (?, ?)
    `, [user_id, message])

    const id = result.insertId;
    const [rows] = await pool.query(`
        SELECT messages.* , users.username 
        FROM messages
        JOIN users ON messages.user_id = users.id
        WHERE messages.id = ?
    `, [id])
    return rows[0];
}

export async function getUserByEmail(email) {
    const [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE email = ?
    `, [email])
    return rows[0] || null;
}

export async function getUserByUsername(username) {
    const [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE username = ?
    `, [username])
    return rows[0] || null;
}

export async function saveUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(`
        INSERT INTO users (username, email, pswd)
        VALUES (?, ?, ?)    
    `, [username, email, hashedPassword])
}

export async function saveItem(user_id, title, description, starting_bid) {
    const [result] = await pool.query(`
        INSERT INTO items (user_id, title, description, starting_bid)
        VALUES (?, ?, ?, ?)
    `, [user_id, title, description, starting_bid])
    return result.insertId;
}

export async function saveImage(item_id, img_path) {
    await pool.query(`
        INSERT INTO itemimages (item_id, img_path)
        VALUES (?, ?) 
    `, [item_id, img_path])
}

export async function getItemData(item_id) {

    const itemData = {};

    const [item_rows] = await pool.query(`
        SELECT * 
        FROM items 
        WHERE id = ?
    `, [item_id])
 
    const [image_rows] = await pool.query(`
        SELECT *
        FROM itemimages
        WHERE item_id = ?
    `, [item_id])
    
    itemData.info = item_rows[0] || null;
    itemData.images = image_rows || null;
    return itemData;
}

export async function getAllItems() {

    const itemData = [];
    const [item_rows] = await pool.query(`
        SELECT *
        FROM items
    `)
    
    const saveData = async () => {
        for (const item of item_rows) {
            const itemObject = {};
            const image_rows = await getImages(item.id);
            itemObject.info = item;
            itemObject.images = image_rows;

            itemData.push(itemObject);
        }
    }
    const getImages = async (item_id) => {
        const [image_rows] = await pool.query(`
            SELECT *
            FROM itemimages
            WHERE item_id = ?
        `, [item_id])
        return image_rows || null;
    };
    await saveData();


    return itemData;
}

export async function getAllPurchases(user_id) {

    const itemData = []; 
    const [item_rows] = await pool.query(` 
        SELECT items.*
        FROM items
        JOIN bids on bids.item_id = items.id
        WHERE items.isSold = 1 and bids.user_id = ?
    `, [user_id])

    const saveData = async () => {
        for (const item of item_rows) {
            const itemObject = {};
            const image_rows = await getImages(item.id);
            itemObject.info = item;
            itemObject.images = image_rows;

            itemData.push(itemObject);
        }
    }
    const getImages = async (item_id) => {
        const [image_rows] = await pool.query(`
            SELECT *
            FROM itemimages
            WHERE item_id = ?
        `, [item_id])
        return image_rows || null;
    };

    await saveData();
    return itemData;

}

export async function getUserItemId(id) { //get ids to remove all items when user gets deleted
    const [rows] = await pool.query(`
        SELECT id
        FROM items
        WHERE user_id = ? and isSold = 0
    `, [id])
    return rows;
}

export async function saveBid({user_id, item_id, bid}) {
    await pool.query(`
        INSERT INTO bids (user_id, item_id, bid)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        bid = VALUES(bid)
    `, [user_id, item_id, bid])

    const [rows] = await pool.query(
        `SELECT bids.*, users.username 
        FROM bids 
        JOIN users ON users.id = bids.user_id
        WHERE user_id = ? AND item_id = ?
        ` ,[user_id, item_id]);
    return rows[0];
}

export async function setBidWinner(user_id, item_id) {
    await pool.query(`
        UPDATE bids
        SET winner = 1
        WHERE user_id = ? and item_id = ?
    `, [user_id, item_id])
}

export async function getAllItemBids(id) {
    const [rows] = await pool.query(`
        SELECT bids.*, users.username
        FROM bids
        JOIN users on users.id = bids.user_id
        WHERE bids.item_id = ?
        ORDER BY bids.bid desc
        LIMIT 10
    `, [id])

    return rows;
}

export async function getAllUserBids(id) {
    const [rows] = await pool.query(`
        SELECT bids.*, items.title, items.isSold
        FROM bids
        JOIN items on items.id = bids.item_id
        WHERE bids.user_id = ?
    `, [id])
    return rows;
}

export async function flipBidState(id) {
    await pool.query(`
        UPDATE Items
        SET activeBid = 1-activeBid
        WHERE id = ?
    `, [id])
}

export async function bidExists(item_id, username) {
    const [user] = await pool.query(`
        SELECT id
        FROM users
        WHERE username = ?
    `, [username])

    if (!user[0]) {
        return false;
    }
    const user_id = user[0].id;

    const [rows] = await pool.query(`
        SELECT *
        FROM bids
        WHERE user_id = ? and item_id = ?
    `, [user_id, item_id])
    
    return rows[0] || null;

}

export async function sellItem(user_id, item_id) {
    await pool.query(`
        UPDATE items
        SET isSold = 1
        WHERE id = ? 
    `, [item_id])
    

    await pool.query(`
        DELETE FROM bids
        WHERE user_id <> ? and item_id = ?
    `, [user_id, item_id])

    await pool.query(`
        UPDATE users
        JOIN bids on bids.user_id = users.id
        SET users.balance = users.balance - bids.bid
        WHERE users.id = ? AND bids.item_id = ?
    `, [user_id, item_id])
    
    await pool.query(`
        UPDATE users
        JOIN items on users.id = items.user_id
        SET users.balance = users.balance + (
            SELECT bid
            FROM bids
            WHERE user_id = ? AND item_id = ?
        )
        WHERE items.id = ?
    `, [user_id, item_id, item_id])

    const [buyer_rows] = await pool.query(`
        SELECT balance
        FROM users
        WHERE id = ?
    `, [user_id])
    
    const [seller_rows] = await pool.query(`
        SELECT users.id, users.balance 
        FROM users
        JOIN items ON items.user_id = users.id
        WHERE items.id = ?
    `, [item_id]);

    return {
        buyer_balance: buyer_rows[0]?.balance,
        seller_id: seller_rows[0]?.id,
        seller_balance: seller_rows[0]?.balance 
    }
}

export async function removeBid(user_id, item_id) {
    await pool.query(`
        DELETE FROM bids
        WHERE user_id = ? and item_id = ?
    `, [user_id, item_id])
}

export async function removeItem(id) {
    await pool.query(`
        DELETE FROM items
        WHERE id = ?
    `, [id])
}

export async function removeUser(id) {
    await pool.query(`
        DELETE FROM items
        WHERE user_id = ? and isSold = 0
    `, [id])
    await pool.query(`
        DELETE FROM users
        WHERE id = ?
    `, [id])
}