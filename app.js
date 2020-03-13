const gritty = require('gritty');
const url = require('url');
const http = require('http');
const express = require('express');
const io = require('socket.io');
const cookieParser = require('cookie-parser')
const { config, engine } = require('express-edge');
const bodyParser = require("body-parser");
const cookieEncrypter = require('cookie-encrypter');
const compression = require('compression')
const env  = require('dotenv').config()
config({ cache: process.env.NODE_ENV === 'production' });
const app = express();

const cookieParams = {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 60 * 24,
};


app.use(engine);
app.use(compression())
const server = http.createServer(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SALT));
app.use(cookieEncrypter(process.env.SALT));

app.use('*', (req,res, next) => {
    res.removeHeader('Transfer-Encoding');
    res.removeHeader('X-Powered-By');
    res.removeHeader('Cache-Control');
    return next()
})

app.use(express.static(__dirname + '/public'));
/**
 * @middlewares
 * @function logic block user
 */

const validateAuth = (auth) => {
    const user =  process.env.AUTH_USER;
    const password =  process.env.AUTH_PASSWORD
    if(auth.credential === user && auth.password === password) {
        return true;
    }
    return false;
}


app.get('/logout', (req,res) => {
    res.clearCookie('credential')
    res.clearCookie('token')
    res.redirect('/')
})



app.post('/', (req, res) => {
    const auth = {
        credential : req.body.credential,
        password: req.body.password
    }
    if(validateAuth(auth)) {
        res.cookie('credential', auth.credential)
        res.cookie('token', auth.password)
        return res.redirect('/')
    }
    return res.redirect('/?err=true');
})



app.use('*', (req,res, next) => {
    
    res.removeHeader('Transfer-Encoding');
    res.removeHeader('X-Powered-By');
    res.removeHeader('Cache-Control');
    
     const auth = {
        credential : req.cookies.credential,
        password: req.cookies.token
    }
    if(validateAuth(auth)) {
        return next()
    }
    if(req.baseUrl.includes('.js')) {
        return res.send(`console.log('Request Rejected')`)
    }
    return res.render('auth', {err: req.query.err})
})


const socket = io.listen(server);

gritty.listen(socket, {
    command: 'mc',     
    autoRestart: true, 
});



app.use(engine);
app.set('views', `${__dirname}/views`);

/**
 * @resources
 */

app.get('/', (req, res) => {
    return res.render('console', {path: process.env.BASE_DIR})
}) 



server.listen(process.env.PORT, process.env.HOST, ()=> {
    console.log(`Application listen on http://${process.env.HOST}:${process.env.PORT}`)
} );
