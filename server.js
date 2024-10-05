const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost',
  username: 'demogorgon',
  auth: 'offline',
  port: 8080,
})

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)

const express = require('express')
const app = express()
app.use(express.json());
const port = 8082

/**
 * Relay a message to a user's bot
 * format: { "botName": "botname", "message": "message" }
 */
app.post('/message', (req, res) => {
  console.log(`new message: ${JSON.stringify(req.body)}`);

  if (req.body.botName && req.body.message) {
    bot.whisper(req.body.botName, req.body.message);
  }

  res.send({"status": "ok"});
})

/** 
 * Schedule a new bot to join the server
 * format: {"name": "name", "uid": "uid"}
 */
app.post('/join', (req, res) => {
  console.log(`new request to join: ${JSON.stringify(req.body)}`);

  // TODO: implement join request

  res.send({"status": "ok"});
})

app.listen(port, () => {
  console.log(`Demogorgon listening... always listening on port ${port}`)
})