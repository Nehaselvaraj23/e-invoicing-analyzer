// src/config/multer.ts
import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  // Get file extension
  const fileExtension = file.originalname.toLowerCase().split('.').pop();
  const allowedExtensions = ['csv', 'json'];
  
  // Check if file has allowed extension
  if (fileExtension && allowedExtensions.includes(fileExtension)) {
    callback(null, true);
  } else {
    callback(new Error(`Invalid file type. Only .csv and .json files are allowed. Got: ${file.originalname}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

export const validateFile = (req: Request, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  next();
};