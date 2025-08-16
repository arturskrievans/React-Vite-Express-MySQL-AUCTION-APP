# React Vite + Express JS + MYSQL full stack website

<h2>Setup:</h2><br>
1. Install both <a href="https://nodejs.org/en/download">Node Js</a> and <a href="https://dev.mysql.com/downloads/installer/">MySQL</a> <br><br>
2. Configure MySQL by following all the setup steps and providing a secure root password. Verify the installation by connecting to MySQL via terminal - "mysql -u root -p" (windows). 
Once a succesfull connection is established, run "CREATE DATABASE auction_app;" to setup the necessary data model. <br><br>
3. Locate the 'server' directory inside the project folder, open it in terminal. Run "mysql -u root -p auction_app < schema.sql" inside the server directory to finish setting up the data model. <br><br>
4. Install the dependencies - open your terminal, go to the project folder. Do "npm install" under both folders: /client and /server. <br><br>
5. Create a .env file in /server directory. Populate the file with the following information: <br><br>
  MYSQL_HOST='127.0.0.1' <br>
  MYSQL_USER='root' <br>
  MYSQL_PASSWORD='my_password'  # your actual MySQL root password <br>
  MYSQL_DATABASE='auction_app' <br><br>
6. First start the server: "npm run dev" and then do the same with the client under their respective directories - /server and /client. <br><br>
<h2>Backend + Frontend</h2>
<b>Frontend:</b> React + Vite engine and some css for styling. <br><br>
<b>Backend:</b> Express Js + MySQL <br><br>
  <ul>
    <div>
      1) The following table schema was created to support the website's logic: <br><br>
      <img width="620" height="698" alt="auction_model" src="https://github.com/user-attachments/assets/38142a6e-6a83-4ba0-b69f-32ddcf45c1f2" /> <br>
      All tables are connected by foreign key relationships allowing different table entries to be linked and dependant on each other making querying, saving and deleting data a much easier process. <br>
      Sensitive data like passwords are hashed using bcrypt library. <br><br>
    </div>
    <div>
      2) mysql2 library is used in the server side to connect to the auction_app database an allow saving, requesting and deleting data via sql queries. <br><br>
    </div> 
    <div>
      3) Express JS is used to define different API endpoints for HTTP requests from the client side with secure session middleware. Websockets are also integrated for real-time bidding, chatting and item uploading/deleting. Client 
      connects to these endpoints with axios requests or socket.io event listeners accordingly. <br><br>
    </div>
    <div>
      4) Server uses session sid tokens to verify access to protected pages, providing basic security. The token gets created only when a successful login occurs.
    </div>
  </ul> <br>

<h2>Basic functionality:</h2> 
1. User signs up or logs in. <br>
2. A user can either publish products or view other products and bid on them. <br>
3. Item owners can control the bidding process and select one or multiple winners. <br>
4. Bidding notifications appear in real-time in user profiles. Whoever accepts the win first buys the item. <br>
5. Additional functionality like global chat is also available. <br>
<h2>UI</h2> 

<img width="1920" height="954" alt="image"  src="https://github.com/user-attachments/assets/6ad376ff-7cec-4bb6-a4a0-a020d711ddb9" />

<img width="1917" height="948" alt="image"  src="https://github.com/user-attachments/assets/c380b36d-bfb4-4c21-99ce-34eb44f0764b" />

<img width="1920" height="1011" alt="image"  src="https://github.com/user-attachments/assets/6ef840c9-d3c7-4585-9d78-57eb6c4bf86a" />

<img width="1920" height="946" alt="image" src="https://github.com/user-attachments/assets/42eb2602-2661-4216-8554-f47210b3406b" />






 

