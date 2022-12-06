const express = require('express');

const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.send("express is running")
});


app.listen(3000, function(){
    console.log('listening on port 3000');
});