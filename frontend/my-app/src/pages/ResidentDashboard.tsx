import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import "./ResidentDashboard.css";
import NavBar from "./NavBar"; // ✅ Added NavBar import
import API_URL from "../utils/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserProfile {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface VisitorRequest {
  id: number;
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
  created_at: string;
  is_valid?: boolean;
}

const PROFILE_API = "http://127.0.0.1:8000/api/profile/";
const RESIDENT_PIN_API = "http://127.0.0.1:8000/api/resident-pin/my/";
const VISITOR_REQUESTS_API = `${API_URL}/visitor-requests/`;

const ResidentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [residentPin, setResidentPin] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  
  // Visitor Request states
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_contact_number: '',
    vehicle_plate_number: '',
    reason: '',
    visit_date: '',
    visit_end_date: '',
    visit_start_time: '',
    visit_end_time: '',
  });
  const [requestLoading, setRequestLoading] = useState(false);

  const navigate = useNavigate();
  const token = getToken();

  if (!token) navigate("/login");

  // ---------------- Fetch profile ----------------
  const fetchProfile = async () => {
    try {
      const res = await axios.get(PROFILE_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      logout();
      navigate("/login");
    }
  };

  // ---------------- Fetch resident PIN ----------------
  const fetchResidentPin = async () => {
    try {
      const res = await axios.get(RESIDENT_PIN_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResidentPin(res.data.pin);
    } catch (err) {
      console.error("Failed to fetch PIN:", err);
    }
  };

  // ---------------- Fetch visitor requests ----------------
  const fetchVisitorRequests = async () => {
    try {
      const res = await axios.get<VisitorRequest[]>(VISITOR_REQUESTS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVisitorRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch visitor requests:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchResidentPin();
    fetchVisitorRequests();

    const interval = setInterval(() => {
      fetchProfile();
      fetchResidentPin();
      fetchVisitorRequests();
    }, 15000); // refresh every 15s

    return () => clearInterval(interval);
  }, []);

  // ---------------- Visitor Request Handlers ----------------
  const handleRequestInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // For contact number, only allow numeric input and limit to 10 digits
    if (name === 'visitor_contact_number') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setRequestFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setRequestFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    
    // Validation
    if (!requestFormData.visitor_name || !requestFormData.visitor_email || 
        !requestFormData.visit_date || !requestFormData.visit_start_time || !requestFormData.visit_end_time) {
      toast.error('Please fill in all required fields');
      setRequestLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestFormData.visitor_email)) {
      toast.error('Please enter a valid email address');
      setRequestLoading(false);
      return;
    }

    // Validate date is in the future
    const visitDate = new Date(requestFormData.visit_date);
    const visitEndDate = requestFormData.visit_end_date 
      ? new Date(requestFormData.visit_end_date) 
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (visitDate < today) {
      toast.error('Visit start date must be in the future');
      setRequestLoading(false);
      return;
    }

    // Validate end date is on or after start date
    if (visitEndDate && visitEndDate < visitDate) {
      toast.error('End date must be on or after start date');
      setRequestLoading(false);
      return;
    }

    // Validate end time is after start time (only if same day)
    if (!visitEndDate || visitEndDate.getTime() === visitDate.getTime()) {
      if (requestFormData.visit_start_time >= requestFormData.visit_end_time) {
        toast.error('End time must be after start time');
        setRequestLoading(false);
        return;
      }
    }

    try {
      const res = await axios.post(VISITOR_REQUESTS_API, requestFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Visitor request created successfully! Waiting for admin approval.');
      setShowRequestForm(false);
      setRequestFormData({
        visitor_name: '',
        visitor_email: '',
        visitor_contact_number: '',
        vehicle_plate_number: '',
        reason: '',
        visit_date: '',
        visit_end_date: '',
        visit_start_time: '',
        visit_end_time: '',
      });
      fetchVisitorRequests();
    } catch (err: any) {
      console.error('Error creating visitor request:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to create visitor request';
      toast.error(errorMsg);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    const request = visitorRequests.find(r => r.id === id);
    
    if (!request) return;
    
    // Show warning for approved/used requests
    const confirmMessage = (request.status === 'approved' || request.status === 'used')
      ? 'This request has been approved/used. Are you sure you want to delete it? This action cannot be undone.'
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
      fetchVisitorRequests();
    } catch (err: any) {
      console.error('Error deleting visitor request:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to delete visitor request';
      toast.error(errorMsg);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'pending_admin': { text: 'Pending Admin Approval', color: '#ff9800' },
      'approved': { text: 'Approved', color: '#4CAF50' },
      'declined': { text: 'Declined', color: '#f44336' },
      'expired': { text: 'Expired', color: '#9e9e9e' },
      'used': { text: 'Used', color: '#2196F3' },
    };
    const statusInfo = statusMap[status] || { text: status, color: '#666' };
    return (
      <span style={{ 
        padding: '4px 12px', 
        borderRadius: '12px', 
        backgroundColor: statusInfo.color, 
        color: 'white', 
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {statusInfo.text}
      </span>
    );
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <NavBar /> {/* ✅ Added NavBar at the top */}

    <div className="resident-dashboard-container">
      <div className="resident-dashboard">
        <div className="dashboard-container">
          {/* Left Column - Header and Form */}
          <div className="dashboard-left">
            <div>
              <h1>Resident Dashboard</h1>
              <p>
                Welcome, <strong>{profile.first_name} {profile.last_name}</strong> ({profile.username}) | Email: {profile.email}
              </p>
              <p style={{ fontWeight: "bold", marginTop: "10px" }}>
                Visitor PIN: {residentPin || "No PIN yet"}
              </p>

              {message && (
                <p className={`message ${message.startsWith("❌") ? "error" : "success"}`}>
                  {message} 
                </p>
              )}
            </div>

            {/* Create Visitor Request Section */}
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>Create Visitor Request</h2>
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              style={{
                padding: '10px 20px',
                backgroundColor: showRequestForm ? '#6c757d' : '#2e6F40',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {showRequestForm ? 'Cancel' : '+ New Request'}
            </button>
          </div>

          {showRequestForm && (
            <form onSubmit={handleCreateRequest} style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Visitor Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="visitor_name"
                    value={requestFormData.visitor_name}
                    onChange={handleRequestInputChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Visitor Email <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="visitor_email"
                    value={requestFormData.visitor_email}
                    onChange={handleRequestInputChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="visitor_contact_number"
                    value={requestFormData.visitor_contact_number}
                    onChange={handleRequestInputChange}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="10 digits"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Vehicle Plate Number (if applicable)
                  </label>
                  <input
                    type="text"
                    name="vehicle_plate_number"
                    value={requestFormData.vehicle_plate_number}
                    onChange={handleRequestInputChange}
                    placeholder="Optional"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Visit Start Date <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="visit_date"
                    value={requestFormData.visit_date}
                    onChange={handleRequestInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Visit End Date (Optional - for multi-day visits)
                  </label>
                  <input
                    type="date"
                    name="visit_end_date"
                    value={requestFormData.visit_end_date}
                    onChange={handleRequestInputChange}
                    min={requestFormData.visit_date || new Date().toISOString().split('T')[0]}
                    placeholder="Leave empty for single-day visit"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Reason for Visit
                  </label>
                  <input
                    type="text"
                    name="reason"
                    value={requestFormData.reason}
                    onChange={handleRequestInputChange}
                    placeholder="Optional"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Start Time <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="visit_start_time"
                    value={requestFormData.visit_start_time}
                    onChange={handleRequestInputChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    End Time <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="visit_end_time"
                    value={requestFormData.visit_end_time}
                    onChange={handleRequestInputChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: requestLoading ? '#6c757d' : '#2e6F40',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: requestLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {requestLoading ? 'Creating...' : 'Submit Request for Admin Approval'}
              </button>
            </form>
          )}
            </div>
          </div>

          {/* Right Column - Visitor Requests */}
          <div className="dashboard-right">
            {/* My Visitor Requests */}
            <div>
              <h2>My Visitor Requests</h2>
          {visitorRequests.length === 0 ? (
            <p style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
              No visitor requests yet. Create one above.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {visitorRequests.map((req) => (
                <div key={req.id} style={{ 
                  padding: '20px', 
                  background: 'white', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  // borderLeft: req.status === 'approved' ? '4px solid #4CAF50' : 
                  //             req.status === 'declined' ? '4px solid #f44336' : 
                  //             '4px solid #ff9800',
                  position: 'relative'
                }}>
                  {/* X Delete Button - Top Right Corner */}
                  <button 
                    onClick={() => handleDeleteRequest(req.id)}
                    title="Delete this request"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '28px',
                      height: '28px',
                      padding: 0,
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      lineHeight: '1'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ×
                  </button>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingRight: '35px' }}>
                    <h3 style={{ margin: 0 }}>{req.visitor_name}</h3>
                    {getStatusBadge(req.status)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <p><strong>Email:</strong> {req.visitor_email}</p>
                    <p><strong>Contact:</strong> {req.visitor_contact_number || 'N/A'}</p>
                    <p><strong>Visit Date:</strong> {new Date(req.visit_date).toLocaleDateString()}
                      {req.visit_end_date && req.visit_end_date !== req.visit_date && (
                        <span> - {new Date(req.visit_end_date).toLocaleDateString()}</span>
                      )}
                    </p>
                    <p><strong>Time:</strong> {req.visit_start_time} - {req.visit_end_time}</p>
                    {req.vehicle_plate_number && (
                      <p><strong>Vehicle Plate:</strong> {req.vehicle_plate_number}</p>
                    )}
                  </div>
                  {req.reason && <p><strong>Reason:</strong> {req.reason}</p>}
                  {req.one_time_pin && req.status === 'approved' && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '15px', 
                      background: '#e8f5e9', 
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666', marginBottom: '5px' }}>ONE-TIME PIN</p>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#2e6F40', letterSpacing: '3px' }}>
                        {req.one_time_pin}
                      </p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>
                        Valid on {new Date(req.visit_date).toLocaleDateString()} from {req.visit_start_time} to {req.visit_end_time}
                      </p>
                    </div>
                  )}
                  <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Created: {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ResidentDashboard;
