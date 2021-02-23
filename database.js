const spicedPG = require("spiced-pg");
const db = spicedPG("postgres:alessandroaiello:@localhost:5432/petition");

exports.addUser = (firstname, lastname, email, hashedPassword) => {
  return db.query(
    `
        INSERT INTO 
            users(firstname, lastname, email, hashedPassword)
        VALUES 
               ($1,$2,$3,$4)
        RETURNING *
        `,
    [firstname, lastname, email, hashedPassword]
  );
};

exports.addProfile = (age, city, homepage, userID) => {
  return db.query(
    `INSERT INTO 
        profiles(age, city, homepage, user_id) 
    VALUES 
        ($1,$2,$3, $4)
    RETURNING
        age, city, homepage
    ;`,
    [age, city, homepage, userID]
  );
};

exports.addSignature = (signature, userID) => {
  return db.query(
    `
        INSERT INTO 
            signatures(signature, user_id)
        VALUES 
               ($1, $2)
        RETURNING *;
        `,
    [signature, userID]
  );
};

exports.get;

exports.getUser = (email) => {
  return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

exports.getSigners = () => {
  return db.query(`
SELECT 
    firstname, lastname, email, age, city, homepage
From
    signatures 
JOIN
    users 
    ON (signatures.user_id = users.id)
JOIN
    profiles
    ON (profiles.user_id = signatures.user_id);
`);
};

exports.getSignatures = (userID) => {
  return db.query(
    `
    SELECT (signature) FROM signatures WHERE id = $1 
    `,
    [userID]
  );
};
