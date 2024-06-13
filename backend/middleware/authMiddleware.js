const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const asyncHandler = require('express-async-handler')

const checkLoggedIn = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
            req.user = await userModel.findById(decodeToken.id).select("-password")
            next()
        } catch (error) {
            res.status(401)
            throw new Error("Token failed, not authorised")
        }
    }
    if (!token) {
        res.status(401)
        throw new Error("No token")
    }
})

module.exports = {checkLoggedIn}
