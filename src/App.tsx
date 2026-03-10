import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MousePointerClick, 
  DollarSign, 
  Target, 
  Activity, 
  BarChart2,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const formatNumber = (num: number | string) => {
  return new Intl.NumberFormat('pt-BR').format(Number(num));
};

const formatPercent = (num: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(num);
};

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/google-ads');
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro ao carregar dados');
        }
        
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#5F6368] font-medium">Carregando dados do Google Ads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-[#EA4335] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#4285F4] text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Process KPIs
  const kpiRaw = data?.kpis?.[0]?.metrics || { cost_micros: 0, conversions: 0, clicks: 0, impressions: 0 };
  
  const cost = Number(kpiRaw.cost_micros || kpiRaw.costMicros || 0) / 1_000_000;
  const conversions = Number(kpiRaw.conversions || 0);
  const clicks = Number(kpiRaw.clicks || 0);
  const impressions = Number(kpiRaw.impressions || 0);
  
  const cpa = conversions > 0 ? cost / conversions : 0;
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const cpc = clicks > 0 ? cost / clicks : 0;

  // Process Chart Data
  const chartData = (data?.daily || []).map((day: any) => ({
    date: day.segments?.date,
    clicks: Number(day.metrics?.clicks || 0),
    cost: Number(day.metrics?.cost_micros || day.metrics?.costMicros || 0) / 1_000_000,
    conversions: Number(day.metrics?.conversions || 0)
  }));

  // Process Campaigns
  const campaigns = (data?.campaigns || []).map((camp: any) => ({
    id: camp.campaign?.id,
    name: camp.campaign?.name,
    status: camp.campaign?.status,
    budget: Number(camp.campaign_budget?.amount_micros || camp.campaignBudget?.amountMicros || 0) / 1_000_000,
    clicks: Number(camp.metrics?.clicks || 0),
    cost: Number(camp.metrics?.cost_micros || camp.metrics?.costMicros || 0) / 1_000_000,
    conversions: Number(camp.metrics?.conversions || 0)
  }));

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#202124]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#4285F4] rounded flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-medium text-[#202124]">Google Ads Dashboard</h1>
          </div>
          <div className="text-sm text-[#5F6368]">
            Últimos 30 dias
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard 
            title="Custo" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost)} 
            icon={<DollarSign className="w-5 h-5 text-[#4285F4]" />} 
          />
          <KpiCard 
            title="Conversões" 
            value={formatNumber(conversions)} 
            icon={<Target className="w-5 h-5 text-[#34A853]" />} 
          />
          <KpiCard 
            title="CPA" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cpa)} 
            icon={<Activity className="w-5 h-5 text-[#EA4335]" />} 
          />
          <KpiCard 
            title="Cliques" 
            value={formatNumber(clicks)} 
            icon={<MousePointerClick className="w-5 h-5 text-[#4285F4]" />} 
          />
          <KpiCard 
            title="CTR" 
            value={formatPercent(ctr)} 
            icon={<TrendingUp className="w-5 h-5 text-[#34A853]" />} 
          />
          <KpiCard 
            title="CPC Médio" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cpc)} 
            icon={<DollarSign className="w-5 h-5 text-[#5F6368]" />} 
          />
        </div>

        {/* Main Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-[#202124] mb-6">Desempenho: Cliques vs Custo</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA4335" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EA4335" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EAED" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#5F6368', fontSize: 12 }}
                  tickFormatter={(val) => {
                    if (!val) return '';
                    const [, month, day] = val.split('-');
                    return `${day}/${month}`;
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#5F6368', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#5F6368', fontSize: 12 }}
                  tickFormatter={(val) => `R$ ${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelFormatter={(val) => {
                    if (!val) return '';
                    const [year, month, day] = val.split('-');
                    return `${day}/${month}/${year}`;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="clicks" 
                  name="Cliques"
                  stroke="#4285F4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cost" 
                  name="Custo (R$)"
                  stroke="#EA4335" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCost)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-medium text-[#202124]">Desempenho de Campanhas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F8F9FA] text-[#5F6368] font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Campanha</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Orçamento Diário</th>
                  <th className="px-6 py-4 text-right">Custo</th>
                  <th className="px-6 py-4 text-right">Cliques</th>
                  <th className="px-6 py-4 text-right">Conversões</th>
                  <th className="px-6 py-4 text-right">CPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#5F6368]">
                      Nenhuma campanha encontrada nos últimos 30 dias.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp: any) => {
                    const cpa = camp.conversions > 0 ? camp.cost / camp.conversions : 0;
                    return (
                      <tr key={camp.id} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#1A73E8]">{camp.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${camp.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 
                              camp.status === 'PAUSED' ? 'bg-gray-100 text-gray-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {camp.status === 'ENABLED' ? 'Ativa' : camp.status === 'PAUSED' ? 'Pausada' : camp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-[#5F6368]">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(camp.budget)}
                        </td>
                        <td className="px-6 py-4 text-right text-[#202124]">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(camp.cost)}
                        </td>
                        <td className="px-6 py-4 text-right text-[#202124]">{formatNumber(camp.clicks)}</td>
                        <td className="px-6 py-4 text-right text-[#202124]">{formatNumber(camp.conversions)}</td>
                        <td className="px-6 py-4 text-right text-[#202124]">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cpa)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-[#5F6368]">{title}</h3>
        <div className="p-2 bg-[#F8F9FA] rounded-lg">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-[#202124] mt-auto">
        {value}
      </div>
    </div>
  );
}
