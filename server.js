const mineflayer = require('mineflayer')
const k8s = require('./k8s')

/**
 * Create a bot that will join the server
 */
const bot = mineflayer.createBot({
  host: process.env.MINECRAFT_SERVER_HOST || 'localhost',
  username: 'demogorgon',
  auth: 'offline',
  port: process.env.MINECRAFT_SERVER_PORT || 8080
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)

const express = require('express')
const session = require('express-session');
const app = express()
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));
const port = 8082

/**
 * Relay a message to a user's bot. The bot name will be retrieved from the user's session cookie.
 * format: { "message": "message" }
 */
app.post('/message', (req, res) => {
  if (req.body.message && req.session.botName) {
    console.log(`new message to ${req.session.botName}: ${req.body.message}`);
    bot.whisper(req.session.botName, req.body.message);
  }

  res.send({"status": "ok"});
})

/** 
 * Schedule a new bot to join the server
 */
app.get('/join', (req, res) => {
  console.log(`new request to join from ${JSON.stringify(req.query.name)}`);
  if (req.session.botName) {
    console.log("Dude, you already have a bot!");
  } else {
    let name = k8s.createBot(req.query.name);
    name.then((botName) => {
        req.session.botName = botName;
        res.send({botName: req.session.botName});
    });
  }
})

app.get('/', function(req, res){
    if (req.session.botName) {
        res.sendFile(__dirname + '/play.html');
    } else {
        res.sendFile(__dirname + '/join.html');
    }
});

app.listen(port, () => {
  console.log(`Demogorgon listening... always listening on port ${port}`)
})