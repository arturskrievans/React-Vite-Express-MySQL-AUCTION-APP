import express from "express";
import cors from "cors";
import session from "express-session";
import bcrypt from 'bcrypt';
import multer  from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { createServer } from "http";
import { Server } from "socket.io";

import { getUserByUsername, getUserByEmail, saveUser, getMessages,
    saveMessage, saveItem, saveImage, getItemData, getAllItems, saveBid,
     getAllItemBids, removeBid, removeItem, getAllUserBids, flipBidState,
      bidExists, setBidWinner, sellItem, removeUser, getUserItemId, getAllPurchases } from "./db.js";

const app = express();
const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true 
};



const sessionMiddleware = session({
  secret: 'abc123~',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,        // Only HTTP for development
    sameSite: 'lax',
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4(); 
    const extension = file.originalname.substring(file.originalname.lastIndexOf('.'));
    cb(null, uniqueSuffix + extension);
  }
});
 
const upload = multer({ storage: storage });

app.use(cors(corsOptions));
app.use(express.json());

app.use(sessionMiddleware);
app.use('/uploads', express.static('uploads'));

const httpServer = createServer(app);
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next); // express middleware -> socketio middleware


const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

io.use(wrap(sessionMiddleware));

io.on("connection", async (socket) => {

    const session = socket.request.session;
    let user = null;

    if (session.username) {
        user = await getUserByUsername(session.username);
    }     

    socket.on("send_message", async (message)=> {
        const res = await saveMessage(user.id, message);
        io.emit("receive_message", res);
    }); 

    socket.on("send_itemId", async (itemId) => {
        const itemData = await getItemData(itemId);
        io.emit("receive_item", itemData);
    })

    socket.on("send_removeItem", async (id) => {
        await removeItem(id);

        io.emit(`receive_removeItem/${id}`);
        io.emit("receive_removeItem", id);
    })

    socket.on("send_bid", async (bid)=> {

        socket.join(`item/${bid.item_id}`);

        const bidData = await saveBid(bid);
        io.emit(`receive_bid/${bid.item_id}`, bidData);

    })

    socket.on("join_item_room", (item_id)=> {
        socket.join(`item/${item_id}`);
    })

    socket.on("send_itemSold", async (user_id, item_id) => {

        const {buyer_balance, seller_id, seller_balance} = await sellItem(user_id, item_id);

        io.to(`item/${item_id}`).emit("receive_itemSold", user_id, item_id);

        io.emit(`receive_user/${user_id}/balance_update`, buyer_balance);
        io.emit(`receive_user/${seller_id}/balance_update`, seller_balance);

        io.emit(`receive_item/${item_id}/sold`, user_id, item_id);
        io.emit('receive_itemSold_public', item_id);
    })

    socket.on("send_bidWinner", async (user_id, item_id) => {
        await setBidWinner(user_id, item_id);
        io.emit(`receive_user/${user_id}/bid_winner`, item_id);
    })

    socket.on("send_removeBid", async (user_id, item_id) => {
        await removeBid(user_id, item_id);
        io.emit(`receive_removeBid/${item_id}`, user_id, item_id);
    })

    socket.on("send_flipBid", async (id) => {
        await flipBidState(id);
        io.emit(`receive_flipBid/${id}`);
    })

    socket.on("send_removeUser", async (id) => {

        const items = await getUserItemId(id);
        items.forEach((item)=> {
            io.to(`item/${item.id}`).emit('receive_removeBid', item.id);
            io.emit(`receive_itemRemoved/${item.id}`);
        });

        await removeUser(id);

        io.emit("receive_removeUser", id);

    })

});

app.post("/api/register", async (req, res) => {
    const { username, email, pswd, pswdConfirm } = req.body;
    if (username.includes("@")) {
        res.json({ status: "error", message: "Username cannot include @ symbol!" });
    } else if (pswd !== pswdConfirm) {
        res.json({ status: "error", message: "Passwords don't match!" });
    } else if (await getUserByUsername(username)){
        res.json({ status: "error", message: "Username was taken!" });
    } else if (await getUserByEmail(email)) {
        res.json({ status: "error", message: "Email was taken!" });
    } else {
        await saveUser(username, email, pswd);
        req.session.username = username;
        res.json({ status: "success", link: `/user/${username}`})
    }
});

