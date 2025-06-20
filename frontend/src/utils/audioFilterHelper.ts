import { 
  wiredEarphoneFilterData, 
  wirelessEarphoneFilterData, 
  headphoneFilterData, 
  FilterData 
} from '../types/datafilter';

/**
 * Mapping từ URL subtype sang filter data tương ứng
 */
export const AUDIO_FILTER_MAPPING = {
  'wired_earphone': wiredEarphoneFilterData,
  'wireless_earphone': wirelessEarphoneFilterData,
  'headphone': headphoneFilterData,
} as const;

/**
 * Lấy filter data dựa trên audio subtype
 */
export const getAudioFilterData = (subtype: string): FilterData => {
  return AUDIO_FILTER_MAPPING[subtype as keyof typeof AUDIO_FILTER_MAPPING] || wirelessEarphoneFilterData;
};

/**
 * Kiểm tra xem một type có phải là audio subtype không
 */
export const isAudioSubtype = (type: string): boolean => {
  return Object.keys(AUDIO_FILTER_MAPPING).includes(type);
};

/**
 * Lấy display name cho audio subtype
 */
export const getAudioSubtypeDisplayName = (subtype: string): string => {
  const nameMapping = {
    'wired_earphone': 'Tai nghe có dây',
    'wireless_earphone': 'Tai nghe không dây',
    'headphone': 'Tai nghe chụp tai',
  };
  
  return nameMapping[subtype as keyof typeof nameMapping] || subtype;
};

/**
 * Lấy icon cho audio subtype
 */
export const getAudioSubtypeIcon = (subtype: string): string => {
  const iconMapping = {
    'wired_earphone': '🎧',
    'wireless_earphone': '📻',
    'headphone': '🎵',
  };
  
  return iconMapping[subtype as keyof typeof iconMapping] || '🎵';
};

/**
 * Lấy danh sách tất cả audio subtypes với thông tin
 */
export const getAllAudioSubtypes = () => {
  return Object.keys(AUDIO_FILTER_MAPPING).map(subtype => ({
    key: subtype,
    displayName: getAudioSubtypeDisplayName(subtype),
    icon: getAudioSubtypeIcon(subtype),
    filterData: getAudioFilterData(subtype),
    filterCount: Object.keys(getAudioFilterData(subtype)).length,
  }));
};

/**
 * Utility để log filter differences cho debugging
 */
export const compareAudioFilters = () => {
  const subtypes = Object.keys(AUDIO_FILTER_MAPPING);
  
  console.group('🎧 Audio Filter Comparison');
  
  subtypes.forEach(subtype => {
    const data = getAudioFilterData(subtype);
    const sections = Object.keys(data);
    
    console.group(`${getAudioSubtypeIcon(subtype)} ${getAudioSubtypeDisplayName(subtype)}`);
    console.log('Filter sections:', sections);
    
    sections.forEach(section => {
      const sectionData = data[section];
      if (Array.isArray(sectionData) && sectionData.length > 0) {
        console.log(`  ${section}:`, {
          label: sectionData[0].label,
          optionsCount: sectionData[0].options?.length || 0,
          multiSelect: sectionData[0].multiSelect,
          isSearchable: sectionData[0].isSearchable,
        });
      }
    });
    
    console.groupEnd();
  });
  
  console.groupEnd();
}; 