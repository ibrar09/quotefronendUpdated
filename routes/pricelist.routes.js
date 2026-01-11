import express from 'express';
import {
  createPriceItem,
  getAllPriceItems,
  getPriceItemByCode,
  updatePriceItem,
  deletePriceItem,
  searchPriceLists
} from '../controllers/pricelist.controller.js';

const router = express.Router();

router.post('/', createPriceItem);          // POST /api/pricelist
router.get('/', getAllPriceItems);         // GET all
router.get('/search', searchPriceLists);   // GET search
router.get('/:code', getPriceItemByCode);  // GET single
router.put('/:code', updatePriceItem);     // PUT
router.delete('/:code', deletePriceItem);  // DELETE

export default router;
