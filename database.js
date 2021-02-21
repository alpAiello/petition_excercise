const spicedPG = require("spiced-pg");
const db = spicedPG("postgres:alessandroaiello:@localhost:5432/petition");

exports.addSignature = (signature) => {
  return db.query(
    `
        INSERT INTO 
            signatures(signature)
        VALUES 
               ($1)
        RETURNING *;
        `,
    [signature]
  );
};
exports.addUser = (firstname, lastname, email, hashedPassword) => {
  return db.query(
    `
        INSERT INTO 
            users(firstname, lastname, email, hashedPassword)
        VALUES 
               ($1,$2,$3,$4)
        `,
    [firstname, lastname, email, hashedPassword]
  );
};

exports.getUser = (email) => {
  return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

exports.getSigners = () => {
  return db.query(`SELECT firstname, lastname FROM users`);
};
exports.getSignatures = (userID) => {
  return db.query(
    `
    SELECT (signature) FROM signatures WHERE id = $1 
    `,
    [userID]
  );
};
