// routes/storeRoutes.js
import express from 'express';
import { 
  createStore, 
  getStores, 
  getStore, 
  updateStore, 
  deleteStore 
} from '../controllers/storeController.js';

const router = express.Router();

// CRUD routes
router.post('/', createStore);          // Create
router.get('/', getStores);             // Get all
router.get('/:ccid', getStore);         // Get one
router.put('/:ccid', updateStore);      // Update
router.delete('/:ccid', deleteStore);   // Delete

export default router;
