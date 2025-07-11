// src/redux/slices/productSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productApi } from '../../services/productService';
import { Product, ProductCreateRequest, GroupVariantRequest, GroupVariant } from '../../types/product';

interface ProductState {
  products: Product[];
  groupVariants: GroupVariant[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ProductState = {
  products: [],
  groupVariants: [],
  loading: false,
  error: null,
  success: false,
};

// Async thunks
export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (data: ProductCreateRequest, { rejectWithValue }) => {
    try {
      const response = await productApi.createProduct(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const createGroupVariant = createAsyncThunk(
  'product/createGroupVariant',
  async (data: GroupVariantRequest, { rejectWithValue }) => {
    try {
      const response = await productApi.createGroupVariant(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  'product/fetchAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productApi.getAllProducts();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const fetchAllGroupVariants = createAsyncThunk(
  'product/fetchAllGroupVariants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productApi.getAllGroupVariants();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Product cases
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.products.push(action.payload);
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Group Variant cases
      .addCase(createGroupVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupVariant.fulfilled, (state, action: PayloadAction<GroupVariant>) => {
        state.loading = false;
        state.groupVariants.push(action.payload);
        state.success = true;
      })
      .addCase(createGroupVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch All Products cases
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch All Group Variants cases
      .addCase(fetchAllGroupVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllGroupVariants.fulfilled, (state, action: PayloadAction<GroupVariant[]>) => {
        state.loading = false;
        state.groupVariants = action.payload;
      })
      .addCase(fetchAllGroupVariants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProductState } = productSlice.actions;
export default productSlice.reducer;