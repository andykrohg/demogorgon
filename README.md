# Demogorgon
Server relay for a multi-mineflayer bot environment.

Start the server like this:
```bash
node server.js
```

## Joining the game
```bash
curl 'http://localhost:8082/join' --header 'Content-Type: application/json' --data '{
  "name": "andy",
  "uid": "lksjdf"
}'
```
If successful, the server will respond with your bot's generated name like this:
```bash
{
    "botName": "rhbot_andy"
}
```

## Sending messages to your bot
```bash
curl 'http://localhost:8082/message' --header 'Content-Type: application/json' --data '{
  "botName": "rhbot_andy",
  "message": "build a log cabin"
}'
```
