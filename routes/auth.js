const express = require("express");
const registerController = require("../controllers/register");
const loginController = require("../controllers/login");
const logoutController = require("../controllers/logout");
const chathistoryController = require("../controllers/chathistory");
const route = express.Router();

route.post("/register", registerController.register);
route.post("/login", loginController.login);
route.post("/logout", logoutController.logout);
route.get("/chat-history", chathistoryController.getMessage);

module.exports = route;
