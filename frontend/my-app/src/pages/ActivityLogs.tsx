// src/pages/ActivityLog.tsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./ActivityLog.css";
import "./AdminDashboard.css";
import Sidebar from "./Sidebar";
import logo from '../images/logo.png';
import API_URL from '../utils/config';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface HistoryRecord {
  id: number;
  history_date: string;
  history_type: string; // "+", "~", "-"
  history_user: string | null;
  model_name: string;
}

const historyTypeMap: Record<string, string> = {
  "+": "Created",
  "~": "Updated",
  "-": "Deleted",
};

const COLORS = ['#2e6F40', '#FFC107', '#DC3545', '#17A2B8', '#6F42C1', '#E83E8C', '#20C997', '#FD7E14'];

const ActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterModel, setFilterModel] = useState<string>("all"); // "all" or specific model name
  const [filterUser, setFilterUser] = useState<string>("all"); // "all" or specific user
  const [showGraphs, setShowGraphs] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Fetch all records from backend
        const res = await axios.get(`${API_URL}/user-history/`, {
          withCredentials: true,
        });
        
        // Ensure we get an array of records
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        
        if (data.length === 0) {
          toast.info("No activity records found");
        } else {
          toast.success(`Loaded ${data.length} activity records`);
        }
        
        setRecords(data);
      } catch (err: any) {
        console.error("Failed to fetch history", err);
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || "Failed to fetch activity log";
        toast.error(errorMessage);
        setRecords([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Get unique values for filters
  const uniqueModels = useMemo(() => {
    return Array.from(new Set(records.map(r => r.model_name))).sort();
  }, [records]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(records.map(r => r.history_user || "System").filter(Boolean))).sort();
  }, [records]);

  // Filter and sort records based on selected filters - using useMemo to ensure reactivity
  const filteredRecords = useMemo(() => {
    // Start with all records
    let result = records;

    // Apply Model filter - must match exactly (case-sensitive)
    if (filterModel && filterModel !== "all") {
      result = result.filter((record) => {
        return record.model_name && record.model_name === filterModel;
      });
    }

    // Apply User filter - must match exactly (case-sensitive)
    if (filterUser && filterUser !== "all") {
      result = result.filter((record) => {
        const userName = record.history_user || "System";
        return userName === filterUser;
      });
    }

    // Sort by date (newest first)
    return [...result].sort((a, b) => {
      const dateA = new Date(a.history_date).getTime();
      const dateB = new Date(b.history_date).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [records, filterModel, filterUser]);

  // Chart data calculations
  const activityOverTime = useMemo(() => {
    const dateMap = new Map<string, number>();
    filteredRecords.forEach(record => {
      const date = new Date(record.history_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
    
    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  }, [filteredRecords]);

  const activityByType = useMemo(() => {
    const typeMap = new Map<string, number>();
    filteredRecords.forEach(record => {
      const type = historyTypeMap[record.history_type] || record.history_type;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredRecords]);

  const activityByModel = useMemo(() => {
    const modelMap = new Map<string, number>();
    filteredRecords.forEach(record => {
      const model = record.model_name || 'Unknown';
      modelMap.set(model, (modelMap.get(model) || 0) + 1);
    });
    
    return Array.from(modelMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 models
  }, [filteredRecords]);

  const activityByUser = useMemo(() => {
    const userMap = new Map<string, number>();
    filteredRecords.forEach(record => {
      const user = record.history_user || 'System';
      userMap.set(user, (userMap.get(user) || 0) + 1);
    });
    
    return Array.from(userMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 users
  }, [filteredRecords]);

  const activityByHour = useMemo(() => {
    const hourMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) {
      hourMap.set(i, 0);
    }
    
    filteredRecords.forEach(record => {
      const hour = new Date(record.history_date).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    
    return Array.from(hourMap.entries())
      .map(([hour, count]) => ({ 
        hour: `${hour.toString().padStart(2, '0')}:00`, 
        count 
      }));
  }, [filteredRecords]);

  const activityByDayOfWeek = useMemo(() => {
    const dayMap = new Map<string, number>();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => dayMap.set(day, 0));
    
    filteredRecords.forEach(record => {
      const day = days[new Date(record.history_date).getDay()];
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    
    return Array.from(dayMap.entries())
      .map(([day, count]) => ({ day: day.substring(0, 3), count }));
  }, [filteredRecords]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="activity-log-container">
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #2e6F40',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading activity log...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="activity-log-container">
            <div className="header-section">
              <h2>Activity Log</h2>
            </div>

            {/* Stats Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-value">{records.length}</div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#2e6F40' }}>
                  {filteredRecords.length}
                </div>
                <div className="stat-label">Filtered Results</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#007bff' }}>
                  {uniqueModels.length}
                </div>
                <div className="stat-label">Models</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#6c757d' }}>
                  {uniqueUsers.length}
                </div>
                <div className="stat-label">Users</div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
              {/* Model Filter */}
              <div className="filter-group">
                <label>Filter by Model:</label>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                >
                  <option value="all">All Models</option>
                  {uniqueModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div className="filter-group">
                <label>Filter by User:</label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                >
                  <option value="all">All Users</option>
                  {uniqueUsers.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              {(filterModel !== "all" || filterUser !== "all") && (
                <div className="filter-group">
                  <button
                    onClick={() => {
                      setFilterModel("all");
                      setFilterUser("all");
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginTop: "25px"
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Clickable Graphs Section Header */}
            {filteredRecords.length > 0 && (
              <div 
                className="graphs-header"
                onClick={() => setShowGraphs(!showGraphs)}
                style={{
                  background: 'white',
                  padding: '20px 25px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                <h3 style={{ 
                  margin: 0,
                  color: '#2c3e50',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>📊</span>
                  Activity Analytics & Visualizations
                </h3>
                <span style={{
                  fontSize: '1.5rem',
                  color: '#2e6F40',
                  transition: 'transform 0.3s ease',
                  transform: showGraphs ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
            )}

            {/* Graphs Section - Collapsible */}
            {showGraphs && filteredRecords.length > 0 && (
              <div className="charts-section">
                <div className="charts-grid">
                  {/* Activity Over Time */}
                  <div className="chart-card">
                    <h4 className="chart-title">Activity Over Time (Last 30 Days)</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={activityOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={activityOverTime.length > 7 ? Math.floor(activityOverTime.length / 7) : 0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#2e6F40" 
                          fill="#2e6F40" 
                          fillOpacity={0.6}
                          name="Activities"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Activity by Type */}
                  <div className="chart-card">
                    <h4 className="chart-title">Activity by Type</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={activityByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          {activityByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Activity by Model */}
                  <div className="chart-card">
                    <h4 className="chart-title">Top 10 Models by Activity</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityByModel} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#2e6F40" name="Activities" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Activity by User */}
                  <div className="chart-card">
                    <h4 className="chart-title">Top 10 Users by Activity</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityByUser}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#007bff" name="Activities" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Activity by Hour */}
                  <div className="chart-card">
                    <h4 className="chart-title">Activity by Hour of Day</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={activityByHour}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#E83E8C" 
                          strokeWidth={2}
                          name="Activities"
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Activity by Day of Week */}
                  <div className="chart-card">
                    <h4 className="chart-title">Activity by Day of Week</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activityByDayOfWeek}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#20C997" name="Activities" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <div style={{ 
              marginBottom: '20px', 
              color: '#666', 
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '10px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
            </div>

          <div className="activity-log-table-container">
            <table className="activity-log-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Model</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ 
                      textAlign: 'center', 
                      padding: '60px 20px', 
                      color: '#666',
                      background: '#f8f9fa'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>📋</div>
                      <h3 style={{ marginBottom: '10px', color: '#333' }}>No Records Found</h3>
                      <p style={{ margin: 0 }}>
                        No activity records match your current filters. Try adjusting your filter selections.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => {
                    const dateObj = new Date(record.history_date);
                    // Create a unique key by combining id, model_name, and history_date to avoid duplicates
                    const uniqueKey = `${record.id}-${record.model_name}-${record.history_date}-${index}`;
                    const actionType = historyTypeMap[record.history_type] || record.history_type;
                    const actionClass = actionType.toLowerCase();
                    return (
                      <tr key={uniqueKey}>
                        <td style={{ fontWeight: 500, color: '#2c3e50' }}>
                          {dateObj.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td style={{ color: '#666', fontFamily: 'monospace' }}>
                          {dateObj.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true 
                          })}
                        </td>
                        <td style={{ fontWeight: 500 }}>{record.history_user || "System"}</td>
                        <td>
                          <span className={`action-badge ${actionClass}`}>
                            {actionType}
                          </span>
                        </td>
                        <td style={{ color: '#555' }}>{record.model_name}</td>
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
    </>
  );
};

export default ActivityLog;
