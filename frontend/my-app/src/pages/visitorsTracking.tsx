import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./visitorsTracking.css";
import "./AdminDashboard.css";
import { getToken, logout } from "../utils/auth";
import Sidebar from "./Sidebar";

// Interfaces
interface Visitor {
  id: number;
  name: string;
  gmail?: string;
  contact_number?: string;
  reason?: string;
  status: string;
  time_in?: string;
  time_out?: string;
}

interface VisitorRequestItem {
  id: number;
  resident: number;
  resident_username: string;
  resident_email: string;
  resident_name: string;
  visitor_name: string;
  visitor_email: string;
  visitor_contact_number: string;
  vehicle_plate_number?: string | null;
  reason?: string;
  one_time_pin?: string | null;
  visit_date: string;
  visit_end_date?: string | null;
  visit_start_time: string;
  visit_end_time: string;
  status: 'pending_admin' | 'approved' | 'declined' | 'expired' | 'used';
  approved_by?: number | null;
  approved_by_username?: string | null;
  approved_at?: string | null;
  declined_reason?: string | null;
  pdf_generated?: boolean;
  pdf_file_path?: string | null;
  pdf_url?: string | null;
  email_sent?: boolean;
  email_sent_at?: string | null;
  is_valid?: boolean;
  pin_entered_at?: string | null;
  created_at: string;
  updated_at: string;
}

const API_URL = "http://127.0.0.1:8000/api";
const VISITOR_REQUESTS_API = `${API_URL}/visitor-requests/`;

