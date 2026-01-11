import { PriceList } from '../models/index.js';

const priceListService = {

  // 🔹 Create a new price item
  createPriceItem: async (data) => {
    const priceItem = await PriceList.create(data);
    return priceItem;
  },

  // 🔹 Get all price items
  getAllPriceItems: async () => {
    return await PriceList.findAll({ order: [['code', 'ASC']] });
  },

  // 🔹 Get single price item by code
  getPriceItemByCode: async (code) => {
    return await PriceList.findOne({ where: { code } });
  },

  // 🔹 Update price item
  updatePriceItem: async (code, data) => {
    const priceItem = await PriceList.findOne({ where: { code } });
    if (!priceItem) throw new Error('Price item not found');
    await priceItem.update(data);
    return priceItem;
  },

  // 🔹 Delete price item
  deletePriceItem: async (code) => {
    const deleted = await PriceList.destroy({ where: { code } });
    if (!deleted) throw new Error('Price item not found');
    return true;
  },

  // 🔹 Search price items
  searchPriceItems: async (query) => {
    const { code, type, description } = query;
    const where = {};
    if (code) where.code = code;
    if (type) where.type = type;
    if (description) where.description = description;

    return await PriceList.findAll({ where });
  }

};

export default priceListService;