app.post("/api/login", async (req, res) => {
    const { credentials, pswd } = req.body;
    let user = await getUserByUsername(credentials);

    if (user === null) {
        user = await getUserByEmail(credentials);
    }
    if (user === null) {
        res.json({ status: "error", message: "Invalid login details"});
    } else {
        if ( await bcrypt.compare(pswd, user.pswd)) {
            req.session.username = user.username;
            res.json( {status: "success", link: `/user/${user.username}`} );
        } else {
            res.json({ status: "error", message: "Invalid login details"});
        }
    }
})

app.get("/api/authenticate/:username", (req, res) => {
    const username = req.params.username;
    if (!req.session.username || req.session.username !== username) {
        res.json({ status: "error", link: `/` });
    } else {
        res.json({ status: "success" });
    }
});

app.get("/api/username", (req, res) => {
    if (req.session.username) {
        res.json({ status: "success", username: req.session.username });
    } else {
        res.json({ status: "error" });
    }
})

app.get("/api/user", async (req, res)=> {
    if (!req.session.username) {
        return res.json({status: "error"});
    }
    const user = await getUserByUsername(req.session.username);
    return res.json({status:"success", user:user});
})

app.get("/api/messages", async (req, res) => {
    const messages = await getMessages();
    res.json(messages);
})

app.post("/api/logout", (req, res) => {
    req.session.destroy( err => {
        if (!err) {
            res.clearCookie("connect.sid"); 
            return res.json({ status: "ok", message: "Logged out successfully" });
        }
        return res.status(500).json({ status: "error", message: "Failed to logout" });
    })
});

app.post("/api/:username/upload", upload.array("images", 5), async (req, res) => {
   
    const { title, bid, description } = req.body;
    const images = req.files;

    const user = await getUserByUsername(req.session.username);
    const item_id = await saveItem(user.id, title, description, bid);

    const saveImages = async () => {
        for (const image of images) {
            const fullPath = "uploads/" + image.filename;
            await saveImage(item_id, fullPath);
        }
    }
    await saveImages();

    res.json({itemId: item_id});
}) 

app.get("/api/items", async (req, res) => {
    const itemData = await getAllItems();
    res.json(itemData);
})

app.get("/api/product/:id", async (req, res) => {
    const id = req.params.id;
    const itemData = await getItemData(id);
    if (!itemData?.info) {
        res.json({status:"error"});
    } else {
        res.json({status:"success", itemData:itemData});
    }
})

app.get("/api/product/:id/bid", async (req, res) => {
    const id = req.params.id;
    const bidData = await getAllItemBids(id);
    res.json(bidData);
}) 

app.get("/api/user/:id/bid", async (req, res) => {
    const id = req.params.id;
    const bidData = await getAllUserBids(id);
    res.json(bidData);
}) 

app.post("/api/confirm_password", async (req, res) => {
    const { password } = req.body;
    const username = req.session.username;
    const user = await getUserByUsername(username);
    if ( await bcrypt.compare(password, user.pswd)) {

        req.session.destroy((err)=>{
            if (!err) {
                res.clearCookie("connect.sid"); 
            }
            res.json({status:"success"});
        })

    } else {
        res.json({status:"error"});
    }
})

app.post("/api/product/:id/bid_exists", async (req, res) => {
    const id = req.params.id;
    const {username} = req.body;
    const bidData = await bidExists(id, username);
    if (bidData) {
        res.json({status:"success", user_id: bidData.user_id});
    } else {
        res.json({status:"error"});
    }
})

app.get("/api/user/:id/purchases", async (req, res) => {
    const user_id = req.params.id;
    const itemData = await getAllPurchases(user_id);
    res.json(itemData);
})

httpServer.listen(8080, () => {
  console.log("Server running on port 8080");
});

