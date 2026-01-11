import financeService from '../services/finance.service.js';

/**
 * 🔹 CREATE FINANCE RECORD
 * POST /api/finance
 */
export const createFinanceRecord = async (req, res) => {
  try {
    const record = await financeService.createFinanceRecord(req.body);
    res.status(201).json({
      success: true,
      message: 'Finance record created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 LIST ALL FINANCE RECORDS
 * GET /api/finance
 */
export const listFinanceRecords = async (req, res) => {
  try {
    const records = await financeService.listFinanceRecords();
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 GET SINGLE FINANCE RECORD
 * GET /api/finance/:invoice_no
 */
export const getFinanceByInvoiceNo = async (req, res) => {
  try {
    const { invoice_no } = req.params;
    const record = await financeService.getFinanceByInvoiceNo(invoice_no);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Finance record not found' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 UPDATE FINANCE RECORD
 * PUT /api/finance/:invoice_no
 */
export const updateFinanceRecord = async (req, res) => {
  try {
    const { invoice_no } = req.params;
    const updated = await financeService.updateFinance(invoice_no, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 DELETE FINANCE RECORD
 * DELETE /api/finance/:invoice_no
 */
export const deleteFinanceRecord = async (req, res) => {
  try {
    const { invoice_no } = req.params;
    await financeService.deleteFinance(invoice_no);
    res.status(200).json({ success: true, message: 'Finance record deleted successfully' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

/**
 * 🔹 SEARCH FINANCE RECORDS
 * GET /api/finance/search
 */
export const searchFinanceRecords = async (req, res) => {
  try {
    const results = await financeService.searchFinance(req.query);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
