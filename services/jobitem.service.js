import { JobItem, Job, PriceList } from '../models/index.js';

const jobItemService = {

  // 🔹 Create a new Job Item
  createJobItem: async (data) => {
    const { job_id, item_code, description, quantity, material_price, labor_price, remarks } = data;

    // Optional: Auto-fill from PriceList if item_code is provided
    let matPrice = material_price || 0;
    let labPrice = labor_price || 0;

    if (item_code) {
      const price = await PriceList.findOne({ where: { code: item_code } });
      if (price) {
        matPrice = price.material_price;
        labPrice = price.labor_price;
      }
    }

    const unitPrice = parseFloat(matPrice) + parseFloat(labPrice);

    const jobItem = await JobItem.create({
      job_id,
      item_code: item_code || null,
      description,
      quantity: quantity || 1,
      material_price: matPrice,
      labor_price: labPrice,
      unit_price: unitPrice,
      remarks
    });

    return jobItem;
  },

  // 🔹 Get all items for a specific Job
  getJobItemsByJobId: async (job_id) => {
    return await JobItem.findAll({
      where: { job_id },
      order: [['createdAt', 'ASC']]
    });
  },

  // 🔹 Get single Job Item by ID
  getJobItemById: async (id) => {
    return await JobItem.findOne({ where: { id } });
  },

  // 🔹 Update Job Item
  updateJobItem: async (id, data) => {
    const jobItem = await JobItem.findOne({ where: { id } });
    if (!jobItem) throw new Error('Job Item not found');

    // Update fields
    const { description, quantity, material_price, labor_price, remarks, item_code } = data;

    let matPrice = material_price ?? jobItem.material_price;
    let labPrice = labor_price ?? jobItem.labor_price;

    // If item_code changed, auto-fill prices
    if (item_code && item_code !== jobItem.item_code) {
      const price = await PriceList.findOne({ where: { code: item_code } });
      if (price) {
        matPrice = price.material_price;
        labPrice = price.labor_price;
      }
    }

    const unitPrice = parseFloat(matPrice) + parseFloat(labPrice);

    await jobItem.update({
      description: description ?? jobItem.description,
      quantity: quantity ?? jobItem.quantity,
      material_price: matPrice,
      labor_price: labPrice,
      unit_price: unitPrice,
      remarks: remarks ?? jobItem.remarks,
      item_code: item_code ?? jobItem.item_code
    });

    return jobItem;
  },

  // 🔹 Delete Job Item
  deleteJobItem: async (id) => {
    const deleted = await JobItem.destroy({ where: { id } });
    if (!deleted) throw new Error('Job Item not found');
    return true;
  },

  // 🔹 Search Job Items by any field
  searchJobItems: async (query) => {
    const { job_id, item_code, description } = query;
    const where = {};

    if (job_id) where.job_id = job_id;
    if (item_code) where.item_code = item_code;
    if (description) where.description = description;

    return await JobItem.findAll({ where });
  }

};

export default jobItemService;
