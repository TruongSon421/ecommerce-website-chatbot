// src/pages/dashbroad/adminDashBroad.tsx
// src/pages/dashbroad/adminDashBroad.tsx
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import AdminNavbar from "../../components/layout/navbarAdmin";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Sales Overview" },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar />
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
       