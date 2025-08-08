const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/upload');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.post(
  '/upload',
  isAuthenticated,
  upload.single('file'),
  fileController.uploadFile
);

router.get('/:id', isAuthenticated, fileController.getFileById);

router.post('/:id/delete', isAuthenticated, fileController.deleteFile);

router.get('/:id/download', isAuthenticated, fileController.downloadFile);

module.exports = router;
