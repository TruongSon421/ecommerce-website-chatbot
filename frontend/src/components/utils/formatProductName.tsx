const formatProductName = (name: string): string => {
    const prefixes = [
      'Điện thoại',
      'Máy tính bảng',
      'Laptop',
      'Đồng hồ thông minh',
      'Đồng hồ',
      'Máy tính'
    ];
    
    let formattedName = name.trim();
    for (const prefix of prefixes) {
      if (formattedName.toLowerCase().startsWith(prefix.toLowerCase())) {
        formattedName = formattedName.slice(prefix.length).trim();
      }
    }
    return formattedName;
};
    
    
export default formatProductName;