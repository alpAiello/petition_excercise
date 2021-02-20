DROP TABLE signatures;
CREATE TABLE signatures(
    id SERIAL PRIMARY KEY UNIQUE,
    signature TEXT);
CREATE TABLE "user"(
    id SERIAL PRIMARY KEY UNIQUE,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    created_at VARCHAR(255)
                 );
SELECT * FROM signatures;
SELECT * FROM "user";
