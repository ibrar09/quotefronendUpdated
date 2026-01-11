import express from 'express';
import {
  createQuotation,
  updateQuotation,
  deleteQuotation,
  getQuotationById,
  listQuotations,
  listIntakes,
  searchQuotations
} from '../controllers/quotation.controller.js';

const router = express.Router();

router.post('/', createQuotation);
router.get('/search', searchQuotations);
router.get('/intakes', listIntakes);
router.get('/', listQuotations);
router.get('/:id', getQuotationById);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);

export default router;
