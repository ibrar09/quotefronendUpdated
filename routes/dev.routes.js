
import express from 'express';
import { seedAdmin } from '../controllers/dev.controller.js';

const router = express.Router();

router.get('/seed-admin', seedAdmin);

export default router;
