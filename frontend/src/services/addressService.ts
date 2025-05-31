import axios from 'axios';
import { Province, District, Ward } from '../types/cart';

const API_BASE_URL = 'https://provinces.open-api.vn/api';

export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await axios.get<Province[]>(`${API_BASE_URL}/p/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch provinces:', error);
    return [];
  }
};

export const getDistricts = async (provinceCode: number): Promise<District[]> => {
  try {
    const response = await axios.get<{ districts: District[] }>(
      `${API_BASE_URL}/p/${provinceCode}?depth=2`
    );
    return response.data.districts;
  } catch (error) {
    console.error('Failed to fetch districts:', error);
    return [];
  }
};

export const getWards = async (districtCode: number): Promise<Ward[]> => {
  try {
    const response = await axios.get<{ wards: Ward[] }>(
      `${API_BASE_URL}/d/${districtCode}?depth=2`
    );
    return response.data.wards;
  } catch (error) {
    console.error('Failed to fetch wards:', error);
    return [];
  }
};