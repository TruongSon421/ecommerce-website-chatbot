import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BannerSection from '../../layout/bannerSection';
import ProductSpecifications from '../productSpecifications';
import ENV from '../../../config/env';
import { useAuth } from '../../hooks/useAuth';
import { addItemToCart } from '../../../services/cartService';
import { useNotification } from '../../common/Notification';
import { CartItem } from '../../../types/cart';
import { inventoryService } from '../../../services/inventoryService';
import { GroupVariantResponse, Variant, Product, Specification, Image } from '../../../types/product';

interface ProductReview {
  title: string;
  content: string;
}

// Extend Product interface if needed
interface ExtendedProduct extends Product {
  productReviews?: ProductReview[];
}

// Interfaces for tags
interface Tag {
  tagId: number;
  tagName: string;
  description?: string;
}

interface GroupTag {
  id: number;
  groupId: number;
  tagId: number;
  tag: Tag;
}

const ProductDetailAdmin: React.FC<{ product: Product }> = ({ product: initialProduct }) => {
  const navigate = useNavigate();
  const { productId: urlProductId } = useParams<{ productId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [groupData, setGroupData] = useState<GroupVariantResponse | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('default');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [editQuantity, setEditQuantity] = useState<number | null>(null);
  const [editOriginalPrice, setEditOriginalPrice] = useState<number | null>(null);
  const [editCurrentPrice, setEditCurrentPrice] = useState<number | null>(null);
  const [editVersion, setEditVersion] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // States cho việc edit product info
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editProductData, setEditProductData] = useState<any>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // States for tag management
  const [groupTags, setGroupTags] = useState<GroupTag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isManagingTags, setIsManagingTags] = useState(false);

  const fetchProduct = useCallback(async (productId: string, isRetry = false) => {
    setIsProductLoading(true);
    setProductError(null);

    const apiUrl = `${ENV.API_URL}/products/get/${product.type}/${productId}`;
    console.log('Fetching product from:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: Product = await response.json();
      console.log('Fetched product:', data);
      setProduct(data);
      setRetryCount(0);
      if (data.colors && data.colors.length > 0 && data.colors[0] != null) {
        setSelectedColor(data.colors[0]);
        setEditQuantity(data.quantities[0]);
        setEditOriginalPrice(data.original_prices[0]);
        setEditCurrentPrice(data.current_prices[0]);
        // Fetch inventory data để lấy version
        fetchInventoryVersion(data.productId, data.colors[0]);
      } else {
        setSelectedColor('Không xác định');
        setEditQuantity(data.quantities[0] || 0);
        setEditOriginalPrice(data.original_prices[0] || 0);
        setEditCurrentPrice(data.current_prices[0] || 0);
        // Fetch inventory data để lấy version
        fetchInventoryVersion(data.productId, null);
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      if (retryCount < maxRetries && isRetry) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchProduct(productId, true);
        }, 1000);
      } else {
        setProductError(
          `Không thể tải dữ liệu sản phẩm sau ${maxRetries} lần thử. Vui lòng thử lại.`
        );
      }
    } finally {
      setIsProductLoading(false);
    }
  }, [retryCount, product.type]);

  // Function để fetch inventory version
  const fetchInventoryVersion = useCallback(async (productId: string, color: string | null) => {
    try {
      const normalizedColor = color === 'Không xác định' ? null : color;
      const params = new URLSearchParams({ productId });
      if (normalizedColor) {
        params.append('color', normalizedColor);
      }
      
      const response = await fetch(`${ENV.API_URL}/inventory/product?${params.toString()}`, {
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const inventoryData = await response.json();
        setEditVersion(inventoryData.version);
        console.log('Fetched inventory version:', inventoryData.version);
      }
    } catch (error) {
      console.error('Error fetching inventory version:', error);
      // Không hiển thị error cho user vì đây là optional
    }
  }, []);

  // Function để fetch tags cho group
  const fetchGroupTags = useCallback(async (groupId: number) => {
    if (!groupId) return;
    
    setIsLoadingTags(true);
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      const response = await fetch(`${ENV.API_URL}/group-tags/get/${groupId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const data: GroupTag[] = await response.json();
        setGroupTags(data);
        console.log('Fetched group tags:', data);
      } else {
        console.error('Failed to fetch group tags:', response.status);
      }
    } catch (error) {
      console.error('Error fetching group tags:', error);
    } finally {
      setIsLoadingTags(false);
    }
  }, [user?.token]);

  // Function để fetch tất cả available tags
  const fetchAvailableTags = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      const response = await fetch(`${ENV.API_URL}/tags`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const data: Tag[] = await response.json();
        setAvailableTags(data);
        console.log('Fetched available tags:', data);
      } else {
        console.error('Failed to fetch available tags:', response.status);
      }
    } catch (error) {
      console.error('Error fetching available tags:', error);
    }
  }, [user?.token]);

  // Function để thêm tag vào group
  const addTagToGroup = async (tagId: number) => {
    if (!groupData?.groupId) return;
    
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      if (!token) {
        showNotification('Không tìm thấy token xác thực.', 'error');
        return;
      }

      const response = await fetch(`${ENV.API_URL}/group-tags?groupId=${groupData.groupId}&tagId=${tagId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      // Refresh group tags
      await fetchGroupTags(groupData.groupId);
      
      const addedTag = availableTags.find(tag => tag.tagId === tagId);
      showNotification(`Đã thêm tag "${addedTag?.tagName}" vào sản phẩm!`, 'success');
    } catch (error: any) {
      console.error('Error adding tag to group:', error);
      showNotification(error.message || 'Lỗi khi thêm tag', 'error');
    }
  };

  // Function để xóa tag khỏi group
  const removeTagFromGroup = async (tagId: number) => {
    if (!groupData?.groupId) return;
    
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      if (!token) {
        showNotification('Không tìm thấy token xác thực.', 'error');
        return;
      }

      const response = await fetch(`${ENV.API_URL}/group-tags?groupId=${groupData.groupId}&tagId=${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      // Refresh group tags
      await fetchGroupTags(groupData.groupId);
      
      const removedTag = groupTags.find(gt => gt.tagId === tagId)?.tag;
      showNotification(`Đã xóa tag "${removedTag?.tagName}" khỏi sản phẩm!`, 'success');
    } catch (error: any) {
      console.error('Error removing tag from group:', error);
      showNotification(error.message || 'Lỗi khi xóa tag', 'error');
    }
  };

  // Function để cập nhật Elasticsearch document
  const updateElasticsearchDocument = useCallback(async (groupData: GroupVariantResponse) => {
    if (!groupData.groupId || !groupData.variants || groupData.variants.length === 0) {
      throw new Error('Invalid group data for Elasticsearch update');
    }

    console.log('Updating Elasticsearch for group:', groupData.groupId);

    // Fetch product data cho tất cả variants
    const productPromises = groupData.variants.map(async (variant) => {
      try {
        const response = await fetch(`${ENV.API_URL}/products/get/${product.type}/${variant.productId}`, {
          signal: AbortSignal.timeout(10000),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product ${variant.productId}: ${response.status}`);
        }
        
        const productData = await response.json();
        
        // Fetch inventory data cho product này
        const inventoryPromises = (productData.colors || [null]).map(async (color: string | null) => {
          try {
            const params = new URLSearchParams({ productId: variant.productId });
            if (color) {
              params.append('color', color);
            }
            
            const inventoryResponse = await fetch(`${ENV.API_URL}/inventory/product?${params.toString()}`, {
              signal: AbortSignal.timeout(10000),
            });
            
            if (inventoryResponse.ok) {
              return await inventoryResponse.json();
            }
            return null;
          } catch (error) {
            console.error(`Error fetching inventory for ${variant.productId}, color ${color}:`, error);
            return null;
          }
        });

        const inventoryResults = await Promise.all(inventoryPromises);
        const validInventories = inventoryResults.filter(inv => inv !== null);

        return {
          productRequest: {
            variant: variant.variant,
            ...mapProductToElasticsearchFormat(productData)
          },
          inventoryRequests: validInventories.map(inv => ({
            color: inv.color || 'Default',
            quantity: inv.quantity || 0,
            originalPrice: inv.originalPrice || 0,
            currentPrice: inv.currentPrice || 0
          }))
        };
      } catch (error) {
        console.error(`Error processing variant ${variant.productId}:`, error);
        return null;
      }
    });

    const productResults = await Promise.all(productPromises);
    const validProducts = productResults.filter(p => p !== null);

    if (validProducts.length === 0) {
      throw new Error('No valid products found for Elasticsearch update');
    }

    // Tạo request body cho Elasticsearch
    const elasticsearchRequest = {
      products_data: validProducts,
      group_data: {
        group_id: groupData.groupId,
        group_name: groupData.groupName,
        type: product.type
      }
    };

    console.log('Elasticsearch request:', JSON.stringify(elasticsearchRequest, null, 2));

    // Gọi API cập nhật Elasticsearch
    const esResponse = await fetch(`http://localhost:5000/update-by-group-id/${groupData.groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elasticsearchRequest),
      signal: AbortSignal.timeout(30000), // Timeout dài hơn cho Elasticsearch
    });

    if (!esResponse.ok) {
      const errorData = await esResponse.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Elasticsearch update failed: ${errorData.error || esResponse.statusText}`);
    }

    const result = await esResponse.json();
    console.log('Elasticsearch update result:', result);
    return result;
  }, [product.type]);

  // Function để map product data sang format của Elasticsearch
  const mapProductToElasticsearchFormat = useCallback((productData: any) => {
    const specMap: { [key: string]: any } = {};
    
    // Map specifications từ array sang object
    if (productData.specifications) {
      productData.specifications.forEach((spec: any) => {
        if (spec.ori_name) {
          specMap[spec.ori_name] = spec.value;
        }
      });
    }

    return {
      productName: productData.productName,
      brand: productData.brand,
      promotions: productData.promotions || [],
      release: productData.release,
      // Thêm tất cả specifications
      ...specMap
    };
  }, []);

  // Function để retry fetch product
  const retryFetchProduct = () => {
    if (urlProductId) {
      fetchProduct(urlProductId, true);
    }
  };

  useEffect(() => {
    if (urlProductId && urlProductId !== product.productId) {
      fetchProduct(urlProductId, true);
    } else {
      setProduct(initialProduct);
      if (initialProduct.colors && initialProduct.colors.length > 0 && initialProduct.colors[0] != null) {
        setSelectedColor(initialProduct.colors[0]);
        setEditQuantity(initialProduct.quantities[0]);
        setEditOriginalPrice(initialProduct.original_prices[0]);
        setEditCurrentPrice(initialProduct.current_prices[0]);
        // Fetch inventory version
        fetchInventoryVersion(initialProduct.productId, initialProduct.colors[0]);
      } else {
        setSelectedColor('Không xác định');
        setEditQuantity(initialProduct.quantities[0] || 0);
        setEditOriginalPrice(initialProduct.original_prices[0] || 0);
        setEditCurrentPrice(initialProduct.current_prices[0] || 0);
        // Fetch inventory version
        fetchInventoryVersion(initialProduct.productId, null);
      }
    }
  }, [urlProductId, initialProduct, fetchProduct, fetchInventoryVersion]);

  useEffect(() => {
    const fetchVariants = async () => {
      if (!product.productId) {
        console.error('Product ID is missing');
        setError('Không thể tải thông tin sản phẩm.');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${ENV.API_URL}/inventory/related/${product.productId}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: GroupVariantResponse = await response.json();
        console.log('Fetched group data:', data);
        setGroupData(data);
        const currentVariantIndex = data.variants.findIndex(
          (v) => v.productId === product.productId
        );
        setSelectedVariantIndex(currentVariantIndex >= 0 ? currentVariantIndex : 0);
        
        // Fetch tags for the group
        if (data.groupId) {
          fetchGroupTags(data.groupId);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
  }, [product.productId, fetchGroupTags]);

  // Fetch available tags when component mounts
  useEffect(() => {
    fetchAvailableTags();
  }, [fetchAvailableTags]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const colorIndex = product.colors?.indexOf(color) ?? -1;
    if (colorIndex >= 0) {
      setEditQuantity(product.quantities[colorIndex] || 0);
      setEditOriginalPrice(product.original_prices[colorIndex] || 0);
      setEditCurrentPrice(product.current_prices[colorIndex] || 0);
    } else {
      setEditQuantity(product.quantities[0] || 0);
      setEditOriginalPrice(product.original_prices[0] || 0);
      setEditCurrentPrice(product.current_prices[0] || 0);
    }
    
    // Fetch lại version cho color mới
    fetchInventoryVersion(product.productId, color === 'Không xác định' ? null : color);
  };

  const handleVariantChange = (variantIndex: number) => {
    if (!groupData || variantIndex < 0 || variantIndex >= groupData.variants.length) {
      console.error('Invalid variant index:', variantIndex);
      return;
    }

    const newProductId = groupData.variants[variantIndex].productId;
    if (newProductId === product.productId) {
      console.log('Same productId, updating selectedVariantIndex only');
      setSelectedVariantIndex(variantIndex);
      return;
    }

    setSelectedVariantIndex(variantIndex);
    if (newProductId) {
      const type = product.type ? product.type.toLowerCase() : 'product';
      console.log('Navigating to:', `/detail/${type}/${newProductId}`);
      navigate(`/detail/${type}/${newProductId}`, { replace: true });
      fetchProduct(newProductId, true);
    }
  };

  const retryFetchVariants = () => {
    setError(null);
    setIsLoading(true);
    const fetchVariants = async () => {
      try {
        const response = await fetch(`${ENV.API_URL}/inventory/related/${product.productId}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: GroupVariantResponse = await response.json();
        console.log('Fetched group data:', data);
        setGroupData(data);
        const currentVariantIndex = data.variants.findIndex(
          (v) => v.productId === product.productId
        );
        setSelectedVariantIndex(currentVariantIndex >= 0 ? currentVariantIndex : 0);
        
        // Fetch tags for the group
        if (data.groupId) {
          fetchGroupTags(data.groupId);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
  };

  const handleSaveChanges = async () => {
    console.log('Saving changes...');
    if (editQuantity === null || editCurrentPrice === null || editOriginalPrice === null) {
      console.log('Missing required fields');
      showNotification('Vui lòng nhập đầy đủ số lượng, giá gốc và giá hiện tại.', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        showNotification('Không tìm thấy token xác thực.', 'error');
        return;
      }

      const updateParams = {
        productId: product.productId,
        productName: product.productName,
        color: selectedColor === 'Không xác định' ? null : selectedColor,
        quantity: editQuantity,
        originalPrice: editOriginalPrice,
        currentPrice: editCurrentPrice,
        version: editVersion, // Thêm version
      };

      console.log('Updating inventory with params:', updateParams);
      
      await inventoryService.updateInventory(updateParams, token);

      // Update local product state
      const colorIndex = product.colors?.indexOf(selectedColor) ?? -1;
      const updatedProduct = { ...product };
      if (colorIndex >= 0) {
        updatedProduct.quantities[colorIndex] = editQuantity;
        updatedProduct.original_prices[colorIndex] = editOriginalPrice;
        updatedProduct.current_prices[colorIndex] = editCurrentPrice;
      } else {
        updatedProduct.quantities[0] = editQuantity;
        updatedProduct.original_prices[0] = editOriginalPrice;
        updatedProduct.current_prices[0] = editCurrentPrice;
      }
      setProduct(updatedProduct);

      // Cập nhật Elasticsearch document
      if (groupData?.groupId) {
        try {
          await updateElasticsearchDocument(groupData);
          console.log('Elasticsearch document updated successfully');
        } catch (esError) {
          console.error('Error updating Elasticsearch:', esError);
          // Không hiển thị lỗi Elasticsearch cho user vì đây không phải lỗi nghiêm trọng
        }
      }

      // Fetch lại version mới sau khi update thành công
      fetchInventoryVersion(product.productId, selectedColor === 'Không xác định' ? null : selectedColor);

      showNotification('Cập nhật tồn kho thành công!', 'success');
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      
      // Xử lý optimistic locking conflict
      if (error.message && error.message.includes('được cập nhật bởi người khác')) {
        showNotification('Dữ liệu đã được cập nhật bởi người khác. Đang tải lại...', 'warning');
        // Fetch lại data mới
        fetchInventoryVersion(product.productId, selectedColor === 'Không xác định' ? null : selectedColor);
      } else {
        showNotification(error.message || 'Lỗi khi cập nhật tồn kho', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Function để save product data (thông tin sản phẩm)
  const handleSaveProductData = async () => {    
    if (!editProductData) {
      showNotification('Không có dữ liệu để cập nhật.', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      
      if (!token) {
        showNotification('Không tìm thấy token xác thực.', 'error');
        return;
      }

      // Map specifications back to the format expected by backend
      const specificationsMap: { [key: string]: any } = {};
      if (product.specifications) {
        product.specifications.forEach((spec: any) => {
          if (spec.ori_name && editProductData.specifications?.[spec.ori_name] !== undefined) {
            specificationsMap[spec.ori_name] = editProductData.specifications[spec.ori_name];
          }
        });
      }

      const productRequest = {
        productName: editProductData.productName,
        description: editProductData.description || '',
        brand: editProductData.brand,
        type: product.type,
        productReviews: editProductData.productReviews || [],
        promotions: editProductData.promotions || [],
        release: editProductData.release,
        images: editProductData.images || product.images,
        ...specificationsMap
      };

      console.log('Updating product with data:', productRequest);

      const response = await fetch(`${ENV.API_URL}/products/update/${product.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productRequest),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const updatedProduct = await response.json();
      console.log('Product updated successfully:', updatedProduct);

      // Refresh product data
      await fetchProduct(product.productId, true);

      // Cập nhật Elasticsearch document
      if (groupData?.groupId) {
        try {
          await updateElasticsearchDocument(groupData);
          console.log('Elasticsearch document updated successfully after product update');
        } catch (esError) {
          console.error('Error updating Elasticsearch after product update:', esError);
        }
      }

      setIsEditingProduct(false);
      setEditProductData(null);
      showNotification('Cập nhật thông tin sản phẩm thành công!', 'success');
    } catch (error: any) {
      console.error('Error updating product:', error);
      showNotification(error.message || 'Lỗi khi cập nhật thông tin sản phẩm', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Function để bắt đầu edit product
  const handleStartEditProduct = () => {
    const specificationsMap: { [key: string]: any } = {};
    if (product.specifications) {
      product.specifications.forEach((spec: any) => {
        if (spec.ori_name) {
          specificationsMap[spec.ori_name] = spec.value;
        }
      });
    }

    setEditProductData({
      productName: product.productName,
      description: product.description || '',
      brand: product.brand,
      productReviews: product.productReviews || [],
      promotions: product.promotions || [],
      release: product.release,
      images: product.images,
      specifications: specificationsMap
    });
    setIsEditingProduct(true);
  };

  // Function để cancel edit
  const handleCancelEditProduct = () => {
    setIsEditingProduct(false);
    setEditProductData(null);
  };

  // Function để xóa dòng sản phẩm
  const handleDeleteProductLine = async () => {
    if (!groupData?.groupId) {
      showNotification('Không tìm thấy thông tin nhóm sản phẩm.', 'error');
      return;
    }

    setIsDeletingProduct(true);
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      
      if (!token) {
        showNotification('Không tìm thấy token xác thực.', 'error');
        return;
      }

      // Tạo request body với groupId và danh sách productIds
      const deleteRequest = {
        groupId: groupData.groupId,
        productIds: groupData.variants.map(variant => variant.productId)
      };

      console.log('Deleting group with request:', deleteRequest);

      // Gọi API xóa toàn bộ group
      const response = await fetch(`${ENV.API_URL}/products/delete-group`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deleteRequest),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Group deletion result:', result);

      // Xóa document khỏi Elasticsearch
      try {
        const esResponse = await fetch(`http://localhost:5000/delete-by-group-id/${groupData.groupId}`, {
          method: 'DELETE',
          signal: AbortSignal.timeout(15000),
        });

        if (esResponse.ok) {
          console.log('Elasticsearch document deleted successfully');
        } else {
          console.error('Failed to delete Elasticsearch document');
        }
      } catch (esError) {
        console.error('Error deleting from Elasticsearch:', esError);
        // Không throw error vì việc xóa database đã thành công
      }

      // Hiển thị thông báo thành công với thông tin chi tiết
      const successMessage = result.deletedProductsCount > 0 
        ? `Đã xóa thành công dòng sản phẩm "${groupData.groupName}" bao gồm ${result.deletedProductsCount} sản phẩm!`
        : `Đã xóa thành công dòng sản phẩm "${groupData.groupName}"!`;
      
      showNotification(successMessage, 'success');
      
      // Redirect về trang chủ hoặc danh sách sản phẩm
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: any) {
      console.error('Error deleting product group:', error);
      showNotification(error.message || 'Lỗi khi xóa dòng sản phẩm', 'error');
    } finally {
      setIsDeletingProduct(false);
      setShowDeleteConfirm(false);
    }
  };

  const colorIndex = product.colors && product.colors.length > 0
    ? product.colors.indexOf(selectedColor)
    : -1;

  const currentPrice = colorIndex >= 0 && product.current_prices[colorIndex]
    ? product.current_prices[colorIndex]
    : product.current_prices[0] || 0;

  const originalPrice = colorIndex >= 0 && product.original_prices[colorIndex]
    ? product.original_prices[colorIndex]
    : product.original_prices[0] || 0;

  const quantity = colorIndex >= 0 && product.quantities[colorIndex]
    ? product.quantities[colorIndex]
    : product.quantities[0] || 0;

  const imageSrc = product.images
    ? product.images[selectedColor] || product.images['default'] || []
    : [];

  return (
    <>
      <div className="bg-[#333] text-white p-8 ml-24 mr-16">
        {isProductLoading ? (
          <div className="w-full h-screen flex items-center justify-center">
            <p className="text-gray-500">Đang tải sản phẩm...</p>
          </div>
        ) : productError ? (
          <div className="w-full h-screen flex flex-col items-center justify-center text-red-600">
            <p>{productError}</p>
            <button
              onClick={retryFetchProduct}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <ProductImageGallery thumbnails={imageSrc} />
            <div className="md:ml-8 w-full max-w-md">
              <ProductHeader title={product.productName} isNew={product.isNew} />
              <ProductPrice currentPrice={currentPrice} originalPrice={originalPrice} />
              {isLoading ? (
                <p className="text-gray-400">Đang tải phiên bản...</p>
              ) : error ? (
                <div className="text-red-600">
                  <p>{error}</p>
                  <button
                    onClick={retryFetchVariants}
                    className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <ProductOptions
                  variants={groupData?.variants || []}
                  selectedVariantIndex={selectedVariantIndex}
                  onVariantChange={handleVariantChange}
                  colorOptions={product.colors}
                  selectedColor={selectedColor}
                  onColorChange={handleColorChange}
                  editQuantity={editQuantity}
                  setEditQuantity={setEditQuantity}
                  editOriginalPrice={editOriginalPrice}
                  setEditOriginalPrice={setEditOriginalPrice}
                  editCurrentPrice={editCurrentPrice}
                  setEditCurrentPrice={setEditCurrentPrice}
                  onSaveChanges={handleSaveChanges}
                  isSaving={isSaving}
                />
              )}
              <Promotions promotions={product.promotions} />
              <ProductReviewsSection 
                productReviews={product.productReviews || []} 
              />
              
              {/* Tag Management Section */}
              <TagManagementSection
                groupData={groupData}
                groupTags={groupTags}
                availableTags={availableTags}
                isLoadingTags={isLoadingTags}
                isManagingTags={isManagingTags}
                setIsManagingTags={setIsManagingTags}
                onAddTag={addTagToGroup}
                onRemoveTag={removeTagFromGroup}
              />
              
              <AdminProductEditor
                isEditing={isEditingProduct}
                editData={editProductData}
                setEditData={setEditProductData}
                onStartEdit={handleStartEditProduct}
                onSave={handleSaveProductData}
                onCancel={handleCancelEditProduct}
                isSaving={isSavingProduct}
                product={product}
              />
              <AdminDeleteSection
                groupData={groupData}
                onDelete={() => setShowDeleteConfirm(true)}
                isDeleting={isDeletingProduct}
              />
              {showDeleteConfirm && (
                <DeleteConfirmModal
                  groupName={groupData?.groupName || ''}
                  groupData={groupData}
                  onConfirm={handleDeleteProductLine}
                  onCancel={() => setShowDeleteConfirm(false)}
                  isDeleting={isDeletingProduct}
                />
              )}
              <ActionButtons
                product={{
                  productId: product.productId,
                  productName: product.productName,
                  price: currentPrice,
                  color: selectedColor,
                  productType: product.type,
                  quantity: quantity,
                }}
                showNotification={showNotification}
              />
            </div>
          </div>
        )}
      </div>
      {!isProductLoading && !productError && (
        <div className="bg-white">
          <ProductSpecifications specifications={product.specifications} />
          <ProductReview />
        </div>
      )}
    </>
  );
};

// ... các component khác giữ nguyên ...

interface ProductHeaderProps {
  title: string;
  isNew?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ title, isNew }) => (
  <div>
    <h1 className="text-2xl md:text-3xl font-bold text-white">
      {title}
      {isNew && (
        <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">Mới</span>
      )}
    </h1>
  </div>
);

interface ProductPriceProps {
  currentPrice: number;
  originalPrice: number;
}

const ProductPrice: React.FC<ProductPriceProps> = ({ currentPrice, originalPrice }) => (
  <div className="mt-6">
    <span className="text-3xl md:text-4xl font-semibold text-white">
      {currentPrice.toLocaleString('vi-VN')} ₫
    </span>
    {originalPrice > currentPrice && (
      <span className="ml-4 text-lg md:text-xl text-gray-400 line-through">
        {originalPrice.toLocaleString('vi-VN')} ₫
      </span>
    )}
  </div>
);

interface ProductOptionsProps {
  variants: Variant[];
  selectedVariantIndex: number;
  onVariantChange: (index: number) => void;
  colorOptions: string[] | null;
  selectedColor: string;
  onColorChange: (color: string) => void;
  editQuantity: number | null;
  setEditQuantity: React.Dispatch<React.SetStateAction<number | null>>;
  editOriginalPrice: number | null;
  setEditOriginalPrice: React.Dispatch<React.SetStateAction<number | null>>;
  editCurrentPrice: number | null;
  setEditCurrentPrice: React.Dispatch<React.SetStateAction<number | null>>;
  onSaveChanges: () => void;
  isSaving: boolean;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  variants,
  selectedVariantIndex,
  onVariantChange,
  colorOptions,
  selectedColor,
  onColorChange,
  editQuantity,
  setEditQuantity,
  editOriginalPrice,
  setEditOriginalPrice,
  editCurrentPrice,
  setEditCurrentPrice,
  onSaveChanges,
  isSaving,
}) => (
  <div className="mt-8">
    {variants.length > 1 && (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white">Phiên bản</h3>
        <div className="flex flex-wrap gap-3 mt-2">
          {variants.map((variant, index) => (
            <button
              key={variant.productId}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedVariantIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => onVariantChange(index)}
              aria-selected={selectedVariantIndex === index}
            >
              {variant.variant}
            </button>
          ))}
        </div>
      </div>
    )}
    {colorOptions && colorOptions.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white">Màu sắc: {selectedColor}</h3>
        <div className="flex flex-wrap gap-3 mt-2">
          {colorOptions
            .filter((color): color is string => color != null)
            .map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? 'border-blue-600' : 'border-transparent'
                }`}
                style={{ backgroundColor: getColorCode(color) }}
                onClick={() => onColorChange(color)}
                title={color}
                aria-label={`Select color ${color}`}
              />
            ))}
        </div>
      </div>
    )}
    {/* Admin inventory controls - always visible */}
    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-3">Cập nhật tồn kho (Admin)</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Số lượng</label>
          <input
            type="number"
            min="0"
            value={editQuantity ?? ''}
            onChange={(e) => setEditQuantity(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Giá gốc (₫)</label>
          <input
            type="number"
            min="0"
            value={editOriginalPrice ?? ''}
            onChange={(e) => setEditOriginalPrice(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Giá hiện tại (₫)</label>
          <input
            type="number"
            min="0"
            value={editCurrentPrice ?? ''}
            onChange={(e) => setEditCurrentPrice(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        <button
          onClick={onSaveChanges}
          disabled={isSaving}
          className={`w-full px-4 py-2 rounded-md text-white font-medium ${
            isSaving ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  </div>
);

// Component quản lý tags
interface TagManagementSectionProps {
  groupData: GroupVariantResponse | null;
  groupTags: GroupTag[];
  availableTags: Tag[];
  isLoadingTags: boolean;
  isManagingTags: boolean;
  setIsManagingTags: (managing: boolean) => void;
  onAddTag: (tagId: number) => void;
  onRemoveTag: (tagId: number) => void;
}

const TagManagementSection: React.FC<TagManagementSectionProps> = ({
  groupData,
  groupTags,
  availableTags,
  isLoadingTags,
  isManagingTags,
  setIsManagingTags,
  onAddTag,
  onRemoveTag,
}) => {
  if (!groupData) return null;

  // Lọc ra các tags chưa được gắn vào group
  const assignedTagIds = groupTags.map(gt => gt.tagId);
  const unassignedTags = availableTags.filter(tag => !assignedTagIds.includes(tag.tagId));

  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Quản lý Tags</h3>
        <button
          onClick={() => setIsManagingTags(!isManagingTags)}
          className={`px-3 py-1 rounded text-sm font-medium ${
            isManagingTags 
              ? 'bg-gray-600 text-white hover:bg-gray-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isManagingTags ? 'Ẩn quản lý' : 'Quản lý tags'}
        </button>
      </div>

      {/* Hiển thị tags hiện tại */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Tags hiện tại:</h4>
        {isLoadingTags ? (
          <p className="text-gray-400 text-sm">Đang tải...</p>
        ) : groupTags.length === 0 ? (
          <p className="text-gray-400 text-sm">Chưa có tag nào</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groupTags.map((groupTag) => (
              <div
                key={groupTag.id}
                className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                <span>{groupTag.tag.tagName}</span>
                {isManagingTags && (
                  <button
                    onClick={() => onRemoveTag(groupTag.tagId)}
                    className="ml-2 text-red-300 hover:text-red-100 font-bold"
                    title={`Xóa tag "${groupTag.tag.tagName}"`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel quản lý tags */}
      {isManagingTags && (
        <div className="border-t border-gray-600 pt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Thêm tags mới:</h4>
          {unassignedTags.length === 0 ? (
            <p className="text-gray-400 text-sm">Tất cả tags đã được gắn vào sản phẩm này</p>
          ) : (
            <div className="space-y-2">
              {unassignedTags.map((tag) => (
                <div
                  key={tag.tagId}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded"
                >
                  <div>
                    <span className="text-white font-medium">{tag.tagName}</span>
                    {tag.description && (
                      <p className="text-gray-400 text-sm mt-1">{tag.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onAddTag(tag.tagId)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Thêm
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Thông tin debug cho admin */}
      {isManagingTags && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-white">Debug Info</summary>
            <div className="mt-2 bg-gray-900 p-2 rounded">
              <p>Group ID: {groupData.groupId}</p>
              <p>Group Name: {groupData.groupName}</p>
              <p>Assigned Tags: {assignedTagIds.join(', ') || 'None'}</p>
              <p>Available Tags: {availableTags.length}</p>
              <p>Unassigned Tags: {unassignedTags.length}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

function getColorCode(colorName: string | null | undefined): string {
  if (!colorName) {
    return '#808080';
  }
  const colorMap: Record<string, string> = {
    'titan tự nhiên': '#D2B48C',
    'titan đen': '#1C2526',
    'titan sa mạc': '#C19A6B',
    'titan trắng': '#F5F6F5',
    'đen': '#000000',
    'trắng': '#FFFFFF',
    'đỏ': '#FF0000',
    blue: '#0000FF',
    'xanh': '#008000',
    yellow: '#FFFF00',
    'tím': '#800080',
    'cam': '#FFA500',
    'hồng': '#FFC0CB',
    'xám': '#808080',
    'bạc': '#C0C0C0',
    'vàng': '#FFD700',
  };

  return colorMap[colorName.toLowerCase()] || '#808080';
}

interface ProductImageGalleryProps {
  thumbnails: Image[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ thumbnails }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [thumbnails]);

  const handlePrev = () => {
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : thumbnails.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prevIndex) => (prevIndex < thumbnails.length - 1 ? prevIndex + 1 : 0));
  };

  if (!thumbnails || thumbnails.length === 0) {
    return (
      <div className="w-full md:w-1/2 sticky top-0 h-screen flex items-center justify-center">
        <img
          src="/images/categories/phone.png"
          alt="Default product image"
          className="w-full h-[500px] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 sticky top-0 h-screen">
      <div className="relative overflow-hidden">
        <button
          className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 left-4"
          onClick={handlePrev}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <img
          src={thumbnails[selectedIndex].url}
          alt={thumbnails[selectedIndex].title}
          className="w-full h-[500px] object-contain transition-opacity duration-300"
        />
        <button
          className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 right-4"
          onClick={handleNext}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="flex space-x-2 mt-4 justify-center overflow-x-auto">
        {thumbnails.map((thumb, index) => (
          <img
            key={index}
            src={thumb.url}
            alt={thumb.title}
            className={`w-16 h-16 object-cover rounded cursor-pointer transition-transform hover:scale-105 ${
              selectedIndex === index ? 'border-2 border-blue-600 scale-110' : ''
            }`}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

interface PromotionsProps {
  promotions: string[];
}

const Promotions: React.FC<PromotionsProps> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) return null;

  const [title, ...items] = promotions;
  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mt-8 mb-6">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <ul className="list-disc list-inside space-y-2">
        {items.map((promo, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: promo }} />
        ))}
      </ul>
    </div>
  );
};

interface ActionButtonsProps {
  product: {
    productId: string;
    productName: string;
    price: number;
    color: string | null;
    productType: string;
    quantity?: number;
  };
  showNotification: (message: string, severity: 'error' | 'warning' | 'info' | 'success') => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ product, showNotification }) => {
  const { user, isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    console.log('Adding to cart:', { productId: product.productId, color: product.color, productType: product.productType });

    const cartItem: CartItem = {
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      quantity: 1,
      color: product.color === 'default' || !product.color ? 'Không xác định' : product.color,
      available: true,
    };

    try {
      await addItemToCart(user?.id || 'guest', cartItem, isAuthenticated);
      showNotification('Đã thêm vào giỏ hàng!', 'success');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showNotification(error.message || 'Lỗi khi thêm vào giỏ hàng', 'error');
    }
  };

  return (
    <div className="flex flex-col space-y-4 mt-6">
      <div className="flex space-x-4">
        <button
          onClick={handleAddToCart}
          className="flex items-center border-2 border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50"
        >
          <span className="mr-2">🛒</span> Thêm vào giỏ hàng
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
          Mua ngay
        </button>
      </div>
    </div>
  );
};

// Component hiển thị Product Reviews - bỏ isAdmin check
interface ProductReviewsSectionProps {
  productReviews: { title: string; content: string }[];
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ productReviews }) => {
  // Always show the section since this is admin version
  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mt-8 mb-6">
      <h2 className="text-lg font-medium mb-3">Đánh giá sản phẩm</h2>
      {!productReviews || productReviews.length === 0 ? (
        <p className="text-gray-400">Chưa có đánh giá nào</p>
      ) : (
        <div className="space-y-4">
          {productReviews.map((review, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-400 mb-2">{review.title}</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component cho Admin Editor - bỏ tất cả isAdmin checks
interface AdminProductEditorProps {
  isEditing: boolean;
  editData: any;
  setEditData: (data: any) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  product: Product;
}

const AdminProductEditor: React.FC<AdminProductEditorProps> = ({
  isEditing,
  editData,
  setEditData,
  onStartEdit,
  onSave,
  onCancel,
  isSaving,
  product
}) => {
  const handleAddReview = () => {
    const newReviews = [...(editData.productReviews || []), { title: '', content: '' }];
    setEditData({ ...editData, productReviews: newReviews });
  };

  const handleRemoveReview = (index: number) => {
    const newReviews = editData.productReviews.filter((_: any, i: number) => i !== index);
    setEditData({ ...editData, productReviews: newReviews });
  };

  const handleReviewChange = (index: number, field: 'title' | 'content', value: string) => {
    const newReviews = [...editData.productReviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    setEditData({ ...editData, productReviews: newReviews });
  };

  const handleAddPromotion = () => {
    const newPromotions = [...(editData.promotions || []), ''];
    setEditData({ ...editData, promotions: newPromotions });
  };

  const handleRemovePromotion = (index: number) => {
    const newPromotions = editData.promotions.filter((_: any, i: number) => i !== index);
    setEditData({ ...editData, promotions: newPromotions });
  };

  const handlePromotionChange = (index: number, value: string) => {
    const newPromotions = [...editData.promotions];
    newPromotions[index] = value;
    setEditData({ ...editData, promotions: newPromotions });
  };

  const handleSpecificationChange = (oriName: string, value: any) => {
    setEditData({
      ...editData,
      specifications: {
        ...editData.specifications,
        [oriName]: value
      }
    });
  };

  // Functions for image management
  const handleAddImageToColor = (color: string) => {
    const newImages = { ...editData.images };
    if (!newImages[color]) {
      newImages[color] = [];
    }
    newImages[color].push({ url: '', title: '' });
    setEditData({ ...editData, images: newImages });
  };

  const handleRemoveImageFromColor = (color: string, imageIndex: number) => {
    const newImages = { ...editData.images };
    newImages[color] = newImages[color].filter((_: any, i: number) => i !== imageIndex);
    if (newImages[color].length === 0) {
      delete newImages[color];
    }
    setEditData({ ...editData, images: newImages });
  };

  const handleImageChange = (color: string, imageIndex: number, field: 'url' | 'title', value: string) => {
    const newImages = { ...editData.images };
    newImages[color][imageIndex] = { ...newImages[color][imageIndex], [field]: value };
    setEditData({ ...editData, images: newImages });
  };

  const handleAddColorToImages = () => {
    const colorName = prompt('Nhập tên màu mới:');
    if (colorName && colorName.trim()) {
      const newImages = { ...editData.images };
      newImages[colorName.trim()] = [{ url: '', title: '' }];
      setEditData({ ...editData, images: newImages });
    }
  };

  const handleRemoveColorFromImages = (color: string) => {
    const newImages = { ...editData.images };
    delete newImages[color];
    setEditData({ ...editData, images: newImages });
  };

  if (!isEditing) {
    return (
      <div className="mt-6">
        <button
          onClick={onStartEdit}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          Chỉnh sửa thông tin sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-medium text-white mb-4">Chỉnh sửa thông tin sản phẩm</h3>
      
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tên sản phẩm</label>
            <input
              type="text"
              value={editData.productName || ''}
              onChange={(e) => setEditData({ ...editData, productName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Thương hiệu</label>
            <input
              type="text"
              value={editData.brand || ''}
              onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Thời điểm ra mắt</label>
            <input
              type="text"
              value={editData.release || ''}
              onChange={(e) => setEditData({ ...editData, release: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Mô tả</label>
          <textarea
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* Promotions */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-400">Khuyến mãi</label>
            <button
              type="button"
              onClick={handleAddPromotion}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Thêm
            </button>
          </div>
          <div className="space-y-2">
            {(editData.promotions || []).map((promotion: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={promotion}
                  onChange={(e) => handlePromotionChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Nhập khuyến mãi..."
                />
                <button
                  type="button"
                  onClick={() => handleRemovePromotion(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Product Reviews */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-400">Đánh giá sản phẩm</label>
            <button
              type="button"
              onClick={handleAddReview}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Thêm đánh giá
            </button>
          </div>
          <div className="space-y-4">
            {(editData.productReviews || []).map((review: any, index: number) => (
              <div key={index} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <label className="text-sm font-medium text-gray-400">Đánh giá #{index + 1}</label>
                  <button
                    type="button"
                    onClick={() => handleRemoveReview(index)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>
                <input
                  type="text"
                  value={review.title || ''}
                  onChange={(e) => handleReviewChange(index, 'title', e.target.value)}
                  placeholder="Tiêu đề đánh giá"
                  className="w-full px-3 py-2 mb-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                />
                <textarea
                  value={review.content || ''}
                  onChange={(e) => handleReviewChange(index, 'content', e.target.value)}
                  placeholder="Nội dung đánh giá"
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">Thông số kỹ thuật</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specifications?.map((spec: any) => (
              <div key={spec.ori_name}>
                <label className="block text-xs text-gray-500 mb-1">
                  {spec.name || spec.ori_name}
                </label>
                {Array.isArray(spec.value) ? (
                  <textarea
                    value={Array.isArray(editData.specifications?.[spec.ori_name]) 
                      ? editData.specifications[spec.ori_name].join('\n')
                      : (editData.specifications?.[spec.ori_name] || spec.value.join('\n'))
                    }
                    onChange={(e) => handleSpecificationChange(spec.ori_name, e.target.value.split('\n'))}
                    rows={3}
                    className="w-full px-2 py-1 text-xs bg-gray-900 text-white border border-gray-600 rounded focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                  />
                ) : (
                  <input
                    type="text"
                    value={editData.specifications?.[spec.ori_name] || spec.value || ''}
                    onChange={(e) => handleSpecificationChange(spec.ori_name, e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-gray-900 text-white border border-gray-600 rounded focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Images Management */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-400">Quản lý ảnh sản phẩm</label>
            <button
              type="button"
              onClick={handleAddColorToImages}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Thêm màu mới
            </button>
          </div>
          <div className="space-y-4">
            {Object.entries(editData.images || {}).map(([color, images]: [string, any]) => (
              <div key={color} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-medium">Màu: {color}</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddImageToColor(color)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Thêm ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveColorFromImages(color)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Xóa màu
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {images.map((image: any, imageIndex: number) => (
                    <div key={imageIndex} className="p-3 bg-gray-800 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-400">Ảnh #{imageIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageFromColor(color, imageIndex)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={image.url || ''}
                          onChange={(e) => handleImageChange(color, imageIndex, 'url', e.target.value)}
                          placeholder="URL ảnh"
                          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                        />
                        <input
                          type="text"
                          value={image.title || ''}
                          onChange={(e) => handleImageChange(color, imageIndex, 'title', e.target.value)}
                          placeholder="Tiêu đề ảnh"
                          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                        />
                        {image.url && (
                          <div className="mt-2">
                            <img
                              src={image.url}
                              alt={image.title || 'Preview'}
                              className="w-24 h-24 object-cover rounded border border-gray-600"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
              isSaving ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Component cho phần xóa sản phẩm (Admin) - bỏ isAdmin check
interface AdminDeleteSectionProps {
  groupData: GroupVariantResponse | null;
  onDelete: () => void;
  isDeleting: boolean;
}

const AdminDeleteSection: React.FC<AdminDeleteSectionProps> = ({ groupData, onDelete, isDeleting }) => {
  if (!groupData) return null;

  return (
    <div className="mt-6 p-4 bg-red-900/20 border border-red-600 rounded-lg">
      <h3 className="text-lg font-medium text-red-400 mb-3">Vùng nguy hiểm</h3>
      <div className="space-y-3">
        <div className="text-gray-300">
          <p className="font-medium">Thông tin dòng sản phẩm:</p>
          <ul className="mt-2 text-sm space-y-1">
            <li>• <span className="font-medium">Group ID:</span> {groupData.groupId}</li>
            <li>• <span className="font-medium">Tên dòng:</span> {groupData.groupName}</li>
            <li>• <span className="font-medium">Số phiên bản:</span> {groupData.variants.length}</li>
            <li>• <span className="font-medium">Các phiên bản:</span> {groupData.variants.map(v => v.variant).join(', ')}</li>
          </ul>
        </div>
        <div className="text-yellow-300 text-sm bg-yellow-900/20 p-3 rounded">
          <p className="font-medium mb-1">⚠️ Cảnh báo:</p>
          <p>Hành động này sẽ xóa TOÀN BỘ dòng sản phẩm bao gồm:</p>
          <ul className="mt-1 ml-4 space-y-1">
            <li>• Tất cả {groupData.variants.length} phiên bản sản phẩm</li>
            <li>• Toàn bộ thông tin tồn kho</li>
            <li>• Dữ liệu từ hệ thống tìm kiếm</li>
            <li>• Thông tin nhóm sản phẩm</li>
          </ul>
          <p className="mt-2 font-semibold text-red-400">Không thể hoàn tác!</p>
        </div>
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className={`mt-4 w-full px-4 py-3 rounded-md text-white font-medium ${
          isDeleting ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {isDeleting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xóa dòng sản phẩm...
          </span>
        ) : (
          `Xóa toàn bộ dòng sản phẩm "${groupData.groupName}"`
        )}
      </button>
    </div>
  );
};

// Modal xác nhận xóa
interface DeleteConfirmModalProps {
  groupName: string;
  groupData: GroupVariantResponse | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  groupName, 
  groupData,
  onConfirm, 
  onCancel, 
  isDeleting 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">⚠️ Xác nhận xóa dòng sản phẩm</h3>
        
        <div className="text-gray-300 mb-6 space-y-4">
          <div className="bg-red-900/20 border border-red-600 p-4 rounded">
            <p className="text-red-400 font-semibold mb-2">Bạn sắp xóa toàn bộ dòng sản phẩm:</p>
            <div className="text-white">
              <p><span className="font-medium">Tên dòng:</span> <span className="text-blue-400">"{groupName}"</span></p>
              {groupData && (
                <>
                  <p><span className="font-medium">Group ID:</span> {groupData.groupId}</p>
                  <p><span className="font-medium">Số phiên bản:</span> {groupData.variants.length}</p>
                </>
              )}
            </div>
          </div>

          {groupData && groupData.variants.length > 0 && (
            <div className="bg-gray-700 p-4 rounded">
              <p className="font-medium text-white mb-2">Các phiên bản sẽ bị xóa:</p>
              <ul className="text-sm space-y-1">
                {groupData.variants.map((variant, index) => (
                  <li key={variant.productId} className="text-gray-300">
                    {index + 1}. <span className="text-blue-400">{variant.variant}</span>
                    <span className="text-gray-500 text-xs ml-2">(ID: {variant.productId})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-yellow-900/30 border border-yellow-600 p-4 rounded">
            <p className="text-yellow-400 font-semibold mb-2">Dữ liệu sẽ bị xóa vĩnh viễn:</p>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>✗ Tất cả thông tin sản phẩm</li>
              <li>✗ Toàn bộ dữ liệu tồn kho (giá, số lượng)</li>
              <li>✗ Hình ảnh và mô tả sản phẩm</li>
              <li>✗ Thông số kỹ thuật</li>
              <li>✗ Đánh giá và khuyến mãi</li>
              <li>✗ Dữ liệu từ hệ thống tìm kiếm</li>
              <li>✗ Liên kết nhóm sản phẩm</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-red-400 font-bold text-lg">
              🚨 KHÔNG THỂ HOÀN TÁC 🚨
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Hãy chắc chắn rằng bạn muốn thực hiện hành động này
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 px-4 py-3 rounded-md text-white font-medium ${
              isDeleting ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xóa...
              </span>
            ) : (
              'XÁC NHẬN XÓA'
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium disabled:opacity-50"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailAdmin;