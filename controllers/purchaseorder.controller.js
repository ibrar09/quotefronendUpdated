import purchaseOrderService from '../services/purchaseorder.service.js';

export const createPO = async (req, res) => {
  try {
    const po = await purchaseOrderService.createPO(req.body);
    res.status(201).json({ success: true, data: po });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllPOs = async (req, res) => {
  try {
    const pos = await purchaseOrderService.getAllPOs();
    res.status(200).json({ success: true, data: pos });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPOByNumber = async (req, res) => {
  try {
    const { po_no } = req.params;
    const po = await purchaseOrderService.getPOByNumber(po_no);
    if (!po) return res.status(404).json({ success: false, message: 'PO not found' });
    res.status(200).json({ success: true, data: po });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePO = async (req, res) => {
  try {
    const { po_no } = req.params;
    const updated = await purchaseOrderService.updatePO(po_no, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deletePO = async (req, res) => {
  try {
    const { po_no } = req.params;
    await purchaseOrderService.deletePO(po_no);
    res.status(200).json({ success: true, message: 'PO deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const searchPOs = async (req, res) => {
  try {
    const results = await purchaseOrderService.searchPOs(req.query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
