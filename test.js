const { Client } = require('ssh2');
require('dotenv').config()
const fs = require('fs')

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

// ,
//   passphrase: process.env.PASSPHRASE,
//   privateKey: fstat.readFileSync("/c/Users/Voik/.ssh/id_ed25519")

const conn = new Client();

conn.on('ready', () => {
conn.exec(`pwd`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
    conn.end();
    resolve("Server stopped")
    })
    .on('keyboard-interactive', function (name, descr, lang, prompts, finish) {
        // For illustration purposes only! It's not safe to do this!
        // You can read it from process.stdin or whatever else...
        var password = process.env.PASSPHRASE
        return finish([password]);
    
        // And remember, server may trigger this event multiple times
        // and for different purposes (not only auth)
    })
    .on('data', (data) => {
    console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
    console.log('STDERR: ' + data);
    reject("Error stopping server")
    });
});
}).connect(ServerConfig)
