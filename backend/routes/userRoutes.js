// //use the express router to have access to the app from this file
// const express = require('express')
// const { getDashboardStats } = require('../controllers/userController')
// const jwt = require('jsonwebtoken')
// const UserAuth = require('../models/authModel')

// const router = express.Router()
// const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key'

// // Authentication middleware
// const authenticateUser = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization')?.replace('Bearer ', '')
        
//         if (!token) {
//             return res.status(401).json({ error: 'Please authenticate.' })
//         }

//         const decoded = jwt.verify(token, SECRET_KEY)
//         const user = await UserAuth.findById(decoded.id).select('-password')

//         if (!user) {
//             return res.status(401).json({ error: 'Please authenticate.' })
//         }

//         req.user = user
//         next()
//     } catch (error) {
//         res.status(401).json({ error: 'Please authenticate.' })
//     }
// }

// //GET the user
// router.get('/users/:id', (req, res) => {
//     res.json({mssg: "GET user"})
// })

// //PUT(update) the user
// router.put('/users/:id', (req, res) => {
//     res.json({mssg: "PUT (update) user"})
// })

// // Protected routes
// router.get('/dashboard', authenticateUser, getDashboardStats)

// module.exports = router