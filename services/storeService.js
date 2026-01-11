import { Op } from 'sequelize';
import Store from '../models/store.js';

export const createStore = async (data) => {
  return await Store.create(data);
};

export const getAllStores = async () => {
  return await Store.findAll();
};

export const getStoreByCCID = async (oracle_ccid) => {
  // Use case-insensitive search to handle 'ccid001' vs 'CCID001'
  return await Store.findOne({
    where: {
      oracle_ccid: { [Op.iLike]: oracle_ccid }
    }
  });
};

export const updateStore = async (oracle_ccid, data) => {
  const store = await Store.findByPk(oracle_ccid);
  if (!store) throw new Error('Store not found');
  return await store.update(data);
};

export const deleteStore = async (oracle_ccid) => {
  const store = await Store.findByPk(oracle_ccid);
  if (!store) throw new Error('Store not found');
  return await store.destroy();
};
