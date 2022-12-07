const router = require("express").Router();
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");

const imageupload = require("../Helpers/Libraries/imageUpload");

const { getAccessToRoute } = require("../Middlewares/Authorization/auth");

dotenv.config({
  path: "./config.env",
});

// Upload image on cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload photo only admin can use
router.post("/uploadPhoto", [getAccessToRoute, imageupload.single("photo")], (req, res) => {
  try {
    cloudinary.v2.uploader.upload(req.file.path, { folder: "HackTheBox/userPhotos" },
      function (error, result) {
        if (error) throw error;

        res.json({ public_id: result.public_id, url: result.secure_url });
      }
      );
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

// Upload image only admin can use
router.post("/uploadImage", [getAccessToRoute, imageupload.single("image")], (req, res) => {
  try {
    cloudinary.v2.uploader.upload(req.file.path, { folder: "HackTheBox/storyImages" },
      function (error, result) {
        if (error) throw error;

        res.json({ public_id: result.public_id, url: result.secure_url });
      }
      );
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

// Delete image only admin can use
router.post("/destroy", (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) return res.status(400).json({ msg: "No images Selected" });

    cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
      if (err) throw err;

      res.json({ msg: "Deleted Image" });
    });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});

module.exports = router;
