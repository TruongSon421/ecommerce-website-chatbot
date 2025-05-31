export const formatCurrency = (value: string): string => {
    if (!value) return "";
    return value
      .replace(/\D/g, "") // Loại bỏ tất cả ký tự không phải số
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".") +"₫" ; // Thêm dấu chấm mỗi 3 chữ số
  };