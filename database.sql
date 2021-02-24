DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users(id SERIAL PRIMARY KEY UNIQUE,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashedpassword VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY UNIQUE,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    signature TEXT
                       );

CREATE TABLE profiles(
    id SERIAL PRIMARY KEY UNIQUE,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    age INTEGER NOT NULL,
    city VARCHAR(1000) NOT NULL,
    homepage VARCHAR(1000) NOT NULL
                     );

SELECT * FROM signatures;
SELECT * FROM users;
SELECT * FROM profiles;
