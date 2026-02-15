import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
import { get_s3_service } from "../utils/dependencies";
import { AWS_S3Controller } from "../controllers/aws_s3.controller";
import { Env } from "../config/env.config";
import path from "path";
import fs from "fs";

const router = Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: Env.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".pdf", ".docx"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  }
});

// Initialize controller
const s3Controller = new AWS_S3Controller();

router.post(
  "/s3/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    return await s3Controller.upload_file(req, res);
  })
);

router.get(
  "/s3/status",
  asyncHandler(async (req, res) => {
    return await s3Controller.check_s3_status(req, res);
  })
);

router.get(
  "/s3/debug",
  asyncHandler(async (req, res) => {
    return await s3Controller.check_s3_status(req, res);
  })
);

router.delete(
  "/s3/:s3_key(*)",
  asyncHandler(async (req, res) => {
    return await s3Controller.delete_file(req, res);
  })
);

router.get(
  "/s3/presign/:s3_key(*)",
  asyncHandler(async (req, res) => {
    return await s3Controller.get_presigned_url(req, res);
  })
);

router.get(
  "/s3/file/:s3_key(*)",
  asyncHandler(async (req, res) => {
    return await s3Controller.download_file(req, res);
  })
);

export default router;

