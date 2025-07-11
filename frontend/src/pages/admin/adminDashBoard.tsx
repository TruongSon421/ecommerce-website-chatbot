<<<<<<< HEAD

=======
>>>>>>> server
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
<<<<<<< HEAD
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
=======
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { getOrderStatistics } from "../../services/orderService";
import { getPendingReviews } from "../../services/reviewService";
import { productApi } from "../../services/productService";
import ENV from "../../config/env";
>>>>>>> server

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
<<<<<<< HEAD
  Title,
  Tooltip,
  Legend
);

interface StatsCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
}

const fetchDashboardData = async () => {
  return {
    stats: [
      { title: "Total Sales", value: "$24,532", icon: "💰", trend: 12.5 },
      { title: "Active Users", value: "2,345", icon: "👥", trend: -3.2 },
      { title: "New Orders", value: "154", icon: "📦", trend: 7.8 },
    ],
    chartData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Sales Performance",
          data: [65, 59, 80, 81, 56, 72],
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
  };
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchDashboardData();
      setStats(data.stats);
      setChartData(data.chartData);
      setLoading(false);
    };
    loadData();
  }, []);

=======
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  orders: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  users: {
    totalUsers: number;
    newUsersThisMonth: number;
    newUsersToday: number;
  };
  reviews: {
    totalPendingReviews: number;
  };
  products: {
    totalProducts: number;
  };
}

interface RecentOrder {
  orderId: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data from multiple services
      const [orderStats, pendingReviews, userStats, productsList, ordersData] = await Promise.all([
        fetchOrderStatistics(),
        fetchPendingReviews(),
        fetchUserStatistics(),
        fetchProductsList(),
        fetchRecentOrders()
      ]);

      setStats({
        orders: orderStats,
        users: userStats,
        reviews: {
          totalPendingReviews: pendingReviews.totalElements || 0,
        },
        products: {
          totalProducts: productsList.length || 0,
        },
      });

      setRecentOrders(ordersData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatistics = async () => {
    try {
      const data = await getOrderStatistics();
      return {
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        pendingOrders: data.pendingOrders || 0,
        completedOrders: data.completedOrders || 0,
        cancelledOrders: data.cancelledOrders || 0,
      };
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
      };
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const data = await getPendingReviews(0, 1);
      return data;
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      return { totalElements: 0, content: [] };
    }
  };

  const fetchUserStatistics = async () => {
    try {
      const response = await fetch(`${ENV.API_URL}/users/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          totalUsers: data.totalUsers || 0,
          newUsersThisMonth: data.newUsersThisMonth || 0,
          newUsersToday: data.newUsersToday || 0,
        };
      }
      throw new Error('Failed to fetch user statistics');
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return {
        totalUsers: 0,
        newUsersThisMonth: 0,
        newUsersToday: 0,
      };
    }
  };

  const fetchProductsList = async () => {
    try {
      const data = await productApi.getAllProducts();
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { getAllOrdersForAdmin } = await import('../../services/orderService');
      const data = await getAllOrdersForAdmin(0, 5, 'createdAt', 'desc');
      
      return data.orders.map(order => ({
        orderId: order.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        userId: order.userId,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'CREATED': 'text-blue-600 bg-blue-100',
      'PAYMENT_PENDING': 'text-orange-600 bg-orange-100',
      'PAYMENT_COMPLETED': 'text-green-600 bg-green-100',
      'PROCESSING': 'text-blue-600 bg-blue-100',
      'SHIPPED': 'text-purple-600 bg-purple-100',
      'DELIVERED': 'text-green-600 bg-green-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'FAILED': 'text-red-600 bg-red-100',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  };

  // Chart data
  const orderStatusChartData = stats ? {
    labels: ['Đã hoàn thành', 'Đang xử lý', 'Đã hủy'],
    datasets: [
      {
        data: [
          stats.orders.completedOrders,
          stats.orders.pendingOrders,
          stats.orders.cancelledOrders,
        ],
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444',
        ],
        borderWidth: 0,
      },
    ],
  } : null;

  const revenueChartData = {
    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: [12000000, 15000000, 8000000, 20000000, 18000000, 25000000, 22000000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

>>>>>>> server
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
<<<<<<< HEAD
      title: { display: true, text: "Sales Overview" },
=======
>>>>>>> server
    },
    scales: { y: { beginAtZero: true } },
  };

<<<<<<< HEAD
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 text-sm">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <span
                        className={`text-sm ${stat.trend > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {stat.trend > 0 ? "↑" : "↓"} {Math.abs(stat.trend)}%
                      </span>
                    </div>
                    <div className="text-4xl opacity-70">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Sales Overview</h2>
                <select className="p-2 border rounded-md text-gray-700">
                  <option value="6m">Last 6 Months</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600">
                <th className="p-2">Order ID</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Total</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">#1234</td>
                <td className="p-2">John Doe</td>
                <td className="p-2">$150.00</td>
                <td className="p-2 text-green-500">Completed</td>
              </tr>
              {/* Thêm dữ liệu giả lập hoặc từ API */}
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
=======
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 p-6 bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Đang tải dữ liệu dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 p-6 bg-gray-100">
          <div className="text-center text-red-500">
            <p className="mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển Admin</h1>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Tổng doanh thu</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats ? formatCurrency(stats.orders.totalRevenue) : '0 ₫'}
                </p>
                <span className="text-sm text-green-500">📈 Tăng trưởng</span>
              </div>
              <div className="text-4xl opacity-70">💰</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.orders.totalOrders || 0}
                </p>
                <span className="text-sm text-blue-500">📦 Đơn hàng</span>
              </div>
              <div className="text-4xl opacity-70">🛍️</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Người dùng</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.users.totalUsers || 0}
                </p>
                <span className="text-sm text-purple-500">
                  👥 {stats?.users.newUsersToday || 0} mới hôm nay
                </span>
              </div>
              <div className="text-4xl opacity-70">👥</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Sản phẩm</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.products.totalProducts || 0}
                </p>
                <span className="text-sm text-orange-500">
                  ⭐ {stats?.reviews.totalPendingReviews || 0} đánh giá chờ duyệt
                </span>
              </div>
              <div className="text-4xl opacity-70">📱</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Doanh thu theo tuần</h2>
              <select className="p-2 border rounded-md text-gray-700">
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
            <Line data={revenueChartData} options={chartOptions} />
          </div>

          {/* Order Status Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Trạng thái đơn hàng</h2>
            {orderStatusChartData && (
              <Doughnut
                data={orderStatusChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom" as const },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Đơn hàng gần đây</h2>
            <a
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Xem tất cả →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="p-3">Mã đơn hàng</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.orderId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">#{order.orderId.slice(-8)}</td>
                      <td className="p-3">{order.userId}</td>
                      <td className="p-3">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-gray-500">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <a
            href="/admin/orders"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium">Quản lý đơn hàng</div>
          </a>
          
          <a
            href="/admin/products"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📱</div>
            <div className="font-medium">Quản lý sản phẩm</div>
          </a>
          
          <a
            href="/admin/users"
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium">Quản lý người dùng</div>
          </a>
          
          <a
            href="/admin/reviews"
            className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
          >
            <div className="text-2xl mb-2">⭐</div>
            <div className="font-medium">Quản lý đánh giá</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
>>>>>>> server
       