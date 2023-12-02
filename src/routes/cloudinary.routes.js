import { Router } from "express";
import userExtractor from "../middleware/userExtractor.js";

import cloudinary from "cloudinary";
import { CLOUDINARY_APIKEY, CLOUDINARY_APISECRET } from "../config.js";

const router = Router();

cloudinary.v2.config({
  cloud_name: "dn8bvip6g",
  api_key: CLOUDINARY_APIKEY,
  api_secret: CLOUDINARY_APISECRET,
  secure: true,
});

router.get("/photo/:name", userExtractor, (req, res) => {
  const codProducto = req.params.name;

  cloudinary.v2.api
    .update(`images/${codProducto}`)
    .then((result) => {
      res.json({
        formato: result.format,
        url: result.url,
        created: result.created_at,
      });
    })
    .catch((error) => {
      res.status(404).json({ message: "Not Found", exits: false });
    });
});

export default router;
