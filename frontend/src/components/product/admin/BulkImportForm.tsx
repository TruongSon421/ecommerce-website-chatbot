import React, { useState } from 'react';
import { 
  Button, 
  LinearProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Paper, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  AlertTitle
} from '@mui/material';
import { CloudDownload, CloudUpload, ExpandMore } from '@mui/icons-material';
// import XLSX from 'xlsx';
import * as XLSX from 'xlsx';
import { productApi } from '../../../services/productService';
import { BulkGroupCreateRequest, ProductWithInventoryRequest } from '../../../types/product';
import { EnhancedFileRow, ProductReviewData, generateEnhancedExcelTemplate, generateExcelTemplate } from './ExcelTemplate';
import axios from 'axios';

interface BulkImportFormProps {
  onSuccess?: () => void;
  productType?: "phone" | "laptop" | "wireless_earphone" | "wired_earphone" | "headphone" | "backup_charger" | "cable_charger_hub";
}

// Enhanced file row interface for Excel processing
interface FileRow {
  groupName: string;
  brand: string;
  type: string;
  image: string;
  productName: string;
  variant: string;
  description: string;
  colors?: string;          // Optional - products can have no colors
  inventoryColor?: string;  // Optional - products can have no inventory color
  quantity: number;
  originalPrice: number;
  currentPrice: number;
  config: string;
  
  // Enhanced fields (optional for backward compatibility)
  imagesJson?: string;         // JSON string for complex images
  imagePattern?: string;       // URL pattern for auto-generation
  reviewsJson?: string;        // JSON string for reviews
  promotions?: string;         // Pipe-separated promotions
  warrantyPeriod?: string;     // Warranty period
  releaseDate?: string;        // Release date
}

interface ProcessedGroup {
  groupName: string;
  brand: string;
  type: string;
  image: string;
  products: ProductWithInventoryRequest[];
}

interface ImportResult {
  groupName: string;
  status: 'success' | 'partial' | 'failed';
  groupId?: number;
  productCount?: number;
  message: string;
  esError?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const BulkImportForm: React.FC<BulkImportFormProps> = ({ onSuccess, productType = 'phone' }) => {
  const [fileData, setFileData] = useState<FileRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  const showMessage = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    console.log(`[${severity.toUpperCase()}] ${message}`);
    setSnackbar({ open: true, message, severity });
  };

  // Enhanced template data generation
  const getTemplateDataByType = (type: string) => {
    // Use enhanced template for all supported product types
    return generateEnhancedExcelTemplate(type);
  };

  const getProductTypeName = (type: string) => {
    switch (type) {
      case 'phone': return 'phone';
      case 'laptop': return 'laptop';
      case 'wireless_earphone': return 'wireless-earphone';
      case 'wired_earphone': return 'wired-earphone';
      case 'headphone': return 'headphone';
      case 'backup_charger': return 'backup-charger';
      case 'cable_charger_hub': return 'cable-charger-hub';
      default: return 'products';
    }
  };

