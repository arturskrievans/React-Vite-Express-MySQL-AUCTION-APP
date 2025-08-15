DROP TABLE IF EXISTS itemImages;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;


CREATE TABLE Users (
    id int NOT NULL AUTO_INCREMENT,
    username varchar(100) NOT NULL UNIQUE,
    email varchar(100) NOT NULL UNIQUE,
    pswd varchar(100) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 10000,
    PRIMARY KEY (id)
);

CREATE TABLE Items (
    id int NOT NULL AUTO_INCREMENT,
    user_id int,
    title varchar(100) NOT NULL,
    description TEXT,
    isSold BOOLEAN DEFAULT 0,
    activeBid BOOLEAN DEFAULT 1,
    starting_bid DECIMAL(10,2) DEFAULT 0,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);

CREATE TABLE Bids (
    user_id int NOT NULL,
    item_id int NOT NULL,
    bid DECIMAL(10,2) NOT NULL,
    winner BOOLEAN DEFAULT 0,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE
);


CREATE TABLE Messages (
    id int NOT NULL AUTO_INCREMENT,
    user_id INT,
    message_content TEXT NOT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),   
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);

CREATE TABLE ItemImages (
    id int NOT NULL AUTO_INCREMENT,
    item_id INT NOT NULL,
    img_path varchar(100),
    PRIMARY KEY (id),   
    FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE
);
