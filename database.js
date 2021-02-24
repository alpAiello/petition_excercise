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

exports.updateUser = (userID, firstname, lastname, email) => {
  return db.query(
    `
  UPDATE 
      users 
  SET
      firstname = $1,
      lastname = $2, 
      email = $3
  WHERE
      id = $4
  RETURNING *;
  `,
    [firstname, lastname, email, userID]
  );
};

exports.updatePassword = (userID, newHashedPassword) => {
  return db.query(
    `
    UPDATE
        users
    SET
        hashedpassword = $2
    WHERE
        id = $1;
    `,
    [userID, newHashedPassword]
  );
};

exports.upsertProfile = (userID, age, city, homepage) => {
  return db.query(
    `INSERT INTO 
        profiles(user_id, age, city, homepage ) 
    VALUES 
        ($1,$2,$3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET
        age = $2,
        city = $3,
        homepage = $4  
    RETURNING
        age, city, homepage
    ;`,
    [userID, age, city, homepage]
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

exports.getProfile = (userID) => {
  return db.query(
    `
SELECT age, city, homepage 
FROM profiles 
WHERE user_id = $1;`,
    [userID]
  );
};

exports.getUser = (userID) => {
  return db.query(`SELECT * FROM users WHERE id = $1`, [userID]);
};
exports.getUserByEmail = (email) => {
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
