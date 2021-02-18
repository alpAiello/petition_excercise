const spicedPG = require("spiced-pg");
const db = spicedPG("postgres:alessandroaiello:@localhost:5432/petition")

exports.addSignature = (firstName, lastName, signature) => {
    return db.query(`INSERT INTO signatures(
        firstName, 
        lastName, 
        signature)
        VALUES ($1,$2,$3);`, [firstName, lastName, signature])
}