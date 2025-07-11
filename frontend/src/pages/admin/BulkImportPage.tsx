import React, { useState } from 'react';
import { Container, Box, Typography, Breadcrumbs, Link, FormControl, InputLabel, Select, MenuItem, Card, CardContent } from '@mui/material';
import { Home, Upload } from '@mui/icons-material';
import { BulkImportForm } from '../../components/product/admin/BulkImportForm';
import { useNavigate } from 'react-router-dom';

const BulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProductType, setSelectedProductType] = useState<string>('phone');

  const handleSuccess = () => {
    // Có thể navigate về trang quản lý products sau khi import thành công
    // navigate('/admin/products');
  };

  const productTypes = [
    { value: 'phone', label: '📱 Điện thoại' },
    { value: 'laptop', label: '💻 Laptop' },
    { value: 'wireless_earphone', label: '🎧 Tai nghe không dây' },
    { value: 'wired_earphone', label: '🎵 Tai nghe có dây' },
    { value: 'headphone', label: '🎧 Headphone' },
    { value: 'backup_charger', label: '🔋 Sạc dự phòng' },
    { value: 'cable_charger_hub', label: '🔌 Hub sạc/Cáp' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: 3 }}>
      <Container maxWidth="xl">
        <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/admin"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Admin
          </Link>
          <Typography color="text.primary">Products</Typography>
          <Typography 
            color="text.primary" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Upload sx={{ mr: 0.5 }} fontSize="inherit" />
            Bulk Import
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Typography variant="h4" component="h2" sx={{ marginBottom: 3, textAlign: 'center' }}>
            Bulk Import Products
          </Typography>
          
          {/* Product Type Selection */}
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ marginBottom: 2 }}>
                Chọn loại sản phẩm
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="product-type-label">Loại sản phẩm</InputLabel>
                <Select
                  labelId="product-type-label"
                  value={selectedProductType}
                  label="Loại sản phẩm"
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  sx={{ marginBottom: 2 }}
                >
                  {productTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>Lưu ý:</strong> Template Excel sẽ được tạo với các thông số kỹ thuật phù hợp cho loại sản phẩm đã chọn.
              </Typography>
            </CardContent>
          </Card>
          
          <BulkImportForm onSuccess={handleSuccess} productType={selectedProductType as any} />
        </Box>
      </Container>
    </Box>
  );
};

export default BulkImportPage; 