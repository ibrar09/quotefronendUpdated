import express from 'express';
import {
  createFinanceRecord,
  listFinanceRecords,
  getFinanceByInvoiceNo,
  updateFinanceRecord,
  deleteFinanceRecord,
  searchFinanceRecords
} from '../controllers/finance.controller.js';

const router = express.Router();

// 🔹 Routes
router.post('/', createFinanceRecord);           // Create
router.get('/search', searchFinanceRecords);     // Search
router.get('/', listFinanceRecords);            // List all
router.get('/:invoice_no', getFinanceByInvoiceNo); // Get single
router.put('/:invoice_no', updateFinanceRecord);   // Update
router.delete('/:invoice_no', deleteFinanceRecord); // Delete

export default router;