  const downloadTemplate = () => {
    const templateData = getTemplateDataByType(productType);
    const productTypeName = getProductTypeName(productType);
    const fileName = `enhanced-bulk-${productTypeName}-template.xlsx`;

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, fileName);
    showMessage(`Enhanced template for ${productType} downloaded successfully`);
  };

  // Enhanced validation function
  const validateFileData = (data: FileRow[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (data.length === 0) {
      errors.push('File is empty or could not be parsed');
      return { isValid: false, errors, warnings };
    }

    data.forEach((row, index) => {
      const rowNum = index + 1;
      
      // Required field validation
      if (!row.groupName) errors.push(`Row ${rowNum}: Missing group name`);
      if (!row.productName) errors.push(`Row ${rowNum}: Missing product name`);
      if (!row.brand) errors.push(`Row ${rowNum}: Missing brand`);
      if (!row.type) errors.push(`Row ${rowNum}: Missing product type`);
      if (!row.variant) errors.push(`Row ${rowNum}: Missing variant`);
      
      // Colors are optional - products can have no color (null color products)
      // if (!row.colors) errors.push(`Row ${rowNum}: Missing colors`);
      // if (!row.inventoryColor) errors.push(`Row ${rowNum}: Missing inventory color`);
      
      // Numeric validation
      if (isNaN(row.quantity) || row.quantity < 0) {
        errors.push(`Row ${rowNum}: Invalid quantity value`);
      }
      if (isNaN(row.originalPrice) || row.originalPrice <= 0) {
        errors.push(`Row ${rowNum}: Invalid original price`);
      }
      if (isNaN(row.currentPrice) || row.currentPrice <= 0) {
        errors.push(`Row ${rowNum}: Invalid current price`);
      }
      
      // Color validation - Allow any color or null/empty
      // Note: Inventory color can be any color, not restricted to the colors list
      // This allows adding new colors dynamically without predefined limitations
      // Colors are completely optional, no validation needed for null/empty colors
      
      // JSON validation for enhanced fields
      if (row.imagesJson) {
        try {
          JSON.parse(row.imagesJson);
        } catch {
          errors.push(`Row ${rowNum}: Invalid JSON format in imagesJson`);
        }
      }
      
      if (row.reviewsJson) {
        try {
          const reviews = JSON.parse(row.reviewsJson);
          if (!Array.isArray(reviews)) {
            errors.push(`Row ${rowNum}: reviewsJson must be an array`);
          }
        } catch {
          errors.push(`Row ${rowNum}: Invalid JSON format in reviewsJson`);
        }
      }
      
      if (row.config) {
        try {
          JSON.parse(row.config);
        } catch {
          warnings.push(`Row ${rowNum}: Invalid JSON format in config, will be ignored`);
        }
      }
      
      // Price comparison warning
      if (row.currentPrice > row.originalPrice) {
        warnings.push(`Row ${rowNum}: Current price is higher than original price`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<FileRow>(worksheet);
        
        // Convert column names to match our interface (for Vietnamese Excel templates)
        const normalizedData = jsonData.map(row => {
          const normalizedRow: any = {};
          
          // Map Vietnamese column names to English field names
          Object.keys(row).forEach(key => {
            const value = (row as any)[key];
            switch (key) {
              case 'ten_nhom':
                normalizedRow.groupName = value;
                break;
              case 'thuong_hieu':
                normalizedRow.brand = value;
                break;
              case 'loai_san_pham':
                normalizedRow.type = value;
                break;
              case 'anh_nhom':
                normalizedRow.image = value;
                break;
              case 'ten_san_pham':
                normalizedRow.productName = value;
                break;
              case 'bien_the':
                normalizedRow.variant = value;
                break;
              case 'mo_ta':
                normalizedRow.description = value;
                break;
              case 'mau_sac':
                normalizedRow.colors = value;
                break;
              case 'mau_kho':
                normalizedRow.inventoryColor = value;
                break;
              case 'gia_goc':
                normalizedRow.originalPrice = parseFloat(value);
                break;
              case 'gia_hien_tai':
                normalizedRow.currentPrice = parseFloat(value);
                break;
              case 'so_luong':
                normalizedRow.quantity = parseInt(value);
                break;
              case 'anh_san_pham_json':
                normalizedRow.imagesJson = value;
                break;
              case 'anh_pattern':
                normalizedRow.imagePattern = value;
                break;
              case 'danh_gia_json':
                normalizedRow.reviewsJson = value;
                break;
              case 'khuyen_mai':
                normalizedRow.promotions = value;
                break;
              case 'thong_so_ky_thuat':
                normalizedRow.config = value;
                break;
              case 'bao_hanh':
                normalizedRow.warrantyPeriod = value;
                break;
              case 'ngay_phat_hanh':
                normalizedRow.releaseDate = value;
                break;
              default:
                // Keep original field names for backward compatibility
                normalizedRow[key] = value;
            }
          });
          
          return normalizedRow as FileRow;
        });
        
        setFileData(normalizedData);
        setResults([]); // Clear previous results
        
        // Validate data
        const validationResult = validateFileData(normalizedData);
        setValidation(validationResult);
        
        if (validationResult.isValid) {
          showMessage(`Successfully loaded ${normalizedData.length} rows from file`);
        } else {
          showMessage(`File loaded with ${validationResult.errors.length} errors`, 'error');
        }
      } catch (error) {
        showMessage('Failed to parse file. Please check the format.', 'error');
        console.error('File parsing error:', error);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Enhanced image parsing with JSON support
  const parseImagesAdvanced = (colors: string, productName: string, imagesJson?: string, imagePattern?: string) => {
    const colorList = colors ? colors.split(',').map(c => c.trim()) : [];
    const images: Record<string, any[]> = {};
    
    // Priority 1: Use JSON data if available
    if (imagesJson) {
      try {
        const parsedImages = JSON.parse(imagesJson);
        if (typeof parsedImages === 'object' && parsedImages !== null) {
          return parsedImages;
        }
      } catch (error) {
        console.warn('Failed to parse imagesJson, falling back to pattern or default');
      }
    }
    
    // Priority 2: Use pattern if available
    if (imagePattern) {
      colorList.forEach((color, index) => {
        const urls = [];
        // Generate multiple images per color (assuming pattern supports {index})
        for (let i = 1; i <= 3; i++) {
          const url = imagePattern
            .replace('{product}', productName.toLowerCase().replace(/\s+/g, '-'))
            .replace('{color}', color.toLowerCase())
            .replace('{index}', i.toString());
          
          urls.push({
            url: url,
            title: `${productName} ${color} - Image ${i}`
          });
        }
        images[color] = urls;
      });
      return images;
    }
    
    // Priority 3: Default generation
    colorList.forEach(color => {
      images[color] = [{
        url: `https://example.com/${productName.toLowerCase().replace(/\s+/g, '-')}-${color.toLowerCase()}.jpg`,
        title: `${productName} ${color}`
      }];
    });
    
    return images;
  };

  // Enhanced data processing with complex data support - Match backend models
  const processFileData = (): ProcessedGroup[] => {
    const groupsMap = new Map<string, ProcessedGroup>();
    
    fileData.forEach(row => {
      const groupKey = `${row.groupName}-${row.brand}-${row.type}`;
      
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          groupName: row.groupName,
          brand: row.brand,
          type: row.type,
          image: row.image || '',
          products: []
        });
      }
      
      const group = groupsMap.get(groupKey)!;
      
      // Find existing product in group
      let product = group.products.find(p => 
        p.productRequest.productName === row.productName && 
        p.productRequest.variant === row.variant
      );
      
      if (!product) {
        // Parse productReviews - Backend expects List<Map<String, String>> with title and content
        let productReviews: Array<{title: string, content: string}> = [];
        if (row.reviewsJson) {
          try {
            const parsedReviews = JSON.parse(row.reviewsJson);
            productReviews = parsedReviews.map((review: any) => ({
              title: review.title || '',
              content: review.content || ''
            }));
          } catch (error) {
            console.warn('Failed to parse reviewsJson for product:', row.productName);
          }
        }
        
        // Parse promotions
        let promotions: string[] = [];
        if (row.promotions) {
          promotions = row.promotions.split('|').map(p => p.trim()).filter(p => p.length > 0);
        }
        
        // Parse images - Backend expects Map<String,List<Map<String,String>>> 
        let images: Record<string, Array<{url: string, title: string}>> = {};
        if (row.imagesJson) {
          try {
            images = JSON.parse(row.imagesJson);
          } catch (error) {
            console.warn('Failed to parse imagesJson, using advanced parsing');
            images = parseImagesAdvanced(row.colors || '', row.productName, row.imagesJson, row.imagePattern);
          }
        } else {
          images = parseImagesAdvanced(row.colors || '', row.productName, row.imagesJson, row.imagePattern);
        }
        
        // Parse config for phone-specific fields
        let config: any = {};
        if (row.config) {
          try {
            config = JSON.parse(row.config);
          } catch (error) {
            console.warn('Failed to parse config for product:', row.productName);
            config = {};
          }
        }
        
        // Create type-specific product request matching backend models
        let productRequest: any = {
          productName: row.productName,
          description: row.description || '',
          brand: row.brand,
          images: images,
          type: row.type,
          productReviews: productReviews,
          promotions: promotions,
          warrantyPeriod: row.warrantyPeriod,
          release: row.releaseDate
        };

        // Add type-specific fields from config - Match Phone model exactly
        if (row.type === 'phone') {
          productRequest = {
            ...productRequest,
            // Phone specific fields - Match Phone.java model exactly
            os: config.os || '',
            processor: config.processor || '',
            cpuSpeed: config.cpuSpeed || '',
            gpu: config.gpu || '',
            ram: config.ram || '',
            storage: config.storage || '',
            availableStorage: config.availableStorage || '',
            contactLimit: config.contactLimit || '',
            
            // Camera và màn hình
            rearCameraResolution: config.rearCameraResolution || '',
            rearVideoRecording: config.rearVideoRecording || [],
            rearFlash: config.rearFlash || '',
            rearCameraFeatures: config.rearCameraFeatures || [],
            frontCameraResolution: config.frontCameraResolution || '',
            frontCameraFeatures: config.frontCameraFeatures || [],
            
            displayTechnology: config.displayTechnology || '',
            displayResolution: config.displayResolution || '',
            screenSize: config.screenSize || '',
            maxBrightness: config.maxBrightness || '',
            screenProtection: config.screenProtection || '',
            
            // Pin và sạc
            batteryCapacity: config.batteryCapacity || '',
            batteryType: config.batteryType || '',
            maxChargingPower: config.maxChargingPower || '',
            batteryFeatures: config.batteryFeatures || [],
            
            // Tiện ích
            securityFeatures: config.securityFeatures || [],
            specialFeatures: config.specialFeatures || [],
            waterResistance: config.waterResistance || '',
            recording: config.recording || [],
            video: config.video || [],
            audio: config.audio || [],
            
            // Kết nối
            mobileNetwork: config.mobileNetwork || '',
            simType: config.simType || '',
            wifi: config.wifi || [],
            gps: config.gps || '',
            bluetooth: config.bluetooth || '',
            chargingPort: config.chargingPort || '',
            headphoneJack: config.headphoneJack || '',
            otherConnectivity: config.otherConnectivity || [],
            
            // Thiết kế và chất lượng
            designType: config.designType || '',
            materials: config.materials || '',
            sizeWeight: config.sizeWeight || ''
          };
        } else if (row.type === 'laptop') {
          // Add laptop specific fields here when needed
          productRequest.config = config;
        } else {
          // For other types, keep config as is for now
          productRequest.config = config;
        }
        
        // Create new product
        product = {
          productRequest: productRequest,
          inventoryRequests: []
        };
        group.products.push(product);
      }
      
      // Add inventory request
      product.inventoryRequests.push({
        color: row.inventoryColor || null,
        quantity: row.quantity,
        originalPrice: row.originalPrice,
        currentPrice: row.currentPrice
      });
    });
    
    return Array.from(groupsMap.values());
  };

  const indexToElasticsearch = async (groupId: number, group: ProcessedGroup) => {
    const elasticsearchPayload = {
      group_id: groupId,
      group_name: group.groupName,
      brand: group.brand,
      type: group.type,
      document: `${group.groupName} ${group.brand} ${group.type}`,
      review: ""
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    await axios.post(
      `${apiUrl}/chatbot/rag/add-to-elasticsearch`,
      elasticsearchPayload
    );
  };

  const handleBulkImport = async () => {
    if (fileData.length === 0) {
      showMessage('Please upload a file first', 'error');
      return;
    }

    if (validation && !validation.isValid) {
      showMessage('Please fix validation errors before importing', 'error');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setResults([]);

    const currentResults: ImportResult[] = [];

    try {
      const groups = processFileData();
      const totalGroups = groups.length;
      
      console.log(`Starting bulk import for ${totalGroups} groups`);
      
      for (let i = 0; i < totalGroups; i++) {
        const group = groups[i];
        console.log(`Processing group ${i + 1}/${totalGroups}: ${group.groupName}`);
        
        try {
          // Step 1: Create group with products (MySQL + MongoDB)
          const bulkRequest: BulkGroupCreateRequest = {
            groupName: group.groupName,
            brand: group.brand,
            type: group.type,
            image: group.image,
            products: group.products
          };
          
          console.log(`Sending API request for group: ${group.groupName}`);
          const response = await productApi.createBulkProductGroup(bulkRequest);
          console.log(`API response for ${group.groupName}:`, response);
          
          if (response.success) {
            // Step 2: Index to Elasticsearch (separate API)
            try {
              console.log(`Indexing to Elasticsearch for group: ${group.groupName}`);
              await indexToElasticsearch(response.groupId!, group);
              
              const newResult: ImportResult = {
                groupName: group.groupName,
                status: 'success',
                groupId: response.groupId,
                productCount: response.productIds.length,
                message: response.message
              };
              
              currentResults.push(newResult);
              setResults(prev => [...prev, newResult]);
              console.log(`Successfully processed group: ${group.groupName}`);
            } catch (esError: any) {
              console.error(`Elasticsearch error for group ${group.groupName}:`, esError);
              const newResult: ImportResult = {
                groupName: group.groupName,
                status: 'partial',
                groupId: response.groupId,
                productCount: response.productIds.length,
                message: 'Group created but Elasticsearch indexing failed',
                esError: esError.message
              };
              
              currentResults.push(newResult);
              setResults(prev => [...prev, newResult]);
            }
          } else {
            console.error(`Failed to create group ${group.groupName}:`, response.message);
            const newResult: ImportResult = {
              groupName: group.groupName,
              status: 'failed',
              message: response.message
            };
            
            currentResults.push(newResult);
            setResults(prev => [...prev, newResult]);
          }
        } catch (error: any) {
          console.error(`Error processing group ${group.groupName}:`, error);
          const newResult: ImportResult = {
            groupName: group.groupName,
            status: 'failed',
            message: error.response?.data?.message || error.message
          };
          
          currentResults.push(newResult);
          setResults(prev => [...prev, newResult]);
        }
        
        const progressPercent = Math.round(((i + 1) / totalGroups) * 100);
        setProgress(progressPercent);
        console.log(`Progress: ${progressPercent}% (${i + 1}/${totalGroups})`);
        
        // Add small delay to prevent overwhelming the server
        if (i < totalGroups - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Use currentResults for final counting
      const successCount = currentResults.filter(r => r.status === 'success').length;
      const partialCount = currentResults.filter(r => r.status === 'partial').length;
      const failedCount = currentResults.filter(r => r.status === 'failed').length;
      
      console.log(`Final results - Success: ${successCount}, Partial: ${partialCount}, Failed: ${failedCount}`);
      
      if (successCount === totalGroups) {
        showMessage(`Successfully processed all ${totalGroups} groups`);
      } else {
        showMessage(`Completed: ${successCount} success, ${partialCount} partial, ${failedCount} failed`, 'warning');
      }
      
      onSuccess?.();
      
    } catch (error: any) {
      console.error('Bulk import error:', error);
      showMessage('Bulk import failed: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'partial': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Enhanced Bulk Import Products
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Button 
                startIcon={<CloudDownload />}
                onClick={downloadTemplate} 
                variant="outlined"
                sx={{ marginBottom: 2 }}
              >
                Download Enhanced Template
              </Button>
              <Typography variant="body2" color="text.secondary">
                Download the enhanced Excel template with support for complex data (images JSON, reviews, promotions)
              </Typography>
            </Box>
            
            {/* File Upload Area */}
            <Box 
              sx={{ 
                border: '2px dashed #ccc',
                borderRadius: 2,
                padding: 4,
                textAlign: 'center',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: '#f5f5f5'
                }
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <CloudUpload sx={{ fontSize: 48, color: '#1976d2', marginBottom: 2 }} />
              <Typography variant="h6" gutterBottom>
                Click or drag file to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Support Enhanced Excel (.xlsx, .xls) templates with complex data support
              </Typography>
            </Box>

            {/* Validation Results */}
            {validation && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    File Validation Results
                  </Typography>
                  
                  {validation.errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <AlertTitle>Validation Errors ({validation.errors.length})</AlertTitle>
                      <List dense>
                        {validation.errors.map((error, index) => (
                          <ListItem key={index} sx={{ pl: 0 }}>
                            <ListItemText primary={error} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                  
                  {validation.warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <AlertTitle>Warnings ({validation.warnings.length})</AlertTitle>
                      <List dense>
                        {validation.warnings.map((warning, index) => (
                          <ListItem key={index} sx={{ pl: 0 }}>
                            <ListItemText primary={warning} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                  
                  {validation.isValid && (
                    <Alert severity="success">
                      <AlertTitle>Validation Passed</AlertTitle>
                      File data is valid and ready for import. {fileData.length} products found.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* File Data Preview */}
            {fileData.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    Data Preview ({fileData.length} rows)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Group</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Variant</TableCell>
                          <TableCell>Color</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Enhanced Data</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fileData.slice(0, 10).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.groupName}</TableCell>
                            <TableCell>{row.productName}</TableCell>
                            <TableCell>{row.variant}</TableCell>
                            <TableCell>{row.inventoryColor}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell>{row.currentPrice?.toLocaleString()}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {row.imagesJson && <Chip label="Images" size="small" color="primary" />}
                                {row.reviewsJson && <Chip label="Reviews" size="small" color="secondary" />}
                                {row.promotions && <Chip label="Promotions" size="small" color="success" />}
                                {row.imagePattern && <Chip label="Pattern" size="small" color="info" />}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {fileData.length > 10 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography variant="body2" color="text.secondary">
                                ... and {fileData.length - 10} more rows
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                variant="contained" 
                onClick={handleBulkImport}
                disabled={processing || fileData.length === 0 || (validation ? !validation.isValid : false)}
                sx={{ minWidth: 150 }}
              >
                {processing ? 'Processing...' : 'Start Enhanced Import'}
              </Button>
              
              {fileData.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Ready to import {fileData.length} products
                </Typography>
              )}
            </Box>
            
            {processing && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {progress}% Complete
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Import Results */}
      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Import Results
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={`Success: ${results.filter(r => r.status === 'success').length}`}
                color="success"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Partial: ${results.filter(r => r.status === 'partial').length}`}
                color="warning"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Failed: ${results.filter(r => r.status === 'failed').length}`}
                color="error"
              />
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Group Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Group ID</TableCell>
                    <TableCell>Products</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.groupName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={result.status}
                          color={getStatusColor(result.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{result.groupId || '-'}</TableCell>
                      <TableCell>{result.productCount || '-'}</TableCell>
                      <TableCell>
                        {result.message}
                        {result.esError && (
                          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            ES Error: {result.esError}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};