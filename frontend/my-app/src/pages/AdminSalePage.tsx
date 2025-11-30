import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/logo.png';
import { getToken, logout } from '../utils/auth';
import './AdminSalePage.css';
import './AdminDashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';

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

const AdminSalePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalHouse, setModalHouse] = useState<House | null>(null);
  const [search, setSearch] = useState('');

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = getToken();

  // Fetch admin profile
  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data: User = await res.json();
      if (!data.is_staff) throw new Error('Access denied');
      setUser(data);
    } catch {
      logout();
      navigate('/login');
    }
  };

  // Fetch all houses
  const fetchHouses = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/houses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch houses');
      const data: House[] = await res.json();
      
      // Debug: Log image data
      console.log('[AdminSalePage] ========== FETCHED HOUSES ==========');
      data.forEach((house, index) => {
        const imageCount = house.image_urls?.length || house.images?.length || (house.image ? 1 : 0);
        console.log(`[AdminSalePage] House ${index + 1} (ID: ${house.id}): ${imageCount} images`);
        console.log(`[AdminSalePage] - image_urls: ${house.image_urls?.length || 0}`);
        console.log(`[AdminSalePage] - images array: ${house.images?.length || 0}`);
        console.log(`[AdminSalePage] - legacy image: ${house.image ? 'Yes' : 'No'}`);
      });
      console.log('[AdminSalePage] ====================================');
      
      setHouses(data);
    } catch (err) {
      console.error('[AdminSalePage] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchHouses();
  }, []);

  const filteredHouses = houses.filter(
    h =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase()) ||
      h.description.toLowerCase().includes(search.toLowerCase())
  );

  // Open modal
  const openModal = (house: House) => {
    setModalHouse(house);
    setEditMode(false);
    setEditTitle(house.title);
    setEditPrice(house.price.toString());
    setEditLocation(house.location);
    setEditDescription(house.description);
    setEditImage(null);
    setEditImagePreview(house.image || null);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this house?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/houses/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHouses(houses.filter(h => h.id !== id));
        setModalHouse(null);
        toast.success('House deleted successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete house');
    }
  };

  // Handle edit save
  const handleSaveEdit = async () => {
    if (!modalHouse) return;
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('price', editPrice);
    formData.append('location', editLocation);
    formData.append('description', editDescription);
    if (editImage) formData.append('image', editImage);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/houses/${modalHouse.id}/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to update house');
      const updated = await res.json();
      setHouses(houses.map(h => (h.id === updated.id ? updated : h)));
      setModalHouse(updated);
      setEditMode(false);
      toast.success('House updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update house');
    }
  };

  // Handle image change for edit
  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) return <p className="loading">Loading houses...</p>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="dashboard-layout">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="dashboard-main">
          <h2 style={{ marginBottom: '20px' }}>Sale & Rent List</h2>

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
            <div style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
              Showing {filteredHouses.length} of {houses.length} properties
            </div>
          )}

          {/* Houses Grid */}
          <div className="houses-grid">
            {filteredHouses.length === 0 ? (
              <div className="no-results">
                <p>No properties found.</p>
                {search && <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Try adjusting your search terms.</p>}
              </div>
            ) : (
              filteredHouses.map(house => (
                <div
                  key={house.id}
                  className="house-grid-card"
                  onClick={() => openModal(house)}
                >
                  {(() => {
                    // Get first image from multiple sources
                    let imageUrl = null;
                    
                    // First check image_urls array
                    if (house.image_urls && house.image_urls.length > 0) {
                      imageUrl = house.image_urls[0];
                    }
                    // Then check images array
                    else if (house.images && house.images.length > 0 && house.images[0]) {
                      imageUrl = house.images[0].image_url || house.images[0].image || null;
                    }
                    // Finally check legacy image field
                    else if (house.image) {
                      imageUrl = house.image;
                    }
                    
                    // Ensure URL is absolute
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      imageUrl = `http://127.0.0.1:8000${imageUrl}`;
                    }
                    
                    return imageUrl ? (
                      <img src={imageUrl} alt={house.title} onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.no-image')?.classList.remove('hidden');
                      }} />
                    ) : (
                      <div className="no-image">No Image</div>
                    );
                  })()}
                  <div className="house-grid-overlay">
                    <h4>{house.title}</h4>
                    <p className="house-price">₱{Number(house.price).toLocaleString()}</p>
                    <p className="house-location">{house.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal */}
          {modalHouse && (
            <div className="modal-overlay" onClick={() => setModalHouse(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setModalHouse(null)}>×</button>
                {editMode ? (
                  <div className="modal-edit-form">
                    <h3>Edit Property</h3>
                    <div className="form-group">
                      <label>Title</label>
                      <input 
                        value={editTitle} 
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="Property title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Price (₱)</label>
                      <input 
                        type="number" 
                        value={editPrice} 
                        onChange={e => setEditPrice(e.target.value)}
                        placeholder="Enter price"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input 
                        value={editLocation} 
                        onChange={e => setEditLocation(e.target.value)}
                        placeholder="Property location"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea 
                        value={editDescription} 
                        onChange={e => setEditDescription(e.target.value)}
                        placeholder="Property description"
                        rows={4}
                      />
                    </div>
                    <div className="form-group">
                      <label>Image</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleEditImageChange}
                      />
                      {editImagePreview && (
                        <img src={editImagePreview} alt="Preview" className="image-preview" />
                      )}
                    </div>
                    <div className="modal-buttons">
                      <button className="btn-save" onClick={handleSaveEdit}>Save Changes</button>
                      <button className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="modal-view">
                    {(() => {
                      // Get first image from multiple sources
                      let imageUrl = null;
                      
                      if (modalHouse.image_urls && modalHouse.image_urls.length > 0) {
                        imageUrl = modalHouse.image_urls[0];
                      } else if (modalHouse.images && modalHouse.images.length > 0 && modalHouse.images[0]) {
                        imageUrl = modalHouse.images[0].image_url || modalHouse.images[0].image || null;
                      } else if (modalHouse.image) {
                        imageUrl = modalHouse.image;
                      }
                      
                      // Ensure URL is absolute
                      if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = `http://127.0.0.1:8000${imageUrl}`;
                      }
                      
                      return imageUrl ? (
                        <img src={imageUrl} alt={modalHouse.title} className="modal-image" />
                      ) : null;
                    })()}
                    <div className="modal-body">
                      <h3>{modalHouse.title}</h3>
                      <div className="modal-info">
                        <div className="info-item">
                          <strong>Price:</strong>
                          <span className="price-tag">₱{Number(modalHouse.price).toLocaleString()}</span>
                        </div>
                        <div className="info-item">
                          <strong>Location:</strong>
                          <span>{modalHouse.location}</span>
                        </div>
                        {modalHouse.user && (
                          <div className="info-item">
                            <strong>Owner:</strong>
                            <span>{modalHouse.user.first_name} {modalHouse.user.last_name}</span>
                          </div>
                        )}
                        <div className="info-item description">
                          <strong>Description:</strong>
                          <p>{modalHouse.description}</p>
                        </div>
                      </div>
                      <div className="modal-buttons">
                        <button className="btn-edit" onClick={() => setEditMode(true)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(modalHouse.id)}>Delete</button>
                        <button className="btn-close" onClick={() => setModalHouse(null)}>Close</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminSalePage;
