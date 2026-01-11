import jobItemService from '../services/jobitem.service.js';

export const createJobItem = async (req, res) => {
  try {
    const jobItem = await jobItemService.createJobItem(req.body);
    res.status(201).json({ success: true, data: jobItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getJobItemsByJobId = async (req, res) => {
  try {
    const { job_id } = req.params;
    const items = await jobItemService.getJobItemsByJobId(job_id);
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getJobItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await jobItemService.getJobItemById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Job Item not found' });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateJobItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await jobItemService.updateJobItem(id, req.body);
    res.status(200).json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteJobItem = async (req, res) => {
  try {
    const { id } = req.params;
    await jobItemService.deleteJobItem(id);
    res.status(200).json({ success: true, message: 'Job Item deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const searchJobItems = async (req, res) => {
  try {
    const results = await jobItemService.searchJobItems(req.query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
