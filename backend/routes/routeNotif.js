const express = require("express");

const router = express.Router();

const NotificationController = require("../controllers/controllerNotific");

router.get("/", NotificationController.getAll);
router.patch("/:id/lue",NotificationController.markAsRead);
router.get("/:id", NotificationController.getById);
router.post("/", NotificationController.create);
router.put("/:id", NotificationController.update);
router.delete("/:id", NotificationController.delete);

module.exports = router;