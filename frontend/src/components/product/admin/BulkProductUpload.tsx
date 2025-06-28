import React, { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from "lucide-react";

interface BulkProductUploadProps {
  onProductsUploaded: (products: any[]) => void;
  productType: "phone" | "laptop";
  groupBrand: string;
}

interface UploadError {
  row: number;
  field: string;
  message: string;
}

const BulkProductUpload: React.FC<BulkProductUploadProps> = ({
  onProductsUploaded,
  productType,
  groupBrand,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [uploadedProducts, setUploadedProducts] = useState<any[]>([]);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template data cho Excel
  const getTemplateData = () => {
    if (productType === "phone") {
      return [
        {
          variant: "iPhone 15 128GB",
          description: "iPhone 15 với màn hình Dynamic Island 6.1 inch",
          colors: "Hồng,Xanh,Đen", // Phân cách bằng dấu phẩy
          originalPrice: "25000000",
          currentPrice: "23000000",
          quantity: "50",
          warrantyPeriod: "12 tháng",
          release: "2023-09-15",
          // Cấu hình cơ bản cho điện thoại
          os: "iOS 17",
          processor: "A17 Pro",
          ram: "8GB",
          storage: "128GB",
          screenSize: "6.1 inch",
          batteryCapacity: "3349mAh"
        }
      ];
    } else {
      return [
        {
          variant: "MacBook Air M2 13 inch",
          description: "MacBook Air với chip M2 mạnh mẽ",
          colors: "Bạc,Xám", 
          originalPrice: "35000000",
          currentPrice: "32000000",
          quantity: "30",
          warrantyPeriod: "12 tháng",
          release: "2023-06-01",
          // Cấu hình cơ bản cho laptop
          processorModel: "Apple M2",
          ram: "8GB",
          storage: "256GB SSD",
          screenSize: "13.6 inch",
          os: "macOS Ventura"
        }
      ];
    }
  };

  // Download template Excel
  const handleDownloadTemplate = () => {
    // Tạo file CSV đơn giản thay vì Excel (sẽ cần xlsx library để tạo Excel thực sự)
    const templateData = getTemplateData();
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(","),
      ...templateData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bulk_product_template_${productType}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Xử lý file upload
  const handleFileUpload = async (file: File) => {
    setUploadStatus("processing");
    setErrors([]);

    try {
      // Đọc file CSV/Excel (cần implement với xlsx library)
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const products = [];
      const newErrors: UploadError[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Validate dữ liệu
        if (!rowData.variant) {
          newErrors.push({ row: i + 1, field: 'variant', message: 'Variant không được để trống' });
        }
        
        if (!rowData.colors) {
          newErrors.push({ row: i + 1, field: 'colors', message: 'Colors không được để trống' });
        }

        if (!rowData.currentPrice || isNaN(Number(rowData.currentPrice))) {
          newErrors.push({ row: i + 1, field: 'currentPrice', message: 'Giá hiện tại phải là số' });
        }

        if (!rowData.quantity || isNaN(Number(rowData.quantity))) {
          newErrors.push({ row: i + 1, field: 'quantity', message: 'Số lượng phải là số' });
        }

        // Chuyển đổi dữ liệu sang format của hệ thống
        if (newErrors.filter(e => e.row === i + 1).length === 0) {
          const productData = {
            variant: rowData.variant,
            description: rowData.description || '',
            brand: groupBrand,
            colors: rowData.colors.split(',').map((c: string) => c.trim()).filter((c: string) => c),
            inventories: [{
              color: null,
              quantity: parseInt(rowData.quantity),
              originalPrice: rowData.originalPrice ? parseInt(rowData.originalPrice) : null,
              currentPrice: parseInt(rowData.currentPrice),
            }],
            warrantyPeriod: rowData.warrantyPeriod || '',
            release: rowData.release || '',
            config: buildConfig(rowData, productType),
            images: {},
            promotions: [],
            productReviews: []
          };
          products.push(productData);
        }
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
        setUploadStatus("error");
      } else {
        setUploadedProducts(products);
        setUploadStatus("success");
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus("error");
      setErrors([{ row: 0, field: 'file', message: 'Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.' }]);
    }
  };

  // Build config cho từng loại sản phẩm
  const buildConfig = (rowData: any, type: "phone" | "laptop") => {
    if (type === "phone") {
      return {
        os: rowData.os || "",
        processor: rowData.processor || "",
        ram: rowData.ram || "",
        storage: rowData.storage || "",
        screenSize: rowData.screenSize || "",
        batteryCapacity: rowData.batteryCapacity || "",
        // Các trường khác sẽ có giá trị mặc định
        cpuSpeed: "",
        gpu: "",
        availableStorage: "",
        contactLimit: "",
        rearCameraResolution: "",
        rearVideoRecording: [],
        rearFlash: "",
        rearCameraFeatures: [],
        frontCameraResolution: "",
        frontCameraFeatures: [],
        displayTechnology: "",
        displayResolution: "",
        maxBrightness: "",
        screenProtection: "",
        batteryType: "",
        maxChargingPower: "",
        batteryFeatures: [],
        securityFeatures: [],
        specialFeatures: [],
        waterResistance: "",
        recording: [],
        video: [],
        audio: [],
        mobileNetwork: "",
        simType: "",
        wifi: [],
        gps: [],
        bluetooth: [],
        chargingPort: "",
        headphoneJack: "",
        otherConnectivity: [],
        designType: "",
        materials: "",
        sizeWeight: "",
      };
    } else {
      return {
        processorModel: rowData.processorModel || "",
        ram: rowData.ram || "",
        storage: rowData.storage ? [rowData.storage] : [],
        screenSize: rowData.screenSize || "",
        os: rowData.os || "",
        // Các trường khác có giá trị mặc định
        coreCount: "",
        threadCount: "",
        cpuSpeed: "",
        maxCpuSpeed: "",
        ramType: "",
        ramBusSpeed: "",
        maxRam: "",
        resolution: "",
        refreshRate: "",
        colorGamut: [],
        displayTechnology: [],
        touchScreen: [],
        graphicCard: "",
        audioTechnology: [],
        ports: [],
        wirelessConnectivity: [],
        webcam: "",
        otherFeatures: [],
        keyboardBacklight: "",
        size: "",
        material: "",
        battery: "",
      };
    }
  };

  // Handle drag events
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
    
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileUpload(file);
    } else {
      setErrors([{ row: 0, field: 'file', message: 'Vui lòng chọn file CSV hoặc Excel (.xlsx, .xls)' }]);
      setUploadStatus("error");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleConfirmUpload = () => {
    onProductsUploaded(uploadedProducts);
    setShowPreview(false);
    setUploadStatus("idle");
    setUploadedProducts([]);
  };

  const handleReset = () => {
    setUploadStatus("idle");
    setUploadedProducts([]);
    setErrors([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Upload sản phẩm hàng loạt
        </h3>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download size={16} />
          Tải template
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
            Kéo thả file Excel/CSV hoặc click để chọn file
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Chọn file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-2">
            Hỗ trợ file: .csv, .xlsx, .xls
          </p>
        </div>
      )}

      {/* Processing */}
      {uploadStatus === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý file...</p>
        </div>
      )}

      {/* Errors */}
      {uploadStatus === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-red-500" size={20} />
            <h4 className="font-semibold text-red-800">Có lỗi xảy ra khi upload</h4>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {errors.map((error, index) => (
              <p key={index} className="text-red-700 text-sm mb-1">
                {error.row > 0 ? `Dòng ${error.row}: ` : ''}{error.field} - {error.message}
              </p>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Success & Preview */}
      {uploadStatus === "success" && showPreview && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="text-green-500" size={20} />
            <h4 className="font-semibold text-green-800">
              Upload thành công {uploadedProducts.length} sản phẩm
            </h4>
          </div>
          
          <div className="max-h-60 overflow-y-auto mb-4">
            {uploadedProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded border mb-2">
                <div>
                  <p className="font-medium">{product.variant}</p>
                  <p className="text-sm text-gray-600">
                    {product.colors.join(', ')} | Giá: {product.inventories[0].currentPrice?.toLocaleString()}đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfirmUpload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Xác nhận thêm vào nhóm
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Tải template Excel để xem định dạng cần thiết</li>
          <li>2. Điền thông tin sản phẩm vào template</li>
          <li>3. Màu sắc phân cách bằng dấu phẩy (VD: Đỏ,Xanh,Vàng)</li>
          <li>4. Upload file và xem preview trước khi xác nhận</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkProductUpload; 