import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, logout } from '../utils/auth';
import './AdminSalePage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import { API_URL, API_BASE_URL, buildMediaUrl } from '../utils/apiConfig';

interface Profile {
  is_verified?: boolean;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  profile?: Profile;
}

interface House {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  image?: string;
  image_urls?: string[];
  images?: Array<{ id: number; image: string; image_url: string; order: number }>;
  user?: User;
  listing_type?: 'sale' | 'rent';
}

const API_BASE = API_URL;

const AdminSalePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const token = getToken();

  // Get image URLs helper
  const getHouseImageUrls = useCallback((house: House): string[] => {
    const urls: string[] = [];
    
    if (house.image_urls && house.image_urls.length > 0) {
      house.image_urls.forEach(url => {
        const absoluteUrl = buildMediaUrl(url);
        if (!urls.includes(absoluteUrl)) urls.push(absoluteUrl);
      });
    }
    
    if (house.images && house.images.length > 0) {
      house.images.forEach(img => {
        const imgUrl = img.image_url || img.image;
        if (imgUrl) {
          const absoluteUrl = buildMediaUrl(imgUrl);
          if (!urls.includes(absoluteUrl)) urls.push(absoluteUrl);
        }
      });
    }
    
    if (house.image) {
      const absoluteUrl = buildMediaUrl(house.image);
      if (!urls.includes(absoluteUrl)) urls.push(absoluteUrl);
    }
    
    return urls;
  }, []);

  // Fetch admin profile
  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        throw new Error('Unauthorized');
      }
      const data: User = await res.json();
      if (!data.is_staff) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/home');
        return;
      }
      setUser(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load admin profile');
    }
  }, [token, navigate]);

  // Fetch all houses
  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/houses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch houses: ${res.status}`);
      }
      const data: House[] = await res.json();
      setHouses(data);
    } catch (err) {
      console.error('Error fetching houses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load properties';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // Filtered houses
  const filteredHouses = useMemo(() => {
    if (!search) return houses;
    const searchLower = search.toLowerCase();
    return houses.filter(
      h =>
        h.title.toLowerCase().includes(searchLower) ||
        h.location.toLowerCase().includes(searchLower) ||
        (h.description && h.description.toLowerCase().includes(searchLower))
    );
  }, [houses, search]);

  // Navigate to house detail page
  const handleHouseClick = useCallback((house: House) => {
    navigate(`/house-detail/${house.id}`);
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
    fetchHouses();
  }, [fetchUserProfile, fetchHouses]);

  if (loading && houses.length === 0) {
    return (
      <>
        <div className="dashboard-layout">
          <Sidebar />
          <main className="dashboard-main">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading properties...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <h2>Property Management</h2>
          
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={fetchHouses}>Retry</button>
            </div>
          )}

          {/* Search */}
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by title, location, or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Results Count */}
          {search && (
            <div className="results-info">
              Showing {filteredHouses.length} of {houses.length} properties
            </div>
          )}

          {/* Houses Grid */}
          <div className="houses-grid">
            {filteredHouses.length === 0 ? (
              <div className="no-results">
                <p>No properties found.</p>
                {search && <p className="no-results-hint">Try adjusting your search terms.</p>}
              </div>
            ) : (
              filteredHouses.map(house => {
                const imageUrls = getHouseImageUrls(house);
                const firstImage = imageUrls[0];
                
                return (
                  <div
                    key={house.id}
                    className="house-grid-card"
                    onClick={() => handleHouseClick(house)}
                  >
                    {firstImage ? (
                      <img 
                        src={firstImage} 
                        alt={house.title}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const placeholder = target.parentElement?.querySelector('.no-image') as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <div className="house-grid-overlay">
                      <h4>{house.title}</h4>
                      <p className="house-price">₱{Number(house.price).toLocaleString()}</p>
                      <p className="house-location">{house.location}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminSalePage;