const VisitorsTracking: React.FC = () => {
  const navigate = useNavigate();
  const token = getToken();

  // Visitor states (removed - Visitors section no longer needed)

  // Visitor Request states
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequestItem[]>([]);
  const [visitorRequestFilter, setVisitorRequestFilter] = useState<'all' | 'pending_admin' | 'approved' | 'declined'>('all');
  const [visitorRequestSearch, setVisitorRequestSearch] = useState('');

  // Collapsible sections
  const [requestsExpanded, setRequestsExpanded] = useState(true);
  const [pinActivityExpanded, setPinActivityExpanded] = useState(true);

  // Loading states
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }
    fetchVisitorRequests();
  }, [token, navigate]);

  // ==================== VISITOR FUNCTIONS ====================
  // (Removed - Visitors section no longer needed)

  // ==================== VISITOR REQUEST FUNCTIONS ====================
  const fetchVisitorRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await axios.get(VISITOR_REQUESTS_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setVisitorRequests(data);
    } catch (err: any) {
      console.error('Error fetching visitor requests:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveVisitorRequest = async (id: number) => {
    try {
      const response = await axios.post(
        `${VISITOR_REQUESTS_API}${id}/approve/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Visitor request approved! Email sent to homeowner with PDF.');
      await fetchVisitorRequests();
    } catch (err: any) {
      console.error('Error approving visitor request:', err);
      let errorMessage = 'Failed to approve visitor request.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          logout();
          navigate('/login');
        } else if (err.response.data) {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          }
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeclineVisitorRequest = async (id: number) => {
    const declinedReason = window.prompt('Please provide a reason for declining this request (optional):') || '';
    
    try {
      const response = await axios.post(
        `${VISITOR_REQUESTS_API}${id}/decline/`,
        { declined_reason: declinedReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Visitor request declined.');
      await fetchVisitorRequests();
    } catch (err: any) {
      console.error('Error declining visitor request:', err);
      let errorMessage = 'Failed to decline visitor request.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          logout();
          navigate('/login');
        } else if (err.response.data) {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          }
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteVisitorRequest = async (id: number) => {
    const request = visitorRequests.find(r => r.id === id);
    const isUsed = request?.status === 'used';
    
    const confirmMessage = isUsed 
      ? 'This request has been used (visitor already checked in). Are you sure you want to delete it? This action cannot be undone.'
      : 'Are you sure you want to delete this visitor request? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await axios.delete(
        `${VISITOR_REQUESTS_API}${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Visitor request deleted successfully.');
      await fetchVisitorRequests();
    } catch (err: any) {
      console.error('Error deleting visitor request:', err);
      let errorMessage = 'Failed to delete visitor request.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          logout();
          navigate('/login');
        } else if (err.response.data) {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          }
        }
      }
      
      toast.error(errorMessage);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  const formatTime = (time?: string) => {
    if (!time) return "-";
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDate = (time?: string) => {
    if (!time) return "-";
    const date = new Date(time);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_admin': return '#ff9800';
      case 'approved': return '#4CAF50';
      case 'declined': return '#f44336';
      case 'expired': return '#9e9e9e';
      case 'used': return '#2196F3';
      case 'pending': return '#ff9800';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_admin': return 'Pending Admin Approval';
      case 'approved': return 'Approved';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      case 'used': return 'Used';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get PIN validity status based on request status and time window
  const getPinValidityStatus = (req: VisitorRequestItem) => {
    const now = new Date();
    
    // Check basic status first
    if (req.status === 'declined') {
      return { status: 'declined', label: 'Declined', color: '#f44336' };
    }
    if (req.status === 'pending_admin') {
      return { status: 'pending', label: 'Pending Approval', color: '#ff9800' };
    }
    if (req.status === 'expired') {
      return { status: 'expired', label: 'Expired', color: '#9e9e9e' };
    }
    if (req.status === 'used') {
      return { status: 'used', label: 'Used', color: '#2196F3' };
    }
    
    // For approved status, check time validity
    if (req.status === 'approved') {
      if (!req.visit_date || !req.visit_start_time || !req.visit_end_time) {
        return { status: 'approved', label: 'Approved', color: '#4CAF50' };
      }
      
      // Parse visit date and times
      const visitStartDate = new Date(req.visit_date);
      const visitEndDate = req.visit_end_date ? new Date(req.visit_end_date) : visitStartDate;
      
      // Parse times
      const [startHours, startMinutes] = req.visit_start_time.split(':').map(Number);
      const [endHours, endMinutes] = req.visit_end_time.split(':').map(Number);
      
      // Create datetime objects
      const visitStart = new Date(visitStartDate);
      visitStart.setHours(startHours, startMinutes, 0, 0);
      
      const visitEnd = new Date(visitEndDate);
      visitEnd.setHours(endHours, endMinutes, 0, 0);
      
      // If end time is before start time on same day, assume it spans to next day
      if (visitEnd <= visitStart && visitStartDate.getTime() === visitEndDate.getTime()) {
        visitEnd.setDate(visitEnd.getDate() + 1);
      }
      
      // Check time validity
      if (now < visitStart) {
        return { status: 'not_ready', label: 'Not Yet Ready', color: '#ff9800' };
      } else if (now > visitEnd) {
        return { status: 'expired', label: 'Expired', color: '#9e9e9e' };
      } else {
        return { status: 'approved', label: 'Approved (Ready)', color: '#4CAF50' };
      }
    }
    
    return { status: 'unknown', label: 'Unknown', color: '#666' };
  };

  // ==================== FILTERED DATA ====================
  // Filter visitor requests
  const filteredRequests = visitorRequests.filter(req => {
    if (visitorRequestFilter !== 'all' && req.status !== visitorRequestFilter) {
      return false;
    }
    if (visitorRequestSearch) {
      const searchLower = visitorRequestSearch.toLowerCase();
      return (
        req.visitor_name.toLowerCase().includes(searchLower) ||
        req.visitor_email.toLowerCase().includes(searchLower) ||
        req.resident_username.toLowerCase().includes(searchLower) ||
        (req.one_time_pin && req.one_time_pin.includes(searchLower))
      );
    }
    return true;
  });

  // ==================== STATS ====================
  const requestStats = {
    total: visitorRequests.length,
    pending: visitorRequests.filter(r => r.status === 'pending_admin').length,
    approved: visitorRequests.filter(r => r.status === 'approved').length,
    declined: visitorRequests.filter(r => r.status === 'declined').length,
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="visitors-tracking-container">
            <div className="header-section">
              <h2>Visitors Tracking</h2>
              <p style={{ color: '#666', marginTop: '5px' }}>Manage visitor requests and track PIN entry activity</p>
            </div>

            {/* Combined Stats Dashboard */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              {/* Visitor Request Stats */}
              <div style={{ 
                padding: '20px', 
                background: '#3b82f6', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                color: 'white'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>Total Requests</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{requestStats.total}</div>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>{requestStats.pending}</div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>Pending Approval</div>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{requestStats.approved}</div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>Approved</div>
              </div>
              <div style={{ 
                padding: '20px', 
                background: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                  {visitorRequests.filter(r => r.pin_entered_at).length}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>PIN Entries</div>
              </div>
            </div>

            {/* Visitor Requests Section */}
            <div style={{ 
              marginBottom: '30px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => setRequestsExpanded(!requestsExpanded)}
              >
                <h3 style={{ margin: 0, color: '#2e6F40', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span></span>
                  Visitor Requests
                  {requestStats.pending > 0 && (
                    <span style={{
                      background: '#ff9800',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {requestStats.pending} pending
                    </span>
                  )}
                </h3>
                <span style={{ fontSize: '20px', color: '#666' }}>
                  {requestsExpanded ? '▼' : '▶'}
                </span>
              </div>

              {requestsExpanded && (
                <div style={{ padding: '20px' }}>
                  {/* Filters */}
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <select
                      value={visitorRequestFilter}
                      onChange={(e) => setVisitorRequestFilter(e.target.value as any)}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                    >
                      <option value="all">All Status</option>
                      <option value="pending_admin">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search by visitor name, email, homeowner, or PIN..."
                      value={visitorRequestSearch}
                      onChange={(e) => setVisitorRequestSearch(e.target.value)}
                      style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                    />
                    <button
                      onClick={fetchVisitorRequests}
                      disabled={loadingRequests}
                      style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#2e6F40', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontSize: '14px', 
                        fontWeight: 'bold' 
                      }}
                    >
                      {loadingRequests ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>

                  {/* Requests List */}
                  {loadingRequests ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading requests...</div>
                  ) : filteredRequests.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      <p style={{ fontSize: '16px' }}>No visitor requests found.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                      {filteredRequests.map((req) => (
                        <div
                          key={req.id}
                          style={{
                            padding: '20px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            borderLeft: `4px solid ${getStatusColor(req.status)}`
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div>
                              <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{req.visitor_name}</h4>
                              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '14px', color: '#666' }}>
                                <span><strong>Email:</strong> {req.visitor_email}</span>
                                <span><strong>Contact:</strong> {req.visitor_contact_number || 'N/A'}</span>
                                {req.vehicle_plate_number && (
                                  <span><strong>Vehicle Plate:</strong> {req.vehicle_plate_number}</span>
                                )}
                                <span><strong>Homeowner:</strong> {req.resident_name || req.resident_username}</span>
                              </div>
                            </div>
                            <span
                              style={{
                                padding: '6px 12px',
                                borderRadius: '12px',
                                backgroundColor: getStatusColor(req.status),
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {getStatusText(req.status)}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px', fontSize: '14px' }}>
                            <div><strong>Visit Date:</strong> {new Date(req.visit_date).toLocaleDateString()}
                              {req.visit_end_date && req.visit_end_date !== req.visit_date && (
                                <span> - {new Date(req.visit_end_date).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div><strong>Time:</strong> {req.visit_start_time} - {req.visit_end_time}</div>
                            {req.one_time_pin && (
                              <div>
                                <strong>PIN:</strong> <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: '#2e6F40' }}>{req.one_time_pin}</span>
                              </div>
                            )}
                            {req.pin_entered_at && (
                              <div style={{ 
                                padding: '8px 12px', 
                                background: '#e3f2fd', 
                                borderRadius: '6px',
                                borderLeft: '3px solid #2196F3'
                              }}>
                                <strong>🔑 PIN Entered:</strong> {new Date(req.pin_entered_at).toLocaleString()}
                              </div>
                            )}
                            {req.reason && <div><strong>Reason:</strong> {req.reason}</div>}
                          </div>

                          {req.approved_by_username && (
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                              <strong>Approved by:</strong> {req.approved_by_username} on {req.approved_at ? new Date(req.approved_at).toLocaleString() : 'N/A'}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                            {req.status === 'pending_admin' && (
                              <>
                                <button
                                  onClick={() => handleApproveVisitorRequest(req.id)}
                                  style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleDeclineVisitorRequest(req.id)}
                                  style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  ✗ Decline
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteVisitorRequest(req.id)}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>

                          <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                            Created: {new Date(req.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PIN Entry Activity Log Section */}
            <div style={{ 
              marginBottom: '30px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <h3 style={{ margin: 0, color: '#2e6F40', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🔑</span>
                  PIN Entry Activity Log
                  {visitorRequests.filter(r => r.pin_entered_at).length > 0 && (
                    <span style={{
                      background: '#2196F3',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {visitorRequests.filter(r => r.pin_entered_at).length} entries
                    </span>
                  )}
                </h3>
              </div>

              <div style={{ padding: '20px' }}>
                  {visitorRequests.filter(r => r.pin_entered_at).length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      <p style={{ fontSize: '16px' }}>No PIN entries recorded yet.</p>
                      <p style={{ fontSize: '14px', marginTop: '10px', color: '#999' }}>PIN entries will appear here when guards enter PINs at the guard station.</p>
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table className="visitors-table">
                        <thead>
                          <tr>
                            <th>Visitor Name</th>
                            <th>PIN</th>
                            <th>Homeowner</th>
                            <th>Request Status</th>
                            <th>PIN Validity</th>
                            <th>Date</th>
                            <th>Time Entered</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visitorRequests
                            .filter(r => r.pin_entered_at)
                            .sort((a, b) => new Date(b.pin_entered_at!).getTime() - new Date(a.pin_entered_at!).getTime())
                            .map((req) => {
                              const entryDate = new Date(req.pin_entered_at!);
                              const pinValidity = getPinValidityStatus(req);
                              return (
                                <tr key={req.id}>
                                  <td style={{ fontWeight: 500, color: '#2c3e50' }}>{req.visitor_name}</td>
                                  <td style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: '#2e6F40' }}>
                                    {req.one_time_pin || '-'}
                                  </td>
                                  <td style={{ color: '#666' }}>{req.resident_name || req.resident_username}</td>
                                  <td>
                                    <span style={{
                                      display: 'inline-block',
                                      padding: '6px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      backgroundColor: getStatusColor(req.status),
                                      color: 'white'
                                    }}>
                                      {getStatusText(req.status)}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{
                                      display: 'inline-block',
                                      padding: '6px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      letterSpacing: '0.5px',
                                      backgroundColor: pinValidity.color,
                                      color: 'white',
                                      border: pinValidity.status === 'approved' ? '2px solid #22c55e' : 'none'
                                    }}>
                                      {pinValidity.status === 'approved' && '✓ '}
                                      {pinValidity.status === 'not_ready' && '⏰ '}
                                      {pinValidity.status === 'expired' && '⏱️ '}
                                      {pinValidity.status === 'declined' && '✗ '}
                                      {pinValidity.status === 'used' && '✓ '}
                                      {pinValidity.label}
                                    </span>
                                  </td>
                                  <td style={{ color: '#555', fontSize: '0.85rem' }}>
                                    {entryDate.toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </td>
                                  <td style={{ color: '#2196F3', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {entryDate.toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      second: '2-digit',
                                      hour12: true 
                                    })}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VisitorsTracking;
