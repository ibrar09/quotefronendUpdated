// services/finance.service.js
import Finance from '../models/finance.js';

const financeService = {
  
  // 🔹 Create a new finance record
  createFinanceRecord: async (data) => {
    const record = await Finance.create(data);
    return record;
  },

  // 🔹 Get all finance records
  listFinanceRecords: async () => {
    return await Finance.findAll({ order: [['invoice_date', 'DESC']] });
  },

  // 🔹 Get a single finance record by invoice_no
  getFinanceByInvoiceNo: async (invoice_no) => {
    return await Finance.findByPk(invoice_no);
  },

  // 🔹 Update a finance record
  updateFinance: async (invoice_no, data) => {
    const record = await Finance.findByPk(invoice_no);
    if (!record) throw new Error('Finance record not found');
    await record.update(data);
    return record;
  },

  // 🔹 Delete a finance record
  deleteFinance: async (invoice_no) => {
    const deleted = await Finance.destroy({ where: { invoice_no } });
    if (!deleted) throw new Error('Finance record not found');
    return true;
  },

  // 🔹 Search finance records (filter by PO, status, date range, etc.)
  searchFinance: async (filters) => {
    const { po_no, invoice_status, from_date, to_date } = filters;
    const where = {};

    if (po_no) where.po_no = po_no;
    if (invoice_status) where.invoice_status = invoice_status;
    if (from_date && to_date) {
      where.invoice_date = {
        // Sequelize operators are needed
        // We'll use dynamic import of Op
        [await import('sequelize').then(m => m.Op).then(Op => Op.between)]: [from_date, to_date]
      };
    }

    return await Finance.findAll({ where, order: [['invoice_date', 'DESC']] });
  }

};

export default financeService;
