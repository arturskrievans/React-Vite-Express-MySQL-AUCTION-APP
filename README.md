# React Vite + Express JS + MYSQL full stack website

<h2>Setup:</h2><br>
1. Install both <a href="https://nodejs.org/en/download">Node Js</a> and <a href="https://dev.mysql.com/downloads/installer/">MySQL</a> <br>
2. Configure MySQL by following all the setup steps and providing a secure password to your server. Verify the installation by connecting to MySQL via terminal - "mysql -u root -p" (windows). 
Once a succesfull connection is established, run "CREATE DATABASE auction_app;" to setup the necessary data model. <br>
3. Install the dependencies - open your terminal, go to the project folder. Then do "npm install" under both folders: /client and /server. <br>
4. Create a .env file in /server directory. Populate the file with the following information: <br>
  MYSQL_HOST='127.0.0.1' <br>
  MYSQL_USER='root' <br>
  MYSQL_PASSWORD='my_passwrd'  # your actual password <br>
  MYSQL_DATABASE='auction_app' <br>
5. First start the server: "npm run dev" and then do the same with client.


