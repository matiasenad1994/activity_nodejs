const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 8;
const JWT_PASSPHRASE = "!@#$%^&*(~~~~1111111ZXCVBNMSDFSDFSDFDIIERE#$%^&*(@#@#@#@";


const auth = require('../middleware/auth');


// HTTP VERBS: GET, POST, PUT/PATCH, DELETE
module.exports = (express, db) => {

    const api =  express.Router();

    api.post('/users/login', async (req, res) => {
        const { name, password } = req.body;

        if(!name && !password) {
            return res.status(200)
                .json({
                    success: true,
                    message: "Fields cannot be empty!"
                });
        }


        const userQuery = 'SELECT * FROM admin WHERE admin_username = ?';
        const rows = await db.query(userQuery, [name]);

        if(rows.length < 0) {
            return res.status(404)
                .json({
                    success: false,
                    message: "User not found"
                });
        }

        const users = [];
        for (let i=0; i < rows.length; i++) {
            users.push({
                id: rows[i].id,
                name: rows[i].admin_username,
                password: rows[i].admin_password
            });
        }
        const hashedPassword = users[0].password;
  
        const samePassword =  await comparePasswords(password, hashedPassword);

        if (!samePassword) {
           return res.json({
               success: false,
               message: "Username/Password is invalid"
           });
        }

        const payload = {
			id: users[0].id,
			name: users[0].name,
			isAuthenticated: true
        };
        
        const token = jwt.sign(payload, JWT_PASSPHRASE, { algorithm: 'HS256'});
        return res.cookie('userToken', token)
                .json({
                    success: true,
                    token: token,
                    id: payload.id,
                    message: "Login successfully"
                });

    
    });



    api.post('/users', async (req, res) => {
        const name = req.body.name;
        const password = req.body.password;
        const confirmPassword = req.body.confirm_password;

        if(password != confirmPassword) {
            return res.status(200)
                .json({
                    success: false,
                    message: "Passwords dont match"
                });
        }

        const query = "SELECT * FROM admin WHERE admin_username = ?;";
        const rows = await db.query(query, [name]);
        if (rows.length > 0) {
            return res.status(200)
                .json({
                    success: false,
                    message: "User already exists."
                });

            }

         const insertQuery = "INSERT INTO `admin`(admin_username,admin_password) VALUES (?,?);";

            const hashedPassword = await hashPassword(password);
        try {
            await db.query(insertQuery, [name,hashedPassword]);
            return res.status(200)
                    .json({
                        success: true,
                        message: "User successfully created"
                    });
        } catch(err) {
            console.log(err);
            return res.status(500)
                    .json({
                        success: false,
                        message: err
                    })
        }
        
     });
        return api;
    };

        async function hashPassword(rawPassword) {
            if (!rawPassword) {
                throw new Error('Password is required');
            }
        
            const hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(rawPassword, SALT_ROUNDS, (err, hash) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(hash);
                });
            });
        
            return hashedPassword;
        }

        async function comparePasswords(rawPassword, hashedPassword) {
            if (!rawPassword) {
                throw new Error('Password is required');
            }
            
            
            const hasSamePassword = await new Promise((resolve, reject) => {
                bcrypt.compare(rawPassword, hashedPassword, (err, isMatch) => {
                    if (err) {
                         return reject(err);
                       
                    }
                    console.log(isMatch);
                    return resolve(isMatch);
                });    
                
            });
        
            return hasSamePassword;
        }

