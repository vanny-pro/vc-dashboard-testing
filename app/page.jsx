"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  CreditCard,
  ChevronRight,
  Search,
  LayoutDashboard,
  Calendar,
  Filter,
  Package,
  Share2,
  ChevronDown,
  Moon,
  Sun,
  Zap,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Key
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { GoogleGenerativeAI } from "@google/generative-ai";

const COLORS = ['#6366f1', '#fbbf24', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'];

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-surface p-6 rounded-2xl shadow-sm border border-border-color hover:shadow-md transition-all duration-300 relative overflow-hidden group"
  >
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 relative z-10">
      <TrendingUp className="w-3 h-3 mr-1" />
      <span>+12.5% from last month</span>
    </div>
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${color} opacity-[0.03] group-hover:opacity-[0.05] transition-opacity`}></div>
  </motion.div>
);

const ChartContainer = ({ title, subtitle, children, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="bg-surface p-6 rounded-2xl shadow-sm border border-border-color h-full transition-all duration-300"
  >
    <div className="mb-6">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-text-secondary">{subtitle}</p>
    </div>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const InsightCard = ({ title, value, label, icon: Icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-surface p-4 rounded-xl border border-border-color flex items-center gap-4 group hover:border-indigo-500/30 transition-all"
  >
    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-lg group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">{title}</p>
      <p className="text-sm font-bold truncate max-w-[140px]">{value}</p>
      <p className="text-[10px] text-emerald-500 font-semibold">{label}</p>
    </div>
  </motion.div>
);

const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0
}).format(val);

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // AI Settings
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filters State
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [selectedChannel, setSelectedChannel] = useState('All Channels');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetch('/api/sales')
      .then(response => response.json())
      .then(parsedData => {
        setData(parsedData);
        if (parsedData.length > 0) {
          const dates = parsedData.map(r => r.date).filter(Boolean).sort();
          if (dates.length > 0) {
            setDateRange({ start: dates[0], end: dates[dates.length - 1] });
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading API data:', error);
        setLoading(false);
      });
  }, []);

  const filterOptions = useMemo(() => {
    const products = ['All Products', ...new Set(data.map(r => r.product))];
    const channels = ['All Channels', ...new Set(data.map(r => r.channel))];
    return { products, channels };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const dateMatch = (!dateRange.start || row.date >= dateRange.start) && 
                        (!dateRange.end || row.date <= dateRange.end);
      const productMatch = selectedProduct === 'All Products' || row.product === selectedProduct;
      const channelMatch = selectedChannel === 'All Channels' || row.channel === selectedChannel;
      return dateMatch && productMatch && channelMatch;
    });
  }, [data, dateRange, selectedProduct, selectedChannel]);

  const stats = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, row) => sum + (row.revenue || 0), 0);
    const totalOrders = filteredData.reduce((sum, row) => sum + (row.orders || 0), 0);
    const totalCost = filteredData.reduce((sum, row) => sum + (row.cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, totalProfit, aov };
  }, [filteredData]);

  // Automated Insights Calculation
  const automatedInsights = useMemo(() => {
    if (filteredData.length === 0) return null;

    const productMap = {};
    const channelMap = {};
    const dayMap = {};
    const channelConvMap = {};

    filteredData.forEach(r => {
      // Revenue maps
      if (r.product) productMap[r.product] = (productMap[r.product] || 0) + (r.revenue || 0);
      if (r.channel) channelMap[r.channel] = (channelMap[r.channel] || 0) + (r.revenue || 0);
      if (r.date) dayMap[r.date] = (dayMap[r.date] || 0) + (r.revenue || 0);
      
      // Conv map
      if (r.channel) {
        if (!channelConvMap[r.channel]) channelConvMap[r.channel] = { orders: 0, visitors: 0 };
        channelConvMap[r.channel].orders += (r.orders || 0);
        channelConvMap[r.channel].visitors += (r.visitors || 0);
      }
    });

    // Best Product (by Revenue)
    const productEntries = Object.entries(productMap).sort((a,b) => b[1] - a[1]);
    const bestProduct = productEntries[0] || ["N/A", 0];

    // Best Channel (by Revenue)
    const channelEntries = Object.entries(channelMap).sort((a,b) => b[1] - a[1]);
    const bestChannel = channelEntries[0] || ["N/A", 0];

    // Highest Revenue Day
    const dayEntries = Object.entries(dayMap).sort((a,b) => b[1] - a[1]);
    const bestDay = dayEntries[0] || ["N/A", 0];

    // Highest Conversion Rate Channel
    const convEntries = Object.entries(channelConvMap)
      .map(([name, data]) => ({ name, rate: data.visitors > 0 ? (data.orders / data.visitors) : 0 }))
      .sort((a,b) => b.rate - a.rate);
    const bestConvChannel = convEntries[0] || { name: "N/A", rate: 0 };

    return {
      bestProduct: { name: bestProduct[0], value: formatCurrency(bestProduct[1]) },
      bestChannel: { name: bestChannel[0], value: formatCurrency(bestChannel[1]) },
      bestDay: { name: bestDay[0], value: formatCurrency(bestDay[1]) },
      bestConvChannel: { name: bestConvChannel.name, value: `${(bestConvChannel.rate * 100).toFixed(1)}%` }
    };
  }, [filteredData]);

  const trendData = useMemo(() => {
    const dayMap = {};
    filteredData.forEach(row => {
      dayMap[row.date] = (dayMap[row.date] || 0) + row.revenue;
    });
    return Object.entries(dayMap).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const channelData = useMemo(() => {
    const channelMap = {};
    filteredData.forEach(row => {
      channelMap[row.channel] = (channelMap[row.channel] || 0) + row.revenue;
    });
    return Object.entries(channelMap).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const productData = useMemo(() => {
    const productMap = {};
    filteredData.forEach(row => {
      productMap[row.product] = (productMap[row.product] || 0) + row.revenue;
    });
    return Object.entries(productMap).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData]);


  const chartTheme = {
    grid: isDarkMode ? "#334155" : "#f1f5f9",
    text: isDarkMode ? "#94a3b8" : "#64748b",
    tooltipBg: isDarkMode ? "#1e293b" : "#ffffff",
    tooltipText: isDarkMode ? "#f8fafc" : "#0f172a"
  };

  const generateAIAnalysis = async () => {
    if (!apiKey) {
      alert("Please configure VITE_GEMINI_API_KEY in your .env file.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });

      const prompt = `
        You are a expert business analyst. Analyze this sales data summary and provide insights.
        
        DATA SUMMARY:
        - Total Revenue: ${formatCurrency(stats.totalRevenue)}
        - Total Orders: ${stats.totalOrders}
        - Gross Profit: ${formatCurrency(stats.totalProfit)}
        - Avg. Order Value: ${formatCurrency(stats.aov)}
        - Best Selling Product: ${automatedInsights.bestProduct.name}
        - Top Growth Channel: ${automatedInsights.bestChannel.name}
        - Highest Conv Rate Channel: ${automatedInsights.bestConvChannel.name} (${automatedInsights.bestConvChannel.value})

        RESPONSE FORMAT (JSON ONLY):
        {
          "alerts": ["alert 1", "alert 2"],
          "opportunities": ["opportunity 1", "opportunity 2"],
          "suggestions": ["suggestion 1", "suggestion 2"]
        }
        Keep each insight short (under 15 words) and use professional business language.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '');
      setAiAnalysis(JSON.parse(cleanedText));
    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("Analysis failed. Check your API key or model availability.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-main transition-colors">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-main flex text-text-primary transition-colors duration-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-border-color hidden lg:flex flex-col flex-shrink-0 transition-colors">
        <div className="p-6 sticky top-0">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">NovaDash</span>
          </div>
          <nav className="space-y-1">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg font-medium">
              <LayoutDashboard className="w-5 h-5" /> Overview
            </button>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-text-secondary hover:bg-main rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" /> Sales
            </button>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-text-secondary hover:bg-main rounded-lg transition-colors">
              <Package className="w-5 h-5" /> Products
            </button>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-text-secondary hover:bg-main rounded-lg transition-colors">
              <Share2 className="w-5 h-5" /> Channels
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-border-color">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-2">AI Settings</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-main border border-border-color rounded-lg text-[10px]">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-text-secondary">
                  {apiKey ? "API Key Configured (.env)" : "Missing API Key (.env)"}
                </span>
              </div>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-2 py-1.5 bg-main border border-border-color rounded-lg text-[10px] outline-none"
              >
                <optgroup label="Stable Models (Free Tier)">
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </optgroup>
                <optgroup label="Latest Previews (Experimental)">
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
                  <option value="gemini-3.1-pro">Gemini 3.1 Pro</option>
                  <option value="gemini-2.0-flash-thinking-exp-01-21">Gemini 2.0 Flash Thinking</option>
                  <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp</option>
                </optgroup>
                <optgroup label="Pro Models (Quota Limited)">
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=dashboard" alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold">John Doe</p>
              <p className="text-xs text-text-secondary">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-surface border-b border-border-color sticky top-0 z-30 transition-colors">
          <div className="px-8 py-4 flex justify-between items-center max-w-[1400px] mx-auto">
            <div>
              <h1 className="text-xl font-bold">Dashboard Overview</h1>
              <p className="text-xs text-text-secondary">Analytics Insights & Performance</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-main text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative group hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search report..." 
                  className="pl-10 pr-4 py-2 bg-main border-transparent rounded-xl text-sm focus:bg-surface focus:ring-1 focus:ring-indigo-500 outline-none transition-all w-48 xl:w-64"
                />
              </div>
              <button 
                onClick={generateAIAnalysis}
                disabled={isAnalyzing}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white" /> : <Sparkles className="w-4 h-4" />}
                Run AI Insights
              </button>
            </div>
          </div>

          <div className="px-8 py-3 bg-main border-t border-border-color border-b transition-colors">
            <div className="max-w-[1400px] mx-auto flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border-color shadow-sm">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-text-secondary">Filters</span>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="pl-9 pr-3 py-1.5 bg-surface border border-border-color rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="pl-9 pr-3 py-1.5 bg-surface border border-border-color rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-border-color rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none min-w-[140px]"
              >
                {filterOptions.products.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select 
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-border-color rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none min-w-[140px]"
              >
                {filterOptions.channels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <button 
                onClick={() => {
                  const dates = data.map(r => r.date).sort();
                  setDateRange({ start: dates[0], end: dates[dates.length - 1] });
                  setSelectedProduct('All Products');
                  setSelectedChannel('All Channels');
                }}
                className="ml-auto text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
          {/* Automated Insights Section */}
          {automatedInsights && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InsightCard title="Best Product" value={automatedInsights.bestProduct.name} label={`Leader in Revenue (${automatedInsights.bestProduct.value})`} icon={Package} delay={0.05} />
              <InsightCard title="Best Channel" value={automatedInsights.bestChannel.name} label={`Highest Sales Volume (${automatedInsights.bestChannel.value})`} icon={Share2} delay={0.1} />
              <InsightCard title="Top Revenue Day" value={automatedInsights.bestDay.name} label={`All-time Peak (${automatedInsights.bestDay.value})`} icon={TrendingUp} delay={0.15} />
              <InsightCard title="Top Conversion" value={automatedInsights.bestConvChannel.name} label={`Max Efficiency (${automatedInsights.bestConvChannel.value})`} icon={Zap} delay={0.2} />
            </div>
          )}

          {/* AI Insights Board */}
          <AnimatePresence>
            {aiAnalysis && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-indigo-600 dark:bg-indigo-900/40 rounded-3xl p-8 relative overflow-hidden text-white"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-indigo-200" />
                    <h2 className="text-xl font-bold tracking-tight">Gemini AI Intelligence</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Alerts */}
                    <div className="space-y-4">
                      <div className="bg-red-500/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-200" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-100">Critical Alerts</span>
                      </div>
                      <ul className="space-y-3">
                        {aiAnalysis.alerts.map((item, i) => (
                          <li key={i} className="text-sm font-medium flex gap-2 group">
                            <span className="text-indigo-300">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="space-y-4">
                      <div className="bg-emerald-500/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Opportunities</span>
                      </div>
                      <ul className="space-y-3">
                        {aiAnalysis.opportunities.map((item, i) => (
                          <li key={i} className="text-sm font-medium flex gap-2">
                            <span className="text-indigo-300">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-4">
                      <div className="bg-indigo-400/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-indigo-100" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Action Plan</span>
                      </div>
                      <ul className="space-y-3">
                        {aiAnalysis.suggestions.map((item, i) => (
                          <li key={i} className="text-sm font-medium flex gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-indigo-200 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 capitalize"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -ml-48 -mb-48"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="text-indigo-600" delay={0.1} />
            <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} color="text-amber-600" delay={0.2} />
            <StatCard title="Gross Profit" value={formatCurrency(stats.totalProfit)} icon={TrendingUp} color="text-emerald-600" delay={0.3} />
            <StatCard title="Avg. Order Value" value={formatCurrency(stats.aov)} icon={CreditCard} color="text-violet-600" delay={0.4} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ChartContainer title="Revenue Trend" subtitle="Performance over selected period" delay={0.5}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: chartTheme.text }} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: chartTheme.text }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: chartTheme.tooltipBg, color: chartTheme.tooltipText }}
                    itemStyle={{ color: chartTheme.tooltipText }}
                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ChartContainer>
            </div>
            <ChartContainer title="Channel Revenue" subtitle="Distribution by platform" delay={0.6}>
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {channelData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: chartTheme.tooltipBg, color: chartTheme.tooltipText }}
                  itemStyle={{ color: chartTheme.tooltipText }}
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              </PieChart>
            </ChartContainer>
          </div>

          <ChartContainer title="Product Performance" subtitle="Revenue by product" delay={0.7}>
            <BarChart data={productData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.grid} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartTheme.text }} width={150} />
              <Tooltip 
                cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: chartTheme.tooltipBg, color: chartTheme.tooltipText }}
                itemStyle={{ color: chartTheme.tooltipText }}
                formatter={(val) => [formatCurrency(val), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ChartContainer>

          {/* Table */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-surface rounded-2xl shadow-sm border border-border-color overflow-hidden transition-colors"
          >
            <div className="p-6 border-b border-border-color flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Recent Transactions</h2>
                <p className="text-sm text-text-secondary">Filtered sales data active view</p>
              </div>
              <div className="flex gap-2">
                 <span className="bg-main text-text-secondary text-xs font-bold px-3 py-1.5 rounded-lg border border-border-color flex items-center gap-1.5">
                   <Package className="w-3 h-3" />
                   {filteredData.length} records
                 </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-main border-y border-border-color">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Channel</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  <AnimatePresence>
                    {filteredData.map((row, idx) => (
                      <motion.tr key={`${row.date}-${row.product}-${idx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout className="hover:bg-main transition-colors">
                        <td className="px-6 py-4"><span className="text-sm font-medium">{row.date}</span></td>
                        <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">{row.product}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-text-secondary">{row.channel}</span></td>
                        <td className="px-6 py-4 text-sm font-medium">{row.orders}</td>
                        <td className="px-6 py-4 text-sm font-bold italic">{formatCurrency(row.revenue)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.revenue - row.cost)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border-color flex justify-center items-center text-xs font-medium text-slate-400">End of results</div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default App;
