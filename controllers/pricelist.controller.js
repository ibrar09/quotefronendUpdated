import priceListService from '../services/pricelist.service.js';
import { Op } from 'sequelize';
import { PriceList } from '../models/index.js';

export const createPriceItem = async (req, res) => {
  try {
    const item = await priceListService.createPriceItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllPriceItems = async (req, res) => {
  try {
    const items = await priceListService.getAllPriceItems();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPriceItemByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const item = await priceListService.getPriceItemByCode(code);
    if (!item) return res.status(404).json({ success: false, message: 'Price item not found' });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePriceItem = async (req, res) => {
  try {
    const { code } = req.params;
    const updated = await priceListService.updatePriceItem(code, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deletePriceItem = async (req, res) => {
  try {
    const { code } = req.params;
    await priceListService.deletePriceItem(code);
    res.status(200).json({ success: true, message: 'Price item deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const searchPriceLists = async (req, res) => {
  try {
    const { q } = req.query;
    const items = await PriceList.findAll({
      where: {
        [Op.or]: [
          { code: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: 20
    });

    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

