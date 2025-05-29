require('dotenv').config();

const express = require("express");
const mongoose = require('mongoose')
const cors = require('cors');

const authRoutes = require('./routes/authRoutes')
const groupRoutes = require('./routes/groupRoutes')
const memberRoutes = require('./routes/memberRoutes')
const noteRoutes = require('./routes/noteRoutes')
const quizRoutes = require('./routes/quizRoutes')
const resourceRoutes = require('./routes/resourceRoutes')
const sessionRoutes = require('./routes/sessionRoutes')
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
const invitationRoutes = require('./routes/invitationRoutes')

//express app
const app = express()

//middleware
app.use(express.json())
app.use(cors());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
})

//routes
app.use('/api/authRoutes', authRoutes)
app.use('/api/groupRoutes', groupRoutes)
app.use('/api/memberRoutes', memberRoutes)
app.use('/api/noteRoutes', noteRoutes)
app.use('/api/quizRoutes', quizRoutes)
app.use('/api/resourceRoutes', resourceRoutes)
app.use('/api/sessionRoutes', sessionRoutes)
// app.use('/api/user', userRoutes)
app.use('/api/invitations', invitationRoutes)
app.use('/api/adminRoutes', adminRoutes)
app.use('/api/userRoutes', userRoutes)

//connect to Database
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Connected to Database: Listening on port", process.env.PORT);
    })
})
.catch((error) => {
    console.log(error)
})




