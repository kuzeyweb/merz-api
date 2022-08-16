const express = require("express");
const userPath = require('./Routes/user')
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors())
//app.use(cors());
app.use(express.urlencoded({
  extended: true
  }));


// ROUTES
app.use('/users' , userPath);


app.listen(6161)