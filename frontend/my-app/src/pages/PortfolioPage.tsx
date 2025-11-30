import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import { getToken, logout } from '../utils/auth';
import API_URL from '../utils/config';
import './PortfolioPage.css';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
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
  property_type?: string;
  beds?: number;
  baths?: number;
  floor_area?: number;
  lot_size?: number;
  year_built?: number;
  floors?: number;
  furnishing?: string;
  parking_spaces?: number;
  has_balcony?: boolean;
  has_garden?: boolean;
  has_pool?: boolean;
  has_elevator?: boolean;
  has_security?: boolean;
  association_dues?: string;
  utilities_included?: boolean;
  deposit_amount?: number;
  advance_payment?: number;
  lease_term?: string;
  pet_friendly?: boolean;
  down_payment?: number;
  payment_terms?: string;
  amenities?: string;
  nearby_facilities?: string;
  days_on_market?: string;
  contact_phone?: string;
  contact_email?: string;
  property_status?: string;
}

const PortfolioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [house, setHouse] = useState<House | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const token = getToken();

  const fetchUserProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data: User = await res.json();
      setUser(data);
    } catch {
      // User not logged in or session expired
    }
  }, [token]);

  const fetchHouse = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Always use guest endpoint for viewing houses (allows viewing all houses)
      // The authenticated endpoint only shows houses owned by the user
      const url = `${API_URL}/guest/houses/${id}/`;
      console.log('[PortfolioPage] Fetching house from:', url); // Debug log
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('House not found');
        }
        throw new Error(`Failed to fetch house: ${res.status} ${res.statusText}`);
      }
      const data: House = await res.json();
      console.log('[PortfolioPage] ========== HOUSE DATA ==========');
      console.log('[PortfolioPage] House ID:', data.id);
      console.log('[PortfolioPage] image_urls:', data.image_urls);
      console.log('[PortfolioPage] images array:', data.images);
      console.log('[PortfolioPage] legacy image:', data.image);
      
      // Debug: Check what getImageUrls will return
      const testUrls: string[] = [];
      if (data.image_urls && data.image_urls.length > 0) {
        testUrls.push(...data.image_urls);
      }
      if (data.images && data.images.length > 0) {
        data.images.forEach((img) => {
          if (img.image_url) testUrls.push(img.image_url);
          else if (img.image) testUrls.push(img.image);
        });
      }
      if (data.image && !testUrls.includes(data.image)) {
        testUrls.push(data.image);
      }
      console.log('[PortfolioPage] Final image URLs:', testUrls);
      console.log('[PortfolioPage] =================================');
      
      setHouse(data);
    } catch (err) {
      console.error('[PortfolioPage] Error fetching house:', err);
      setHouse(null);
      // Don't navigate immediately, let the UI show the error state
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchHouse();
      if (token) fetchUserProfile();
    }
  }, [id, token, fetchHouse, fetchUserProfile]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/houses/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Listing deleted successfully');
        navigate('/house-sales');
      } else {
        throw new Error('Failed to delete listing');
      }
    } catch (err) {
      console.error('Error deleting house:', err);
      alert('Failed to delete listing');
    }
  };

  const handleEdit = () => {
    navigate(`/house-sales?edit=${id}`);
  };

  // Helper function to get all image URLs from various sources
  const getImageUrls = (house: House): string[] => {
    const urls: string[] = [];
    
    // First, check image_urls array (from serializer) - PRIMARY SOURCE
    if (house.image_urls && house.image_urls.length > 0) {
      house.image_urls.forEach(url => {
        // Ensure URL is absolute
        const absoluteUrl = url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
        if (!urls.includes(absoluteUrl)) {
          urls.push(absoluteUrl);
        }
      });
    }
    
    // Then check images array (from HouseImage relationship)
    if (house.images && house.images.length > 0) {
      house.images.forEach((img) => {
        let imgUrl = img.image_url || img.image;
        if (imgUrl) {
          // Ensure URL is absolute
          const absoluteUrl = imgUrl.startsWith('http') ? imgUrl : `http://127.0.0.1:8000${imgUrl}`;
          if (!urls.includes(absoluteUrl)) {
            urls.push(absoluteUrl);
          }
        }
      });
    }
    
    // Finally check legacy image field
    if (house.image) {
      const absoluteUrl = house.image.startsWith('http') ? house.image : `http://127.0.0.1:8000${house.image}`;
      if (!urls.includes(absoluteUrl)) {
        urls.push(absoluteUrl);
      }
    }
    
    console.log('[PortfolioPage] getImageUrls returning:', urls);
    return urls;
  };

  const nextImage = () => {
    if (!house) return;
    const images = getImageUrls(house);
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!house) return;
    const images = getImageUrls(house);
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="portfolio-page">
        <NavBar />
        <div className="loading-container">
          <div className="loading">Loading property details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="portfolio-page">
        <NavBar />
        <div className="loading-container">
          <div className="error-message">Property not found</div>
          <button onClick={() => navigate('/house-sales')} className="back-btn">
            Back to Listings
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Get all images from various sources
  const images = getImageUrls(house);
  const isOwner = user && house.user && house.user.id === user.id;
  
  // Debug logging
  console.log('[PortfolioPage] House data:', {
    id: house.id,
    title: house.title,
    image_urls: house.image_urls,
    images: house.images,
    image: house.image,
    finalImages: images
  });

  return (
    <div className="portfolio-page">
      <NavBar />
      <div className="portfolio-container">
        <button className="back-to-listings-btn" onClick={() => navigate('/house-sales')}>
          ← Back to Listings
        </button>
        
        <div className="portfolio-content">
          {/* Left Side - Image Carousel */}
          <div className="portfolio-images">
            {images.length > 0 ? (
              <div className="image-carousel">
                <div className="carousel-main">
                  <img src={images[currentImageIndex]} alt={`${house.title} - Image ${currentImageIndex + 1}`} />
                  {images.length > 1 && (
                    <>
                      <button className="carousel-btn prev" onClick={prevImage} aria-label="Previous image">
                        ‹
                      </button>
                      <button className="carousel-btn next" onClick={nextImage} aria-label="Next image">
                        ›
                      </button>
                      <div className="carousel-counter">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="carousel-thumbnails">
                    {images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${house.title} - Image ${index + 1}`}
                        className={index === currentImageIndex ? 'active' : ''}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-image-placeholder">
                <p>No Images Available</p>
              </div>
            )}
          </div>

          {/* Right Side - Details */}
          <div className="portfolio-details">
            <div className="portfolio-header">
              <div>
                <h1>{house.title}</h1>
                <p className="portfolio-location">📍 {house.location}</p>
              </div>
              <span className={`portfolio-badge ${house.listing_type === 'rent' ? 'badge-rent' : 'badge-sale'}`}>
                {house.listing_type === 'rent' ? 'FOR RENT' : 'FOR SALE'}
              </span>
            </div>

            <div className="portfolio-price">
              <span className="price-amount">₱{Number(house.price).toLocaleString()}</span>
              {house.listing_type === 'rent' && <span className="price-period">/month</span>}
            </div>

            {isOwner && (
              <div className="portfolio-actions">
                <button className="action-btn edit-btn" onClick={handleEdit}>
                  Edit Listing
                </button>
                <button className="action-btn delete-btn" onClick={handleDelete}>
                  Delete Listing
                </button>
              </div>
            )}

            {house.description && (
              <div className="portfolio-section">
                <h2>Description</h2>
                <p>{house.description}</p>
              </div>
            )}

            {/* Property Details */}
            <div className="portfolio-section">
              <h2>Property Details</h2>
              <div className="details-grid">
                {house.property_type && (
                  <div className="detail-item">
                    <span className="detail-label">Property Type:</span>
                    <span className="detail-value">{house.property_type.charAt(0).toUpperCase() + house.property_type.slice(1)}</span>
                  </div>
                )}
                {house.beds !== undefined && house.beds > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Bedrooms:</span>
                    <span className="detail-value">{house.beds}</span>
                  </div>
                )}
                {house.baths !== undefined && house.baths > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Bathrooms:</span>
                    <span className="detail-value">{house.baths}</span>
                  </div>
                )}
                {house.floor_area && (
                  <div className="detail-item">
                    <span className="detail-label">Floor Area:</span>
                    <span className="detail-value">{Number(house.floor_area).toLocaleString()} sqm</span>
                  </div>
                )}
                {house.lot_size && (
                  <div className="detail-item">
                    <span className="detail-label">Lot Size:</span>
                    <span className="detail-value">{Number(house.lot_size).toLocaleString()} sqm</span>
                  </div>
                )}
                {house.year_built && (
                  <div className="detail-item">
                    <span className="detail-label">Year Built:</span>
                    <span className="detail-value">{house.year_built}</span>
                  </div>
                )}
                {house.floors && house.floors > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Floors:</span>
                    <span className="detail-value">{house.floors}</span>
                  </div>
                )}
                {house.parking_spaces !== undefined && house.parking_spaces > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Parking Spaces:</span>
                    <span className="detail-value">{house.parking_spaces}</span>
                  </div>
                )}
                {house.furnishing && (
                  <div className="detail-item">
                    <span className="detail-label">Furnishing:</span>
                    <span className="detail-value">{house.furnishing.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {(house.has_balcony || house.has_garden || house.has_pool || house.has_elevator || house.has_security) && (
              <div className="portfolio-section">
                <h2>Features</h2>
                <div className="features-list">
                  {house.has_balcony && <span className="feature-tag">Balcony</span>}
                  {house.has_garden && <span className="feature-tag">Garden</span>}
                  {house.has_pool && <span className="feature-tag">Swimming Pool</span>}
                  {house.has_elevator && <span className="feature-tag">Elevator</span>}
                  {house.has_security && <span className="feature-tag">Security System</span>}
                  {house.utilities_included && <span className="feature-tag">Utilities Included</span>}
                </div>
              </div>
            )}

            {/* Rental/Sale Specific Details */}
            {house.listing_type === 'rent' && (
              <div className="portfolio-section">
                <h2>Rental Information</h2>
                <div className="details-grid">
                  {house.deposit_amount && (
                    <div className="detail-item">
                      <span className="detail-label">Security Deposit:</span>
                      <span className="detail-value">₱{Number(house.deposit_amount).toLocaleString()}</span>
                    </div>
                  )}
                  {house.advance_payment && (
                    <div className="detail-item">
                      <span className="detail-label">Advance Payment:</span>
                      <span className="detail-value">₱{Number(house.advance_payment).toLocaleString()}</span>
                    </div>
                  )}
                  {house.lease_term && (
                    <div className="detail-item">
                      <span className="detail-label">Lease Term:</span>
                      <span className="detail-value">{house.lease_term}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Pet Friendly:</span>
                    <span className="detail-value">{house.pet_friendly ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}

            {house.listing_type === 'sale' && (
              <div className="portfolio-section">
                <h2>Sale Information</h2>
                <div className="details-grid">
                  {house.down_payment && (
                    <div className="detail-item">
                      <span className="detail-label">Down Payment:</span>
                      <span className="detail-value">₱{Number(house.down_payment).toLocaleString()}</span>
                    </div>
                  )}
                  {house.payment_terms && (
                    <div className="detail-item">
                      <span className="detail-label">Payment Terms:</span>
                      <span className="detail-value">{house.payment_terms}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {house.amenities && (
              <div className="portfolio-section">
                <h2>Amenities</h2>
                <div className="amenities-list">
                  {house.amenities.split(',').map((amenity, index) => (
                    <span key={index} className="amenity-tag">{amenity.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Facilities */}
            {house.nearby_facilities && (
              <div className="portfolio-section">
                <h2>Nearby Facilities</h2>
                <p>{house.nearby_facilities}</p>
              </div>
            )}

            {/* Contact Information */}
            {(house.contact_phone || house.contact_email) && (
              <div className="portfolio-section">
                <h2>Contact Information</h2>
                <div className="contact-info">
                  {house.contact_phone && (
                    <div className="contact-item">
                      <span className="contact-label">Phone:</span>
                      <a href={`tel:${house.contact_phone}`}>{house.contact_phone}</a>
                    </div>
                  )}
                  {house.contact_email && (
                    <div className="contact-item">
                      <span className="contact-label">Email:</span>
                      <a href={`mailto:${house.contact_email}`}>{house.contact_email}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Owner Information */}
            {house.user && (
              <div className="portfolio-section">
                <h2>Property Owner</h2>
                <p>{house.user.first_name} {house.user.last_name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PortfolioPage;

