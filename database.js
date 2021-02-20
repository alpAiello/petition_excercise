const spicedPG = require("spiced-pg");
const db = spicedPG("postgres:alessandroaiello:@localhost:5432/petition")

exports.addSignature = (firstname, lastname, signature) => {
    return db.query(`
        INSERT INTO 
            signatures(firstname, lastname, signature)
        VALUES 
               ($1,$2,$3)
        RETURNING *;
        `, [firstname, lastname, signature])
}
exports.getSigners = () => {
    return db.query(
        `SELECT firstname, lastname FROM signatures`)
}
exports.getSignatures = (userID) => {
    return db.query((`
    SELECT (signature) FROM signatures WHERE id = $1 
    `), [userID])
}
