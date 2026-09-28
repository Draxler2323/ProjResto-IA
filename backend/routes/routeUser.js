const express = require("express");

const router = express.Router();

const UserController = require("../controllers/controllerUser");


router.get("/", UserController.getAll);

router.post("/login", UserController.login);

router.get("/:id", UserController.getById);

router.post("/", UserController.create);

router.put("/:id", UserController.update);

router.delete("/:id", UserController.delete);


module.exports = router;