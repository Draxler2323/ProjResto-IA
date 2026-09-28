const express = require("express");

const router = express.Router();

const PlatController = require("../controllers/controllerPlat");
const upload = require("../middleware/upload");

router.get("/", PlatController.getAll);

router.get("/:id", PlatController.getById);

router.post(
    "/",
    upload.single("image"),
    PlatController.create
);

router.put(
    "/:id",
    upload.single("image"),
    PlatController.update
);

router.delete("/:id", PlatController.delete);

module.exports = router;