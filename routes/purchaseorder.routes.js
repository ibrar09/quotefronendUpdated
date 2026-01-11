import express from 'express';
import {
  createPO,
  getAllPOs,
  getPOByNumber,
  updatePO,
  deletePO,
  searchPOs
} from '../controllers/purchaseorder.controller.js';

const router = express.Router();

router.post('/', createPO);
router.get('/search', searchPOs);
router.get('/', getAllPOs);
router.get('/:po_no', getPOByNumber);
router.put('/:po_no', updatePO);
router.delete('/:po_no', deletePO);

export default router;
