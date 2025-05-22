export interface GroupDto {
  groupId: number;
  groupName: string;
  image?: string;
  brand?: string;
  type?: string;
  orderNumber?: number;
  productId?: string;
  defaultOriginalPrice?: number;
  defaultCurrentPrice?: number;
}