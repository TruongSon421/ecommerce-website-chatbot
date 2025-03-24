import { Line } from 'react-chartjs-2';

interface StatsCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
}

export default function Dashboard() {
  const stats: StatsCard[] = [
    { title: "Total Sales", value: "$24,532", icon: "💰", trend: 12.5 },
    { title: "Active Users", value: "2,345", icon: "👥", trend: -3.2 },
    { title: "New Orders", value: "154", icon: "📦", trend: 7.8 }
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales Performance',
      data: [65, 59, 80, 81, 56],
      borderColor: '#3B82F6',
      tension: 0.4
    }]
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <span className={`text-${stat.trend > 0 ? 'green' : 'red'}-500`}>
                  {stat.trend}% 
                </span>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
        <Line data={chartData} />
      </div>
    </div>
  );
}
