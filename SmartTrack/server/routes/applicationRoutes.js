const express = require('express');
const router = express.Router();
const { getApplications, createApplication, updateApplication, deleteApplication, updateApplicationStage } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getApplications);
router.post('/', protect, createApplication);
router.put('/:id', protect, updateApplication);
router.delete('/:id', protect, deleteApplication);
router.put('/:id/stage', protect, updateApplicationStage);

module.exports = router;
