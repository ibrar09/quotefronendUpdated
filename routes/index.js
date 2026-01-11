import express from 'express';
import quotationRoutes from './quotation.routes.js';
import jobItemRoutes from './jobitem.routes.js';
import priceListRoutes from './pricelist.routes.js'; // ✅ import the price list routes
import financeRoutes from './finance.routes.js';     // ✅ optional: add finance routes if you create them
import purchaseOrderRoutes from './purchaseorder.routes.js';
import storeRoutes from './storeRoutes.js';
import pdfRoutes from './pdf.routes.js';
import masterRoutes from './master.routes.js';
const router = express.Router();

// 🔹 Mount all routes
router.use('/quotations', quotationRoutes);
router.use('/jobitems', jobItemRoutes);
router.use('/pricelist', priceListRoutes);
router.use('/pdf', pdfRoutes);
router.use('/finance', financeRoutes); // optional
router.use('/purchaseorders', purchaseOrderRoutes);
router.use('/stores', storeRoutes);
router.use('/master', masterRoutes);
// 🔹 Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API running' });
});

export default router;
