const { Client } = require('ssh2');
const fs = require("fs")
require('dotenv').config()

const express = require('express');
const cors = require('cors');
const path = require('path')
const app = express();

const StartServerCmd = "docker run --name Campfire_SMP_Testing -d -v ${PWD}/data:/data -p 25565:25565 -e EULA=TRUE -e VERSION=1.20.2 -e TYPE=PAPER --rm itzg/minecraft-server"
const StopServerCmd = "docker stop Campfire_SMP_Testing"

const ServerConfig = {
  host: (process.env.SERVER_HOST === undefined) ? "localhost" : process.env.SERVER_HOST,
  port: 22,
  username: 'root',
  privateKey: fs.readFileSync(process.env.PRIVATE_KEY_ADDR),
  passphrase: process.env.PASSPHRASE
}

const StartServer = () => new Promise((resolve, reject) => {
  const conn = new Client();

  conn.on('ready', () => {
    conn.exec(`cd campfire && ${StartServerCmd}`, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        conn.end();
        resolve("Server started")
      })
      .on('data', (data) => {
        console.log('STDOUT: ' + data);
      }).stderr.on('data', (data) => {
        console.log('STDERR: ' + data);
        conn.end();
        reject("Error starting server")
      });
    });
  }).connect(ServerConfig)
})


const StopServer = () => new Promise((resolve, reject) => {
  const conn = new Client();
  
  conn.on('ready', () => {
    conn.exec(`cd campfire && ${StopServerCmd}`, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        conn.end();
        resolve("Server stopped")
      })
      .on('data', (data) => {
        console.log('STDOUT: ' + data);
      }).stderr.on('data', (data) => {
        console.log('STDERR: ' + data);
        reject("Error stopping server")
      });
    });
  }).connect(ServerConfig)
})

processLock = false

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
});

app.get('/favicon.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/favicon.png'))
});

app.get('/start', cors(), (req, res) => {
  if (processLock = false) {
    res.send("Please wait!")
  }

  console.log("Starting server...")
  processLock = true
  StartServer()
  .then(message => {
    res.send(message)
    processLock = false
  })
  .catch(message => res.send(message))
})

app.get('/stop', cors(), (req, res) => {
  if (processLock = false) {
    res.send("Please wait!")
  }

  console.log("Stopping server...")
  processLock = true
  StopServer()
  .then(message => {
    res.send(message)
    processLock = false
  })
  .catch(message => res.send(message))
})

app.listen(8080, function () {
  console.log('CORS-enabled web server listening on port 8080')
})