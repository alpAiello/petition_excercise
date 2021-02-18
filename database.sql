DROP TABLE signatures;
CREATE TABLE signatures(
    id SERIAL PRIMARY KEY, 
    firstname VARCHAR(200), 
    lastname VARCHAR(200), 
    signature TEXT);
SELECT * FROM signatures;