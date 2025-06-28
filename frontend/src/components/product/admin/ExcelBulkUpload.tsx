import React, { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from "lucide-react";
import * as XLSX from 'xlsx';
import { productApi } from '../../../services/productService';
import { BulkGroupCreateRequest, ProductWithInventoryRequest } from '../../../types/product';
import axios from 'axios';

interface ExcelBulkUploadProps {
  onSuccess?: () => void;
  productType?: "phone" | "laptop" | "wireless_earphone" | "wired_earphone" | "headphone" | "backup_charger" | "cable_charger_hub";
}

interface UploadError {
  row: number;
  field: string;
  message: string;
}

interface FileRow {
  groupName: string;
  brand: string;
  type: string;
  image: string;
  productName: string;
  variant: string;
  description: string;
  colors: string;
  inventoryColor: string;
  quantity: number;
  originalPrice: number;
  currentPrice: number;
  config: string;
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

const ExcelBulkUpload: React.FC<ExcelBulkUploadProps> = ({ onSuccess, productType = 'phone' }) => {
  const [fileData, setFileData] = useState<FileRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploaded" | "processing" | "success" | "error">("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTemplateDataByType = (type: string) => {
    const commonFields = {
      colors: 'Black,White',
      inventoryColor: 'Black',
      quantity: 100,
      originalPrice: 25000000,
      currentPrice: 23000000
    };

    switch (type) {
      case 'phone':
        return [
          {
            groupName: 'iPhone 15 Series',
            brand: 'Apple',
            type: 'phone',
            image: 'iphone15.jpg',
            productName: 'iPhone 15 128GB',
            variant: '128GB',
            description: 'iPhone 15 with 128GB storage',
            ...commonFields,
            config: JSON.stringify({
              processor: 'A17 Pro',
              ram: '8GB',
              storage: '128GB',
              screenSize: '6.1 inch',
              batteryCapacity: '3349mAh',
              os: 'iOS 17',
              displayTechnology: 'Super Retina XDR OLED',
              displayResolution: '2556 x 1179',
              rearCameraResolution: '48MP + 12MP',
              frontCameraResolution: '12MP',
              chargingPort: 'USB-C',
              waterResistance: 'IP68'
            })
          }
        ];
      case 'laptop':
        return [
          {
            groupName: 'MacBook Pro M3 Series',
            brand: 'Apple',
            type: 'laptop',
            image: 'macbook.jpg',
            productName: 'MacBook Pro 14 M3',
            variant: '14-inch M3',
            description: 'MacBook Pro 14 inch with M3 chip',
            colors: 'Silver,Space Gray',
            inventoryColor: 'Silver',
            quantity: 30,
            originalPrice: 50000000,
            currentPrice: 47000000,
            config: JSON.stringify({
              processorModel: 'Apple M3',
              coreCount: '8',
              ram: '16GB',
              storage: '512GB SSD',
              screenSize: '14.2 inch',
              resolution: '3024x1964',
              graphicCard: 'Apple M3 10-core GPU',
              batteryLife: '18 hours',
              ports: '2x Thunderbolt 4, MagSafe 3',
              os: 'macOS Ventura'
            })
          }
        ];

      case 'wireless_earphone':
        return [
          {
            groupName: 'AirPods Pro 2nd Gen',
            brand: 'Apple',
            type: 'wireless_earphone',
            image: 'airpods-pro.jpg',
            productName: 'AirPods Pro (2nd generation)',
            variant: '2nd Gen',
            description: 'AirPods Pro with Active Noise Cancellation',
            colors: 'White',
            inventoryColor: 'White',
            quantity: 50,
            originalPrice: 6000000,
            currentPrice: 5500000,
            config: JSON.stringify({
              batteryLife: '6 hours',
              chargingCaseBatteryLife: '30 hours total',
              chargingPort: 'Lightning,USB-C',
              audioTechnology: 'Spatial Audio,Adaptive EQ',
              connectionTechnology: 'Bluetooth 5.3,Apple H2',
              controlType: 'Force sensor,Touch control',
              features: 'Active Noise Cancellation,Transparency mode'
            })
          }
        ];

      case 'wired_earphone':
        return [
          {
            groupName: 'EarPods Lightning',
            brand: 'Apple',
            type: 'wired_earphone',
            image: 'earpods.jpg',
            productName: 'EarPods with Lightning Connector',
            variant: 'Lightning',
            description: 'Wired earphones with Lightning connector',
            colors: 'White',
            inventoryColor: 'White',
            quantity: 100,
            originalPrice: 700000,
            currentPrice: 650000,
            config: JSON.stringify({
              audioJack: 'Lightning connector',
              cableLength: '1.2m',
              features: 'Built-in remote,Microphone',
              controlType: 'Inline remote,Microphone',
              compatibility: 'iPhone,iPad,iPod'
            })
          }
        ];

      case 'headphone':
        return [
          {
            groupName: 'AirPods Max',
            brand: 'Apple',
            type: 'headphone',
            image: 'airpods-max.jpg',
            productName: 'AirPods Max',
            variant: 'Over-ear',
            description: 'Premium over-ear headphones with ANC',
            colors: 'Silver,Space Gray,Sky Blue,Green,Pink',
            inventoryColor: 'Silver',
            quantity: 20,
            originalPrice: 13000000,
            currentPrice: 12000000,
            config: JSON.stringify({
              batteryLife: '20 hours',
              chargingPort: 'Lightning',
              audioTechnology: 'Spatial Audio,Active Noise Cancellation',
              connectionTechnology: 'Bluetooth 5.0,Apple H1',
              controlType: 'Digital Crown,Noise Control button',
              features: 'Transparency mode,Find My'
            })
          }
        ];

      case 'backup_charger':
        return [
          {
            groupName: 'Anker PowerCore 10000',
            brand: 'Anker',
            type: 'backup_charger',
            image: 'powercore.jpg',
            productName: 'PowerCore 10000 PD Redux',
            variant: '10000mAh',
            description: 'Compact power bank with USB-C PD',
            colors: 'Black,White',
            inventoryColor: 'Black',
            quantity: 50,
            originalPrice: 1200000,
            currentPrice: 1100000,
            config: JSON.stringify({
              batteryCapacity: '10000mAh',
              batteryCellType: 'Li-Polymer',
              chargingEfficiency: '85%',
              output: 'USB-A: 5V⎓2.4A,USB-C: 5V⎓3A',
              input: 'USB-C: 5V⎓2A',
              chargingTime: '5-6 hours (2A),3-4 hours (3A)',
              technologyFeatures: 'PowerIQ 3.0,Trickle-Charging Mode'
            })
          }
        ];

      case 'cable_charger_hub':
        return [
          {
            groupName: 'Anker USB-C Hub',
            brand: 'Anker',
            type: 'cable_charger_hub',
            image: 'usb-hub.jpg',
            productName: 'PowerExpand+ 7-in-1 USB-C Hub',
            variant: '7-in-1',
            description: 'Multi-port USB-C hub with charging',
            colors: 'Gray',
            inventoryColor: 'Gray',
            quantity: 30,
            originalPrice: 2000000,
            currentPrice: 1800000,
            config: JSON.stringify({
              ports: 'USB-C PD,2x USB-A 3.0,HDMI 4K,SD/microSD,Ethernet',
              maxPowerDelivery: '85W',
              hdmiResolution: '4K@30Hz',
              dataTransferSpeed: 'USB 3.0 (5Gbps)',
              compatibility: 'MacBook,Windows laptops,iPad Pro',
              cableLength: '0.6m'
            })
          }
        ];

      default:
        return [
          {
            groupName: 'Sample Product Group',
            brand: 'Sample Brand',
            type: type,
            image: 'sample.jpg',
            productName: 'Sample Product',
            variant: 'Standard',
            description: 'Sample product description',
            ...commonFields,
            config: JSON.stringify({
              feature1: 'Sample feature 1',
              feature2: 'Sample feature 2',
              specification: 'Sample specification'
            })
          }
        ];
    }
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
    const fileName = `bulk-${productTypeName}-template.xlsx`;

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, fileName);
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
        
        setFileData(jsonData);
        setResults([]);
        setErrors([]);
        setUploadStatus("uploaded");
      } catch (error) {
        setUploadStatus("error");
        setErrors([{ row: 0, field: 'file', message: 'Failed to parse file. Please check the format.' }]);
        console.error('File parsing error:', error);
      }
    };
    reader.readAsBinaryString(file);
  };

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
      
      let product = group.products.find(p => 
        p.productRequest.productName === row.productName && 
        p.productRequest.variant === row.variant
      );
      
      if (!product) {
        let config;
        try {
          config = JSON.parse(row.config || '{}');
        } catch {
          config = {};
        }
        
        const colorArray = row.colors.split(',').map(c => c.trim());
        const images: any = {};
        
        colorArray.forEach(color => {
          images[color] = [{ 
            url: `https://example.com/${row.productName.toLowerCase().replace(/\s+/g, '-')}-${color.toLowerCase()}.jpg`, 
            title: `${row.productName} ${color}` 
          }];
        });
        
        product = {
          productRequest: {
            productName: row.productName,
            description: row.description,
            brand: row.brand,
            images: images,
            colors: colorArray,
            variant: row.variant,
            type: row.type as any,
            config: config
          },
          inventoryRequests: []
        };
        
        group.products.push(product);
      }
      
      product.inventoryRequests.push({
        color: row.inventoryColor,
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
      setUploadStatus("error");
      setErrors([{ row: 0, field: 'file', message: 'Please upload a file first' }]);
      return;
    }

    setProcessing(true);
    setUploadStatus("processing");
    setProgress(0);
    setResults([]);

    try {
      const groups = processFileData();
      const totalGroups = groups.length;
      
      for (let i = 0; i < totalGroups; i++) {
        const group = groups[i];
        
        try {
          const bulkRequest: BulkGroupCreateRequest = {
            groupName: group.groupName,
            brand: group.brand,
            type: group.type,
            image: group.image,
            products: group.products
          };
          
          const response = await productApi.createBulkProductGroup(bulkRequest);
          
          if (response.success) {
            try {
              await indexToElasticsearch(response.groupId!, group);
              
              setResults(prev => [...prev, {
                groupName: group.groupName,
                status: 'success',
                groupId: response.groupId,
                productCount: response.productIds.length,
                message: response.message
              }]);
            } catch (esError: any) {
              setResults(prev => [...prev, {
                groupName: group.groupName,
                status: 'partial',
                groupId: response.groupId,
                productCount: response.productIds.length,
                message: 'Group created but Elasticsearch indexing failed',
                esError: esError.message
              }]);
            }
          } else {
            setResults(prev => [...prev, {
              groupName: group.groupName,
              status: 'failed',
              message: response.message
            }]);
          }
        } catch (error: any) {
          setResults(prev => [...prev, {
            groupName: group.groupName,
            status: 'failed',
            message: error.response?.data?.message || error.message
          }]);
        }
        
        setProgress(Math.round(((i + 1) / totalGroups) * 100));
      }
      
      setUploadStatus("success");
      onSuccess?.();
      
    } catch (error: any) {
      setUploadStatus("error");
      setErrors([{ row: 0, field: 'general', message: 'Bulk import failed: ' + error.message }]);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '🟢';
      case 'partial': return '🟡';
      case 'failed': return '🔴';
      default: return '⚪';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleFileUpload({ target: { files: [file] } } as any);
      }
    } else {
      setUploadStatus("error");
      setErrors([{ row: 0, field: 'file', message: 'Please select Excel file (.xlsx, .xls)' }]);
    }
  };

  const handleReset = () => {
    setUploadStatus("idle");
    setFileData([]);
    setResults([]);
    setErrors([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Bulk Import Products
        </h3>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      {uploadStatus === "idle" && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-4">
            Drag & drop Excel file or click to select
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Select File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-2">
            Support: .xlsx, .xls files
          </p>
        </div>
      )}

      {/* File Uploaded */}
      {uploadStatus === "uploaded" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="text-green-500" size={20} />
            <h4 className="font-semibold text-green-800">File uploaded successfully!</h4>
          </div>
          <p className="text-green-700 text-sm mb-3">
            📊 Total rows: {fileData.length} | 📦 Groups to create: {processFileData().length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBulkImport}
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Start Import'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Processing */}
      {uploadStatus === "processing" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-3">Processing groups...</h4>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-blue-700 text-sm">{progress}% completed</p>
        </div>
      )}

      {/* Errors */}
      {uploadStatus === "error" && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-red-500" size={20} />
            <h4 className="font-semibold text-red-800">Errors occurred</h4>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {errors.map((error, index) => (
              <p key={index} className="text-red-700 text-sm mb-1">
                {error.row > 0 ? `Row ${error.row}: ` : ''}{error.field} - {error.message}
              </p>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Import Results</h4>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Group Name</th>
                  <th className="text-left py-2">Products</th>
                  <th className="text-left py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)} {result.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 font-medium">{result.groupName}</td>
                    <td className="py-2">{result.productCount || 0}</td>
                    <td className="py-2 text-gray-600">
                      {result.message}
                      {result.esError && (
                        <div className="text-yellow-600 text-xs mt-1">ES Error: {result.esError}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelBulkUpload; 