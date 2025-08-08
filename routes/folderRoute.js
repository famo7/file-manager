const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { isAuthenticated } = require('../middleware/isAuthenticated');

router.get('/', isAuthenticated, folderController.getAllFolders);
router.get('/new', isAuthenticated, folderController.getNewFolderForm);
router.post('/', isAuthenticated, folderController.createFolder);
router.get('/:id', isAuthenticated, folderController.getFolderById);
router.get('/:id/edit', isAuthenticated, folderController.getEditFolderForm);
router.post('/:id/update', isAuthenticated, folderController.updateFolder);
router.post('/:id/delete', isAuthenticated, folderController.deleteFolder);

module.exports = router;
