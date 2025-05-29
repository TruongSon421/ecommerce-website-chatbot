import axios from '../config/axios';
import { User, Address } from '../types/auth';

const userService = {
  getUserDetails: async (userId: number): Promise<User> => {
    const response = await axios.get<User>('/users/me', {
      headers: { 'X-Auth-UserId': userId },
    });
    return response.data;
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    const response = await axios.put<User>('/users/me', userData, {
      headers: { 'X-Auth-UserId': userId },
    });
    return response.data;
  },

  addAddress: async (userId: number, address: Address): Promise<Address> => {
    const response = await axios.post<Address>('/users/me/addresses', address, {
      headers: { 'X-Auth-UserId': userId },
    });
    return response.data;
  },

  updateAddress: async (userId: number, addressId: number, address: Address): Promise<Address> => {
    const response = await axios.put<Address>(`/users/me/addresses/${addressId}`, address, {
      headers: { 'X-Auth-UserId': userId },
    });
    return response.data;
  },

  deleteAddress: async (userId: number, addressId: number): Promise<void> => {
    await axios.delete(`/users/me/addresses/${addressId}`, {
      headers: { 'X-Auth-UserId': userId },
    });
  },
};

export default userService;
