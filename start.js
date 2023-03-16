#!/usr/bin/env node
const { spawn, fork } = require('child_process');

console.log('STARTING MONGODB');
const mongoProcess = fork("./mongo.js");

mongoProcess.on('message', ({ MONGODB_URI }) => {
    console.log('MongoDB is running on uri: ', MONGODB_URI);

    // set MONGODB_URL in process.env for child process
    process.env.MONGODB_URI = MONGODB_URI;
    const gateway = spawn('npm run start', { stdio: "inherit", shell: true })
})
