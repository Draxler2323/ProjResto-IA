const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        const nomFichier =
            "plat-" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            extension;

        cb(null, nomFichier);
    }
});

const fileFilter = (req, file, cb) => {

    const typesAutorises = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (typesAutorises.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Seules les images JPG, JPEG, PNG et WEBP sont autorisées"
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;