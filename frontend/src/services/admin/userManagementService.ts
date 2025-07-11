// services/userService.ts
import ENV from '../../config/env';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: number;
  isActive: boolean;
  role: string;
  addresses: Address[];
}

export interface Address {
  id: number;
  province: string;
  district: string;
  ward: string;
  street: string;
  addressType: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  newUsersToday: number;
  averageAddressesPerUser: number;
}

export interface CreateUserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: number;
  password: string;
  roleNames: string[];
}

export interface BulkActionData {
  userIds: number[];
  actionType: 'ACTIVATE' | 'DEACTIVATE' | 'DELETE' | 'RESET_PASSWORD';
}

class UserService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getUsers(page = 0, size = 10, search = '', status = 'ALL') {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(search && { search }),
      ...(status !== 'ALL' && { status })
    });

    const response = await fetch(`${ENV.API_URL}/users?${params}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async getUserById(userId: number): Promise<User> {
    const response = await fetch(`${ENV.API_URL}/users/${userId}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await fetch(`${ENV.API_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    return response.json();
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${ENV.API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return response.json();
  }

  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${ENV.API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  async activateUser(userId: number): Promise<User> {
    const response = await fetch(`${ENV.API_URL}/users/${userId}/activate`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to activate user');
    }

    return response.json();
  }

  async deactivateUser(userId: number): Promise<User> {
    const response = await fetch(`${ENV.API_URL}/users/${userId}/deactivate`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to deactivate user');
    }

    return response.json();
  }

  async resetPassword(userId: number): Promise<string> {
    const response = await fetch(`${ENV.API_URL}/users/${userId}/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to reset password');
    }

    return response.text();
  }

  async getUserStatistics(): Promise<UserStatistics> {
    const response = await fetch(`${ENV.API_URL}/users/statistics`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return response.json();
  }

  async performBulkAction(actionData: BulkActionData): Promise<string> {
    const response = await fetch(`${ENV.API_URL}/users/bulk-action`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(actionData)
    });

    if (!response.ok) {
      throw new Error('Bulk action failed');
    }

    return response.text();
  }
}

export const userService = new UserService();