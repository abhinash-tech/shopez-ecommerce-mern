import api from './api';

export const orderService = {
  getMyOrders: async (page = 1, limit = 10) => {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  placeOrder: async (checkoutData) => {
    const response = await api.post('/orders', checkoutData);
    return response.data;
  }
};
