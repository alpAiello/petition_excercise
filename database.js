const spicedPG = require("spiced-pg");
const db = spicedPG("postgres:alessandroaiello:@localhost:5432/petition")

exports.addSignature = (firstname, lastname, signature) => {
    return db.query(`
        INSERT INTO 
            signatures(signature)
        VALUES 
               ($1,$2,$3)
        RETURNING *;
        `, [firstname, lastname, signature])
}
exports.addUser = (firstname, lastname, email, hashedPassword) => {
    return db.query(`
        INSERT INTO 
            users(firstname, lastname, email, hashedPassword)
        VALUES 
               ($1,$2,$3,$4)
        `, [firstname, lastname, email, hashedPassword])
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
