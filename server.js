const express = require('express');
const hbs  = require('hbs');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// tell express about hbs.
const partialsPath = path.join(__dirname, 'views/partials');
hbs.registerPartials(partialsPath);

const indexHandler = require('./routes/index.handler')(express);

// set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// middleware
app.use(morgan('tiny'));
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// register our static assets.(CSS,IMAGES,JS)
app.use(express.static(path.join(__dirname, 'public')));

// import database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student'
};
const db = require('./database/db')(dbConfig);
db.connect(); 

// register our API routes.
const userHandler = require('./api/users.handler')(express, db);

// api routes
app.use('/api/v1', userHandler);


// regular routes
app.use('/', indexHandler);


const PORT = process.env.PORT || "8080";
app.listen(PORT, (err) => {
    if (err) {
        throw err;
    }
    console.log(`Server is running on PORT: ${PORT}!`);
});