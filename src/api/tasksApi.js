import apiClient from './config.js';

const tasksApi = {
  getAll() {
    return apiClient.get('/tasks');
  },

  create(title, priority = 'normal', imgAttachmentKey = null, locationPayload = null) {
    const data = { title, priority, ...locationPayload };
    if (imgAttachmentKey) data.img_attachment_key = imgAttachmentKey;
    return apiClient.post('/tasks', data);
  },

  update(id, data) {
    return apiClient.patch(`/tasks/${id}`, data);
  },

  remove(id) {
    return apiClient.delete(`/tasks/${id}`);
  },

  uploadImage(file, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    return apiClient.post('/uploads/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default tasksApi;
