  
const fetch = require('node-fetch');
const API_BASE_URL = "http://localhost:3000/api/v1";


module.exports = (express) =>{
 const router  = express.Router();

 router.get('', (req, res) =>{

    return res.send('Hello world');
 });

 router.get('/login', (req, res) =>{

    return res.render('login/login', {
        showHeader: false,
        title: "This is the login form"
    })
 });

 router.get("/register", (req, res) => {
    return res.render('register/register', {
        showHeader: false,
        title: "Please register"
    });
});
 return router;
}
function getAllTodos(url, token) {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': "Bearer "+token,
            "Content-Type": "application/json"
        }
    }
    return fetch(url, options);
}