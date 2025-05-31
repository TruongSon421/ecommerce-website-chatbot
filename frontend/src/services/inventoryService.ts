import ENV from '../config/env';
import { InventoryDto } from '../types/product';
import { Variant, GroupVariantResponse } from '../types/product';

interface UpdateInventoryParams {
  productId: string;
  productName: string;
  color: string | null;
  quantity: number;
  originalPrice: number;
  currentPrice: number;
}

export const inventoryService = {
  async fetchVariants(productId: string): Promise<Variant[]> {
    try {
      const response = await fetch(`${ENV.API_URL}/inventory/related/${productId}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: GroupVariantResponse = await response.json();
      return data.variants;
    } catch (error: any) {
      console.error('Error fetching variants:', error);
      throw new Error('Không thể tải các phiên bản sản phẩm. Vui lòng thử lại.');
    }
  },

  async updateInventory(params: UpdateInventoryParams, token: string): Promise<InventoryDto> {
    try {
      const response = await fetch(`${ENV.API_URL}/inventory/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: params.productId,
          productName: params.productName,
          color: params.color,
          quantity: params.quantity,
          originalPrice: params.originalPrice,
          currentPrice: params.currentPrice,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedInventory: InventoryDto = await response.json();
      return updatedInventory;
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật tồn kho');
    }
  },
};