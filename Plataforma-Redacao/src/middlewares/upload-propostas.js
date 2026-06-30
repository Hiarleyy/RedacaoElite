const multer = require("multer")
const path = require("path")
const fs = require("fs")

const dir = path.join(__dirname, "..", "uploads/propostas")

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`
    cb(null, uniqueName);
  },
});

const upload = multer({ storage })

module.exports = upload
