import PurchaseOrder from '../models/purchaseorder.js';

const purchaseOrderService = {

  // 🔹 Create a new PO
  createPO: async (data) => {
    const po = await PurchaseOrder.create(data);
    return po;
  },

  // 🔹 Get all POs
  getAllPOs: async () => {
    return await PurchaseOrder.findAll({ order: [['po_date', 'DESC']] });
  },

  // 🔹 Get single PO by PO number
  getPOByNumber: async (po_no) => {
    return await PurchaseOrder.findByPk(po_no);
  },

  // 🔹 Update PO
  updatePO: async (po_no, data) => {
    const po = await PurchaseOrder.findByPk(po_no);
    if (!po) throw new Error('Purchase Order not found');
    await po.update(data);
    return po;
  },

  // 🔹 Delete PO
  deletePO: async (po_no) => {
    const deleted = await PurchaseOrder.destroy({ where: { po_no } });
    if (!deleted) throw new Error('Purchase Order not found');
    return true;
  },

  // 🔹 Search POs
  searchPOs: async (query) => {
    const { po_no, job_id } = query;
    const where = {};
    if (po_no) where.po_no = po_no;
    if (job_id) where.job_id = job_id;

    return await PurchaseOrder.findAll({ where, order: [['po_date', 'DESC']] });
  }

};

export default purchaseOrderService;
