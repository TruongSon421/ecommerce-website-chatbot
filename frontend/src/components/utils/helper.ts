// src/utils/helper.ts

/**
 * Lấy giá trị từ mảng với index cho trước, trả về null nếu không tồn tại
 */
export const getOrNone = <T>(arr: T[], index: number): T | null => {
    try {
      return arr[index];
    } catch {
      return null;
    }
    };

  /**
   * Tạo số ngẫu nhiên trong khoảng min-max
   */
export const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  /**
   * Chuyển đổi JSON thành FormData để upload file
   */
  export const jsonToFormData = (json: Record<string, any>): FormData => {
    const formData = new FormData();
    
    Object.keys(json).forEach(key => {
      if (json[key] !== undefined && json[key] !== null) {
        if (Array.isArray(json[key])) {
          json[key].forEach((item: any, index: number) => {
            if (typeof item === 'object' && !(item instanceof File)) {
              Object.keys(item).forEach(itemKey => {
                formData.append(`${key}[${index}].${itemKey}`, item[itemKey]);
              });
            } else {
              formData.append(`${key}`, item);
            }
          });
        } else if (typeof json[key] === 'object' && !(json[key] instanceof File)) {
          Object.keys(json[key]).forEach(subKey => {
            formData.append(`${key}.${subKey}`, json[key][subKey]);
          });
        } else {
          formData.append(key, json[key]);
        }
      }
    });
    
    return formData;
  };
  
  /**
   * Format giá tiền
   */
  export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  /**
   * Chuyển đổi hình ảnh thành base64
   */
  export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };