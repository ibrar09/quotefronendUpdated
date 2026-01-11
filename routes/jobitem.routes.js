import express from 'express';
import {
  createJobItem,
  getJobItemsByJobId,
  getJobItemById,
  updateJobItem,
  deleteJobItem,
  searchJobItems
} from '../controllers/jobitem.controller.js';

const router = express.Router();

router.post('/', createJobItem);
router.get('/job/:job_id', getJobItemsByJobId);
router.get('/:id', getJobItemById);
router.put('/:id', updateJobItem);
router.delete('/:id', deleteJobItem);
router.get('/search', searchJobItems);

export default router;
