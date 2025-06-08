import React from 'react';
import { UserStatistics } from '../services/userService';

interface UserStatisticsCardsProps {
  statistics: UserStatistics;
  loading?: boolean;
}

const UserStatisticsCards: React.FC<UserStatisticsCardsProps> = ({ statistics, loading }) => {
  const cards = [
    {
      title: 'Tổng người dùng',
      value: statistics.totalUsers,
      icon: '👥',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Mới hôm nay',
      value: statistics.newUsersToday,
      icon: '🆕',
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Mới tháng này',
      value: statistics.newUsersThisMonth,
      icon: '📅',
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    },
    {
      title: 'TB địa chỉ/người',
      value: statistics.averageAddressesPerUser.toFixed(1),
      icon: '📍',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
              <div className="flex items-baseline">
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {typeof card.value === 'number' && card.value >= 1000 
                    ? `${(card.value / 1000).toFixed(1)}k` 
                    : card.value}
                </p>
              </div>
            </div>
            <div className={`${card.iconBg} p-3 rounded-full ml-4`}>
              <span className="text-xl">{card.icon}</span>
            </div>
          </div>
          
          {/* Additional insights */}
          {card.title === 'Tổng người dùng' && statistics.totalUsers > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                Tổng cộng người dùng đã đăng ký
              </span>
            </div>
          )}
          
          {card.title === 'Mới hôm nay' && statistics.newUsersToday > 0 && (
            <div className="mt-3 text-xs text-green-600 font-medium">
              +{statistics.newUsersToday} người dùng mới
            </div>
          )}
          
          {card.title === 'Mới tháng này' && statistics.newUsersThisMonth > 0 && (
            <div className="mt-3 text-xs text-indigo-600 font-medium">
              Tăng trưởng tháng này
            </div>
          )}
          
          {card.title === 'TB địa chỉ/người' && (
            <div className="mt-3 text-xs text-gray-500">
              {statistics.averageAddressesPerUser < 1 ? 'Cần khuyến khích thêm địa chỉ' : 
               statistics.averageAddressesPerUser > 2 ? 'Người dùng tích cực' : 'Trung bình tốt'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserStatisticsCards;