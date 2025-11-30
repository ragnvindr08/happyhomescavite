import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import { getToken, logout } from '../utils/auth';
import './HouseSalePage.css';
import houseicon from '../images/houseicon.png';

// Declare ion-icon for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
      };
    }
  }
}

interface Profile {
  is_verified?: boolean;
  profile_image?: string;
}

interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
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
  has_air_conditioning?: boolean;
  has_heating?: boolean;
  has_wifi?: boolean;
  has_cable_tv?: boolean;
  has_dishwasher?: boolean;
  has_washing_machine?: boolean;
  has_dryer?: boolean;
  has_microwave?: boolean;
  has_refrigerator?: boolean;
  has_gym?: boolean;
  has_playground?: boolean;
  has_clubhouse?: boolean;
  has_laundry_room?: boolean;
  has_storage?: boolean;
  has_fireplace?: boolean;
  has_garage?: boolean;
  has_cctv?: boolean;
  has_intercom?: boolean;
  has_generator?: boolean;
  has_water_heater?: boolean;
  has_solar_panels?: boolean;
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

const HouseSalePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [modalHouse, setModalHouse] = useState<House | null>(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [editingHouseId, setEditingHouseId] = useState<number | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Detailed property fields
  const [propertyType, setPropertyType] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [floorArea, setFloorArea] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [floors, setFloors] = useState('1');
  const [furnishing, setFurnishing] = useState('');
  const [parkingSpaces, setParkingSpaces] = useState('0');
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasSecurity, setHasSecurity] = useState(false);
  const [hasAirConditioning, setHasAirConditioning] = useState(false);
  const [hasHeating, setHasHeating] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  const [hasCableTv, setHasCableTv] = useState(false);
  const [hasDishwasher, setHasDishwasher] = useState(false);
  const [hasWashingMachine, setHasWashingMachine] = useState(false);
  const [hasDryer, setHasDryer] = useState(false);
  const [hasMicrowave, setHasMicrowave] = useState(false);
  const [hasRefrigerator, setHasRefrigerator] = useState(false);
  const [hasGym, setHasGym] = useState(false);
  const [hasPlayground, setHasPlayground] = useState(false);
  const [hasClubhouse, setHasClubhouse] = useState(false);
  const [hasLaundryRoom, setHasLaundryRoom] = useState(false);
  const [hasStorage, setHasStorage] = useState(false);
  const [hasFireplace, setHasFireplace] = useState(false);
  const [hasGarage, setHasGarage] = useState(false);
  const [hasCctv, setHasCctv] = useState(false);
  const [hasIntercom, setHasIntercom] = useState(false);
  const [hasGenerator, setHasGenerator] = useState(false);
  const [hasWaterHeater, setHasWaterHeater] = useState(false);
  const [hasSolarPanels, setHasSolarPanels] = useState(false);
  const [associationDues, setAssociationDues] = useState('');
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('');
  const [petFriendly, setPetFriendly] = useState(false);
  const [downPayment, setDownPayment] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [amenities, setAmenities] = useState('');
  const [nearbyFacilities, setNearbyFacilities] = useState('');
  const [daysOnMarket, setDaysOnMarket] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = getToken();

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data: User = await res.json();
      setUser(data);
    } catch {
      logout();
      navigate('/login');
    }
  };

  // Fetch houses
  const fetchHouses = async () => {
    try {
      const url = token
        ? 'http://127.0.0.1:8000/api/houses/'
        : 'http://127.0.0.1:8000/api/guest/houses/';
      const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      if (!res.ok) throw new Error('Failed to fetch houses');
      const data: House[] = await res.json();
      
      // Debug: Log image data for each house
      console.log('[fetchHouses] ========== FETCHED HOUSES ==========');
      data.forEach((house, index) => {
        const imageCount = house.image_urls?.length || house.images?.length || (house.image ? 1 : 0);
        console.log(`[fetchHouses] House ${index + 1} (ID: ${house.id}): ${imageCount} images`);
        console.log(`[fetchHouses] - image_urls: ${house.image_urls?.length || 0}`);
        console.log(`[fetchHouses] - images array: ${house.images?.length || 0}`);
        console.log(`[fetchHouses] - legacy image: ${house.image ? 'Yes' : 'No'}`);
      });
      console.log('[fetchHouses] ====================================');
      
      setHouses(data);
      setFilteredHouses(data);
    } catch (err) {
      console.error('[fetchHouses] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchHouses();
  }, []);

  // Handle edit from query parameter (from portfolio page)
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && houses.length > 0 && user) {
      const houseToEdit = houses.find(h => h.id === parseInt(editId));
      if (houseToEdit && houseToEdit.user?.id === user.id) {
        handleEdit(houseToEdit);
        // Remove the query parameter from URL
        window.history.replaceState({}, '', '/house-sales');
      }
    }
  }, [searchParams, houses, user]);

  // Handle multiple image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = images.length + files.length;
      
      if (totalImages > 10) {
        alert('Maximum 10 images allowed. Please select fewer images.');
        return;
      }
      
      const newImages = [...images, ...files];
      setImages(newImages);
      
      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };
  
  // Remove image (handles both new and existing images)
  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Remove from existing images
      setExistingImageUrls(existingImageUrls.filter((_, i) => i !== index));
    } else {
      // Remove from new images
      const newImages = images.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImages(newImages);
      setImagePreviews(newPreviews);
    }
  };

  // Handle house upload
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !price || !location) return alert('Fill required fields');
    
    // Check if terms are accepted (only for new listings, not edits)
    if (!editingHouseId && !acceptedTerms) {
      return alert('Please read and accept the Terms & Policy to continue.');
    }
    
    // Validate images - only for new listings
    if (!editingHouseId) {
      if (images.length === 0 && existingImageUrls.length === 0) {
        return alert('Please upload at least 1 image (maximum 10 images)');
      }
    }
    
    const totalImages = images.length + existingImageUrls.length;
    if (totalImages > 10) {
      return alert('Maximum 10 images allowed');
    }
    
    // Get fresh token for each request
    const currentToken = getToken();
    if (!currentToken) {
      alert('You must be logged in');
      navigate('/login');
      return;
    }
    
    if (!user?.profile?.is_verified)
      return alert('Your account is not verified. Upload your documents in your profile.');

    const formData = new FormData();
    formData.append('title', title.trim());
    
    // Clean price - remove currency symbols, commas, and whitespace
    const cleanPrice = price.toString().replace(/[₱,\s]/g, '').trim();
    if (!cleanPrice || isNaN(parseFloat(cleanPrice))) {
      return alert('Please enter a valid price');
    }
    formData.append('price', cleanPrice);
    
    formData.append('location', location.trim());
    formData.append('description', description.trim());
    formData.append('listing_type', listingType);
    
    // Basic Property Information
    if (propertyType) formData.append('property_type', propertyType);
    if (beds && beds.trim()) formData.append('beds', beds.trim());
    if (baths && baths.trim()) formData.append('baths', baths.trim());
    if (floorArea && floorArea.trim()) {
      const cleanFloorArea = floorArea.replace(/[,\s]/g, '').trim();
      if (cleanFloorArea && !isNaN(parseFloat(cleanFloorArea))) {
        formData.append('floor_area', cleanFloorArea);
      }
    }
    if (lotSize && lotSize.trim()) {
      const cleanLotSize = lotSize.replace(/[,\s]/g, '').trim();
      if (cleanLotSize && !isNaN(parseFloat(cleanLotSize))) {
        formData.append('lot_size', cleanLotSize);
      }
    }
    if (yearBuilt && yearBuilt.trim()) formData.append('year_built', yearBuilt.trim());
    if (floors && floors.trim()) formData.append('floors', floors.trim());
    
    // Property Features
    if (furnishing) formData.append('furnishing', furnishing);
    if (parkingSpaces) formData.append('parking_spaces', parkingSpaces);
    formData.append('has_balcony', hasBalcony.toString());
    formData.append('has_garden', hasGarden.toString());
    formData.append('has_pool', hasPool.toString());
    formData.append('has_elevator', hasElevator.toString());
    formData.append('has_security', hasSecurity.toString());
    formData.append('has_air_conditioning', hasAirConditioning.toString());
    formData.append('has_heating', hasHeating.toString());
    formData.append('has_wifi', hasWifi.toString());
    formData.append('has_cable_tv', hasCableTv.toString());
    formData.append('has_dishwasher', hasDishwasher.toString());
    formData.append('has_washing_machine', hasWashingMachine.toString());
    formData.append('has_dryer', hasDryer.toString());
    formData.append('has_microwave', hasMicrowave.toString());
    formData.append('has_refrigerator', hasRefrigerator.toString());
    formData.append('has_gym', hasGym.toString());
    formData.append('has_playground', hasPlayground.toString());
    formData.append('has_clubhouse', hasClubhouse.toString());
    formData.append('has_laundry_room', hasLaundryRoom.toString());
    formData.append('has_storage', hasStorage.toString());
    formData.append('has_fireplace', hasFireplace.toString());
    formData.append('has_garage', hasGarage.toString());
    formData.append('has_cctv', hasCctv.toString());
    formData.append('has_intercom', hasIntercom.toString());
    formData.append('has_generator', hasGenerator.toString());
    formData.append('has_water_heater', hasWaterHeater.toString());
    formData.append('has_solar_panels', hasSolarPanels.toString());
    
    // Financial Information
    if (associationDues && associationDues.trim()) formData.append('association_dues', associationDues.trim());
    formData.append('utilities_included', utilitiesIncluded.toString());
    
    // Rental Specific
    if (listingType === 'rent') {
      if (depositAmount && depositAmount.trim()) {
        const cleanDeposit = depositAmount.replace(/[₱,\s]/g, '').trim();
        if (cleanDeposit && !isNaN(parseFloat(cleanDeposit))) {
          formData.append('deposit_amount', cleanDeposit);
        }
      }
      if (advancePayment && advancePayment.trim()) {
        const cleanAdvance = advancePayment.replace(/[₱,\s]/g, '').trim();
        if (cleanAdvance && !isNaN(parseFloat(cleanAdvance))) {
          formData.append('advance_payment', cleanAdvance);
        }
      }
      if (leaseTerm && leaseTerm.trim()) formData.append('lease_term', leaseTerm.trim());
      formData.append('pet_friendly', petFriendly.toString());
    }
    
    // Sale Specific
    if (listingType === 'sale') {
      if (downPayment && downPayment.trim()) {
        const cleanDownPayment = downPayment.replace(/[₱,\s]/g, '').trim();
        if (cleanDownPayment && !isNaN(parseFloat(cleanDownPayment))) {
          formData.append('down_payment', cleanDownPayment);
        }
      }
      if (paymentTerms && paymentTerms.trim()) formData.append('payment_terms', paymentTerms.trim());
    }
    
    // Additional Information
    if (amenities) formData.append('amenities', amenities);
    if (nearbyFacilities) formData.append('nearby_facilities', nearbyFacilities);
    if (daysOnMarket) formData.append('days_on_market', daysOnMarket);
    if (contactPhone) formData.append('contact_phone', contactPhone);
    if (contactEmail) formData.append('contact_email', contactEmail);
    
    // Add multiple images
    console.log(`[HouseUpload] ========== PREPARING FORM DATA ==========`);
    console.log(`[HouseUpload] Adding ${images.length} image(s) to FormData`);
    images.forEach((image, index) => {
      console.log(`[HouseUpload] Image ${index + 1}:`, {
        name: image.name,
        type: image.type,
        size: image.size,
        lastModified: image.lastModified
      });
      formData.append('images', image);
    });
    
    // Verify FormData has images
    const formDataImages = formData.getAll('images');
    console.log(`[HouseUpload] FormData verification: ${formDataImages.length} images in FormData`);
    console.log(`[HouseUpload] =========================================`);

    // Debug: Log form data (excluding files)
    console.log('Submitting house data:', {
      title,
      price: cleanPrice,
      location,
      listingType,
      imagesCount: images.length,
      formDataKeys: Array.from(formData.keys())
    });

    try {
      const url = editingHouseId 
        ? `http://127.0.0.1:8000/api/houses/${editingHouseId}/`
        : 'http://127.0.0.1:8000/api/houses/';
      
      const method = editingHouseId ? 'PUT' : 'POST';
      
      // Don't set Content-Type header when using FormData - browser sets it automatically with boundary
      const res = await fetch(url, {
        method: method,
        headers: { 
          Authorization: `Bearer ${currentToken}`
          // Note: Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: `HTTP ${res.status}: Failed to ${editingHouseId ? 'update' : 'upload'} house` }));
        console.error('House upload error:', errorData);
        
        if (res.status === 401) {
          alert('Session expired. Please login again.');
          logout();
          navigate('/login');
          return;
        }
        
        // Format validation errors for better display
        let errorMessage = errorData.detail || errorData.message || `HTTP ${res.status}: Failed to ${editingHouseId ? 'update' : 'upload'} house`;
        
        // If there are field-specific errors, include them
        if (errorData && typeof errorData === 'object') {
          const fieldErrors = Object.entries(errorData)
            .filter(([key, value]) => key !== 'detail' && key !== 'message' && value)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            });
          
          if (fieldErrors.length > 0) {
            errorMessage = `${errorMessage}\n\nField errors:\n${fieldErrors.join('\n')}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const updatedHouse = await res.json();
      console.log('[HouseUpload] ========== HOUSE RESPONSE ==========');
      console.log('[HouseUpload] Full response:', JSON.stringify(updatedHouse, null, 2));
      console.log('[HouseUpload] House ID:', updatedHouse.id);
      console.log('[HouseUpload] House images array:', updatedHouse.images);
      console.log('[HouseUpload] House images array length:', updatedHouse.images?.length || 0);
      console.log('[HouseUpload] House image_urls array:', updatedHouse.image_urls);
      console.log('[HouseUpload] House image_urls length:', updatedHouse.image_urls?.length || 0);
      console.log('[HouseUpload] House legacy image:', updatedHouse.image);
      
      // Debug: Log image count
      const imageCount = updatedHouse.image_urls?.length || 
                        (updatedHouse.images?.length || 0) || 
                        (updatedHouse.image ? 1 : 0);
      console.log('[HouseUpload] Total image count calculated:', imageCount);
      
      // If no images, log warning
      if (imageCount === 0) {
        console.error('[HouseUpload] ⚠️ WARNING: No images found in response!');
        console.error('[HouseUpload] This means images were not saved or not included in response');
      } else {
        console.log('[HouseUpload] ✅ SUCCESS: Images found in response!');
      }
      console.log('[HouseUpload] ======================================');
      
      // Verify images are in response
      if (!updatedHouse.images || updatedHouse.images.length === 0) {
        console.warn('[HouseUpload] WARNING: No images in response!');
        if (updatedHouse.image_urls && updatedHouse.image_urls.length > 0) {
          console.log('[HouseUpload] But image_urls has', updatedHouse.image_urls.length, 'images');
        }
      } else {
        console.log('[HouseUpload] SUCCESS: Response includes', updatedHouse.images.length, 'images');
      }
      
      if (editingHouseId) {
        // Update existing house in the list
        setHouses(houses.map(h => h.id === editingHouseId ? updatedHouse : h));
        setFilteredHouses(filteredHouses.map(h => h.id === editingHouseId ? updatedHouse : h));
        alert('House listing updated successfully!');
      } else {
        // Add the newly created house to the list immediately with response data
        // This ensures images are included from the response
        setHouses([updatedHouse, ...houses]);
        setFilteredHouses([updatedHouse, ...filteredHouses]);
        
        // Also refresh from server to ensure everything is in sync
        await fetchHouses();
        alert('House listed successfully!');
      }
      
      // Reset form
      resetForm();
    } catch (err: any) {
      console.error('House upload error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Failed to upload house: ${errorMessage}`);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this house?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/houses/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHouses(houses.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setTitle('');
    setPrice('');
    setLocation('');
    setDescription('');
    setListingType('sale');
    setImages([]);
    setImagePreviews([]);
    setExistingImageUrls([]);
    setPropertyType('');
    setBeds('');
    setBaths('');
    setFloorArea('');
    setLotSize('');
    setYearBuilt('');
    setFloors('1');
    setFurnishing('');
    setParkingSpaces('0');
    setHasBalcony(false);
    setHasGarden(false);
    setHasPool(false);
    setHasElevator(false);
    setHasSecurity(false);
    setHasAirConditioning(false);
    setHasHeating(false);
    setHasWifi(false);
    setHasCableTv(false);
    setHasDishwasher(false);
    setHasWashingMachine(false);
    setHasDryer(false);
    setHasMicrowave(false);
    setHasRefrigerator(false);
    setHasGym(false);
    setHasPlayground(false);
    setHasClubhouse(false);
    setHasLaundryRoom(false);
    setHasStorage(false);
    setHasFireplace(false);
    setHasGarage(false);
    setHasCctv(false);
    setHasIntercom(false);
    setHasGenerator(false);
    setHasWaterHeater(false);
    setHasSolarPanels(false);
    setAssociationDues('');
    setUtilitiesIncluded(false);
    setDepositAmount('');
    setAdvancePayment('');
    setLeaseTerm('');
    setPetFriendly(false);
    setDownPayment('');
    setPaymentTerms('');
    setAmenities('');
    setNearbyFacilities('');
    setDaysOnMarket('');
    setContactPhone('');
    setContactEmail('');
    setEditingHouseId(null);
    setAcceptedTerms(false);
    setIsFormExpanded(true);
  };

  // Handle edit - Populate form with existing house data
  const handleEdit = async (house: House) => {
    if (!user || house.user?.id !== user.id) {
      alert('You can only edit your own listings.');
      return;
    }

    setEditingHouseId(house.id);
    setTitle(house.title || '');
    setPrice(house.price?.toString() || '');
    setLocation(house.location || '');
    setDescription(house.description || '');
    setListingType(house.listing_type || 'sale');
    
    // Set existing images
    const imageUrls = house.image_urls || (house.image ? [house.image] : []);
    setExistingImageUrls(imageUrls);
    setImages([]);
    setImagePreviews([]);
    
    // Detailed property fields
    setPropertyType(house.property_type || '');
    setBeds(house.beds?.toString() || '');
    setBaths(house.baths?.toString() || '');
    setFloorArea(house.floor_area?.toString() || '');
    setLotSize(house.lot_size?.toString() || '');
    setYearBuilt(house.year_built?.toString() || '');
    setFloors(house.floors?.toString() || '1');
    setFurnishing(house.furnishing || '');
    setParkingSpaces(house.parking_spaces?.toString() || '0');
    setHasBalcony(house.has_balcony || false);
    setHasGarden(house.has_garden || false);
    setHasPool(house.has_pool || false);
    setHasElevator(house.has_elevator || false);
    setHasSecurity(house.has_security || false);
    setHasAirConditioning(house.has_air_conditioning || false);
    setHasHeating(house.has_heating || false);
    setHasWifi(house.has_wifi || false);
    setHasCableTv(house.has_cable_tv || false);
    setHasDishwasher(house.has_dishwasher || false);
    setHasWashingMachine(house.has_washing_machine || false);
    setHasDryer(house.has_dryer || false);
    setHasMicrowave(house.has_microwave || false);
    setHasRefrigerator(house.has_refrigerator || false);
    setHasGym(house.has_gym || false);
    setHasPlayground(house.has_playground || false);
    setHasClubhouse(house.has_clubhouse || false);
    setHasLaundryRoom(house.has_laundry_room || false);
    setHasStorage(house.has_storage || false);
    setHasFireplace(house.has_fireplace || false);
    setHasGarage(house.has_garage || false);
    setHasCctv(house.has_cctv || false);
    setHasIntercom(house.has_intercom || false);
    setHasGenerator(house.has_generator || false);
    setHasWaterHeater(house.has_water_heater || false);
    setHasSolarPanels(house.has_solar_panels || false);
    setAssociationDues(house.association_dues || '');
    setUtilitiesIncluded(house.utilities_included || false);
    setDepositAmount(house.deposit_amount?.toString() || '');
    setAdvancePayment(house.advance_payment?.toString() || '');
    setLeaseTerm(house.lease_term || '');
    setPetFriendly(house.pet_friendly || false);
    setDownPayment(house.down_payment?.toString() || '');
    setPaymentTerms(house.payment_terms || '');
    setAmenities(house.amenities || '');
    setNearbyFacilities(house.nearby_facilities || '');
    setDaysOnMarket(house.days_on_market || '');
    setContactPhone(house.contact_phone || '');
    setContactEmail(house.contact_email || '');
    
    // Don't require terms acceptance for editing
    setAcceptedTerms(true);
    
    // Close modal and expand form
    setModalHouse(null);
    setIsFormExpanded(true);
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('.house-upload-form-wrapper');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Search and Filter
  useEffect(() => {
    let filtered = houses.filter(h => {
      // Filter by type
      if (filterType !== 'all' && h.listing_type !== filterType) {
        return false;
      }
      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          h.title.toLowerCase().includes(searchLower) ||
          h.location.toLowerCase().includes(searchLower) ||
          h.description.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
    setFilteredHouses(filtered);
  }, [search, filterType, houses]);

  if (loading) return <p className="loading">Loading houses...</p>;

  return (
    <div className="house-sale-page">
      <NavBar />
      <div className="house-sale-container">
        {user && (
          <div className="welcome-banner">
            <h2>Welcome back, {user.first_name}!</h2>
            <p>List your property or browse available homes in the community</p>
          </div>
        )}

      {/* House Upload Form */}
      {user && (
        <div className="house-upload-form-wrapper">
          <div 
            className="form-header-clickable" 
            onClick={() => setIsFormExpanded(!isFormExpanded)}
          >
            <div className="form-header-content">
              <div className="form-header-icon">
                <img src={houseicon} alt="House Icon" />
              </div>
              <div>
                <h3>{editingHouseId ? 'Edit Your Property Listing' : 'List Your Property'}</h3>
                <p>{editingHouseId ? 'Update your property information' : 'Share your property with the community'}</p>
              </div>
            </div>
            <div className="form-toggle-icon">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ 
                  transform: isFormExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          {isFormExpanded && (
            <form className="house-upload-form" onSubmit={handleSubmit}>
          
          {!user.profile?.is_verified && (
            <div className="verification-warning">
              <div>
                <strong>Account Verification Required</strong>
                <p>Upload your documents in your profile to enable property listings.</p>
              </div>
            </div>
          )}

          {/* Listing Type Selection */}
          <div className="form-group">
            <label>Listing Type *</label>
            <select
              className="form-input"
              value={listingType}
              onChange={e => setListingType(e.target.value as 'sale' | 'rent')}
              disabled={!user.profile?.is_verified}
              required
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Form Fields - Different placeholders based on type */}
          <div className="form-group">
            <label>Property Title</label>
            <input 
              type="text" 
              className="form-input"
              placeholder={listingType === 'sale' ? "Beautiful 3BR House for Sale" : "Cozy 2BR Apartment for Rent"} 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              disabled={!user.profile?.is_verified} 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>{listingType === 'sale' ? 'Sale Price' : 'Monthly Rent'}</label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">₱</span>
                <input 
                  type="number" 
                  className="form-input price-input"
                  placeholder="0.00" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  required 
                  disabled={!user.profile?.is_verified} 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Block 5, Lot 10" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                required 
                disabled={!user.profile?.is_verified} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-textarea"
              placeholder={listingType === 'sale' 
                ? "Spacious 3-bedroom house with modern amenities, perfect for families. Includes parking, garden, and near community facilities." 
                : "Fully furnished 2-bedroom apartment available for rent. Includes utilities, parking space, and access to community amenities. Pet-friendly."} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              disabled={!user.profile?.is_verified}
              rows={4}
            />
          </div>
          
          {/* Property Type and Basic Information */}
          <div className="form-section-header">
            <h4>Property Information</h4>
            <p>Basic details about your property</p>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Property Type</label>
              <select 
                className="form-input"
                value={propertyType} 
                onChange={e => setPropertyType(e.target.value)} 
                disabled={!user.profile?.is_verified}
              >
                <option value="">Select property type</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="villa">Villa</option>
                <option value="duplex">Duplex</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div className="form-group">
              <label>Year Built</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="2020" 
                value={yearBuilt} 
                onChange={e => setYearBuilt(e.target.value)} 
                min="1900"
                max={new Date().getFullYear()}
                disabled={!user.profile?.is_verified} 
              />
            </div>
          </div>
          
          {/* Overview Section */}
          <div className="form-section-header">
            <h4>Overview</h4>
            <p>Property specifications</p>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="2" 
                value={beds} 
                onChange={e => setBeds(e.target.value)} 
                min="0"
                disabled={!user.profile?.is_verified} 
              />
            </div>
            <div className="form-group">
              <label>Bathrooms</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="2" 
                value={baths} 
                onChange={e => setBaths(e.target.value)} 
                min="0"
                disabled={!user.profile?.is_verified} 
              />
            </div>
            <div className="form-group">
              <label>Floors/Stories</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="1" 
                value={floors} 
                onChange={e => setFloors(e.target.value)} 
                min="1"
                disabled={!user.profile?.is_verified} 
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Floor Area (sqm)</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="85" 
                value={floorArea} 
                onChange={e => setFloorArea(e.target.value)} 
                min="0"
                step="0.01"
                disabled={!user.profile?.is_verified} 
              />
            </div>
            <div className="form-group">
              <label>Lot Size (sqm)</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="150" 
                value={lotSize} 
                onChange={e => setLotSize(e.target.value)} 
                min="0"
                step="0.01"
                disabled={!user.profile?.is_verified} 
              />
            </div>
            <div className="form-group">
              <label>Parking Spaces</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="1" 
                value={parkingSpaces} 
                onChange={e => setParkingSpaces(e.target.value)} 
                min="0"
                disabled={!user.profile?.is_verified} 
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Furnishing</label>
              <select 
                className="form-input"
                value={furnishing} 
                onChange={e => setFurnishing(e.target.value)} 
                disabled={!user.profile?.is_verified}
              >
                <option value="">Select furnishing</option>
                <option value="fully_furnished">Fully Furnished</option>
                <option value="semi_furnished">Semi Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
            <div className="form-group">
              <label>Association Dues</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Included in price" 
                value={associationDues} 
                onChange={e => setAssociationDues(e.target.value)} 
                disabled={!user.profile?.is_verified} 
              />
            </div>
            <div className="form-group">
              <label>Days On Market</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="1 month" 
                value={daysOnMarket} 
                onChange={e => setDaysOnMarket(e.target.value)} 
                disabled={!user.profile?.is_verified} 
              />
            </div>
          </div>
          
          {/* Property Features */}
          <div className="form-section-header">
            <h4>Property Features</h4>
            <p>Select available features</p>
          </div>
          
          <div className="form-features-grid">
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasBalcony} 
                onChange={e => setHasBalcony(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Balcony</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasGarden} 
                onChange={e => setHasGarden(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Garden</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasPool} 
                onChange={e => setHasPool(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Swimming Pool</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasElevator} 
                onChange={e => setHasElevator(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Elevator</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasSecurity} 
                onChange={e => setHasSecurity(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Security System</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasAirConditioning} 
                onChange={e => setHasAirConditioning(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Air Conditioning</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasHeating} 
                onChange={e => setHasHeating(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Heating</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasWifi} 
                onChange={e => setHasWifi(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>WiFi/Internet</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasCableTv} 
                onChange={e => setHasCableTv(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Cable TV</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasDishwasher} 
                onChange={e => setHasDishwasher(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Dishwasher</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasWashingMachine} 
                onChange={e => setHasWashingMachine(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Washing Machine</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasDryer} 
                onChange={e => setHasDryer(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Dryer</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasMicrowave} 
                onChange={e => setHasMicrowave(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Microwave</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasRefrigerator} 
                onChange={e => setHasRefrigerator(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Refrigerator</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasGym} 
                onChange={e => setHasGym(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Gym/Fitness Center</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasPlayground} 
                onChange={e => setHasPlayground(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Playground</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasClubhouse} 
                onChange={e => setHasClubhouse(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Clubhouse</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasLaundryRoom} 
                onChange={e => setHasLaundryRoom(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Laundry Room</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasStorage} 
                onChange={e => setHasStorage(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Storage Room</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasFireplace} 
                onChange={e => setHasFireplace(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Fireplace</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasGarage} 
                onChange={e => setHasGarage(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Garage</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasCctv} 
                onChange={e => setHasCctv(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>CCTV</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasIntercom} 
                onChange={e => setHasIntercom(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Intercom</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasGenerator} 
                onChange={e => setHasGenerator(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Generator/Backup Power</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasWaterHeater} 
                onChange={e => setHasWaterHeater(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Water Heater</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={hasSolarPanels} 
                onChange={e => setHasSolarPanels(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Solar Panels</span>
            </label>
            <label className="feature-checkbox">
              <input 
                type="checkbox" 
                checked={utilitiesIncluded} 
                onChange={e => setUtilitiesIncluded(e.target.checked)} 
                disabled={!user.profile?.is_verified}
              />
              <span>Utilities Included</span>
            </label>
          </div>
          
          {/* Rental Specific Fields */}
          {listingType === 'rent' && (
            <>
              <div className="form-section-header">
                <h4>Rental Details</h4>
                <p>Rental-specific information</p>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Security Deposit (₱)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    placeholder="0.00" 
                    value={depositAmount} 
                    onChange={e => setDepositAmount(e.target.value)} 
                    min="0"
                    step="0.01"
                    disabled={!user.profile?.is_verified} 
                  />
                </div>
                <div className="form-group">
                  <label>Advance Payment (₱)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    placeholder="0.00" 
                    value={advancePayment} 
                    onChange={e => setAdvancePayment(e.target.value)} 
                    min="0"
                    step="0.01"
                    disabled={!user.profile?.is_verified} 
                  />
                </div>
                <div className="form-group">
                  <label>Lease Term</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="1 year, 6 months" 
                    value={leaseTerm} 
                    onChange={e => setLeaseTerm(e.target.value)} 
                    disabled={!user.profile?.is_verified} 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="feature-checkbox">
                  <input 
                    type="checkbox" 
                    checked={petFriendly} 
                    onChange={e => setPetFriendly(e.target.checked)} 
                    disabled={!user.profile?.is_verified}
                  />
                  <span>Pet Friendly</span>
                </label>
              </div>
            </>
          )}
          
          {/* Sale Specific Fields */}
          {listingType === 'sale' && (
            <>
              <div className="form-section-header">
                <h4>Sale Details</h4>
                <p>Sale-specific information</p>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Down Payment (₱)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    placeholder="0.00" 
                    value={downPayment} 
                    onChange={e => setDownPayment(e.target.value)} 
                    min="0"
                    step="0.01"
                    disabled={!user.profile?.is_verified} 
                  />
                </div>
                <div className="form-group">
                  <label>Payment Terms</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g., 10 months PDC" 
                    value={paymentTerms} 
                    onChange={e => setPaymentTerms(e.target.value)} 
                    disabled={!user.profile?.is_verified} 
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Amenities and Nearby Facilities */}
          <div className="form-section-header">
            <h4>Amenities & Location</h4>
            <p>Property amenities and nearby facilities</p>
          </div>
          
          <div className="form-group">
            <label>Amenities</label>
            <textarea 
              className="form-textarea"
              placeholder="Aircon, Kitchen Utensils, Swimming Pool, Gated, Fire Alarm, Water Heater, Bar, Garage, Function Rooms, Kitchen Appliances, Built In Cabinets, Duplex, Parking Area, Security Guard" 
              value={amenities} 
              onChange={e => setAmenities(e.target.value)} 
              disabled={!user.profile?.is_verified}
              rows={3}
            />
            <small className="form-hint">Separate amenities with commas</small>
          </div>
          
          <div className="form-group">
            <label>Nearby Facilities</label>
            <textarea 
              className="form-textarea"
              placeholder="Schools, Malls, Hospitals, Parks, Public Transportation, etc." 
              value={nearbyFacilities} 
              onChange={e => setNearbyFacilities(e.target.value)} 
              disabled={!user.profile?.is_verified}
              rows={2}
            />
            <small className="form-hint">List nearby schools, malls, hospitals, etc.</small>
          </div>
          
          {/* Contact Information */}
          <div className="form-section-header">
            <h4>Contact Information</h4>
            <p>How potential buyers/renters can reach you</p>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Contact Phone</label>
              <input 
                type="tel" 
                className="form-input"
                placeholder="+63XXXXXXXXXX" 
                value={contactPhone} 
                onChange={e => setContactPhone(e.target.value)} 
                disabled={!user.profile?.is_verified} 
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input 
                type="email" 
                className="form-input"
                placeholder="your.email@example.com" 
                value={contactEmail} 
                onChange={e => setContactEmail(e.target.value)} 
                disabled={!user.profile?.is_verified} 
              />
            </div>
          </div>
          
          {/* Property Images Section */}
          <div className="form-section-header">
            <h4>Property Images</h4>
            <p>Upload 1-10 images of your property</p>
          </div>
          
          <div className="form-group">
            <label>Property Images (Minimum 1, Maximum 10)</label>
            <div className="file-upload-wrapper">
              <label htmlFor="houseImages" className="custom-file-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                {images.length > 0 ? `Add More Images (${images.length}/10)` : 'Upload Property Images'}
              </label>
              <input 
                id="houseImages" 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageChange} 
                disabled={!user.profile?.is_verified || (existingImageUrls.length + images.length) >= 10} 
              />
            </div>
            
            {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
              <div className="images-preview-grid">
                {/* Existing images */}
                {existingImageUrls.map((url, index) => (
                  <div key={`existing-${index}`} className="image-preview-item">
                    <img src={url} alt={`Existing ${index + 1}`} />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeImage(index, true)}
                      disabled={!user.profile?.is_verified}
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {/* New image previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="image-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeImage(index, false)}
                      disabled={!user.profile?.is_verified}
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
              <div className="images-count">
                {existingImageUrls.length + imagePreviews.length} / 10 images
              </div>
            )}
          </div>
          
          {/* Terms & Policy Section */}
          <div className="terms-policy-section">
            <div className="terms-content">
              <h4>Terms & Policy</h4>
              <div className="terms-text">
                <p><strong>By listing your property, you agree to the following terms:</strong></p>
                <ul>
                  <li>You are the legal owner or authorized agent of the property listed.</li>
                  <li>All information provided is accurate and truthful to the best of your knowledge.</li>
                  <li>You have the right to sell or rent the property as described.</li>
                  <li>You will respond to inquiries from potential buyers/renters in a timely manner.</li>
                  <li>You understand that Happy Homes acts as a platform and is not responsible for transactions between parties.</li>
                  <li>You will not post false, misleading, or fraudulent information.</li>
                  <li>You will not discriminate against potential buyers/renters based on race, religion, gender, or other protected characteristics.</li>
                  <li>You agree to maintain the accuracy of your listing and update it if information changes.</li>
                  <li>Happy Homes reserves the right to remove listings that violate these terms or community guidelines.</li>
                  <li>You are responsible for all legal compliance related to your property listing.</li>
                </ul>
                <p><strong>Privacy Policy:</strong></p>
                <ul>
                  <li>Your contact information will be visible to registered users interested in your property.</li>
                  <li>We may use your listing information for platform improvement and marketing purposes.</li>
                  <li>You can request removal of your listing at any time.</li>
                </ul>
                <p><strong>Fees & Charges:</strong></p>
                <ul>
                  <li>Listing your property on Happy Homes is currently free of charge.</li>
                  <li>Any future fee changes will be communicated with advance notice.</li>
                </ul>
              </div>
            </div>
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={!user.profile?.is_verified || editingHouseId !== null}
                required
              />
              <span>
                I have read and agree to the Terms & Policy <span className="required-asterisk">*</span>
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={!user.profile?.is_verified || (!editingHouseId && !acceptedTerms)}
          >
            {editingHouseId 
              ? `Update ${listingType === 'sale' ? 'Sale' : 'Rent'} Listing` 
              : (listingType === 'sale' ? 'List for Sale' : 'List for Rent')
            }
          </button>
          {editingHouseId && (
            <button 
              type="button" 
              className="submit-btn cancel-edit-btn" 
              onClick={resetForm}
              style={{ marginTop: '10px', background: '#6c757d' }}
            >
              Cancel Edit
            </button>
          )}
        </form>
          )}
        </div>
      )}

      {/* Search Bar and Filters */}
      <div className="search-filter-section">
        <div className="search-bar-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, location, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              className="clear-search" 
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="filter-buttons">
          <button
            type="button"
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
All Properties
          </button>
          <button
            type="button"
            className={`filter-btn filter-sale ${filterType === 'sale' ? 'active' : ''}`}
            onClick={() => setFilterType('sale')}
          >
For Sale
          </button>
          <button
            type="button"
            className={`filter-btn filter-rent ${filterType === 'rent' ? 'active' : ''}`}
            onClick={() => setFilterType('rent')}
          >
For Rent
          </button>
        </div>
        {filteredHouses.length > 0 && (
          <p className="results-count">{filteredHouses.length} {filteredHouses.length === 1 ? 'property' : 'properties'} found</p>
        )}
      </div>

      {/* Houses Grid */}
      <div className="houses-container">
        {filteredHouses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>No properties found</h3>
            <p>{search || filterType !== 'all' ? 'Try adjusting your search or filters' : 'Be the first to list a property!'}</p>
          </div>
        ) : (
          <div className="houses-grid">
            {filteredHouses.map(house => (
              <div
                key={house.id}
                className="house-grid-card"
                data-house-id={house.id}
                onClick={() => navigate(`/portfolio/${house.id}`)}
              >
                <div className="house-card-image">
                  {(() => {
                    // Check multiple sources for images
                    let imageUrl = null;
                    
                    // Debug logging
                    if (!house.image_urls || house.image_urls.length === 0) {
                      console.log(`[HouseCard] House ${house.id} - No image_urls, checking other sources...`);
                      console.log(`[HouseCard] House ${house.id} - images array:`, house.images);
                      console.log(`[HouseCard] House ${house.id} - legacy image:`, house.image);
                    }
                    
                    // First check image_urls array (primary source)
                    if (house.image_urls && house.image_urls.length > 0) {
                      imageUrl = house.image_urls[0];
                      console.log(`[HouseCard] House ${house.id} - Using image_urls[0]:`, imageUrl);
                    }
                    // Then check images array (from HouseImage relationship)
                    else if (house.images && house.images.length > 0 && house.images[0]) {
                      const firstImage = house.images[0];
                      imageUrl = firstImage.image_url || firstImage.image || null;
                      console.log(`[HouseCard] House ${house.id} - Using images[0]:`, imageUrl);
                    }
                    // Finally check legacy image field
                    else if (house.image) {
                      imageUrl = house.image;
                      console.log(`[HouseCard] House ${house.id} - Using legacy image:`, imageUrl);
                    }
                    
                    // Ensure URL is absolute
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      imageUrl = `http://127.0.0.1:8000${imageUrl}`;
                    }
                    
                    return imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={house.title}
                        onError={(e) => {
                          console.error(`[HouseCard] Failed to load image: ${imageUrl}`);
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          // Show no-image placeholder
                          const placeholder = target.parentElement?.querySelector('.no-image') as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                        onLoad={() => {
                          // Hide no-image placeholder when image loads successfully
                          const placeholder = document.querySelector(`.house-grid-card[data-house-id="${house.id}"] .no-image`) as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'none';
                          }
                        }}
                      />
                    ) : (
                      <div className="no-image">
                        <p>No Image</p>
                      </div>
                    );
                  })()}
                  <div className={`house-card-badge ${house.listing_type === 'rent' ? 'badge-rent' : 'badge-sale'}`}>
                    {house.listing_type === 'rent' ? 'FOR RENT' : 'FOR SALE'}
                  </div>
                </div>

                <div className="house-card-content">
                  {/* Location and Icons Row */}
                  <div className="card-location-row">
                    <div className="card-location">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{house.location}</span>
                    </div>
                    <div className="card-icon-counts">
                      <span className="icon-count">
                        <i className="fas fa-camera"></i>
                        <span>{
                          house.image_urls?.length || 
                          (house.images && house.images.length > 0 ? house.images.length : 0) ||
                          (house.image ? 1 : 0)
                        }</span>
                      </span>
                      <span className="icon-count">
                        <i className="fas fa-bed"></i>
                        <span>{house.beds || 0}</span>
                      </span>
                    </div>
                  </div>

                  <div className="card-price">
                    <strong>₱{Number(house.price).toLocaleString()}</strong>
                    {house.listing_type === 'rent' && '/Month'}
                  </div>
                  
                  <h4 className="house-card-title">{house.title}</h4>
                  
                  {house.description && (
                    <p className="house-card-description">{house.description}</p>
                  )}
                  
                  <ul className="card-list">
                    {house.beds && (
                      <li className="card-item">
                        <strong>{house.beds}</strong>
                        <i className="fas fa-bed"></i>
                        <span>Bedrooms</span>
                      </li>
                    )}
                    {house.baths && (
                      <li className="card-item">
                        <strong>{house.baths}</strong>
                        <i className="fas fa-bath"></i>
                        <span>Bathrooms</span>
                      </li>
                    )}
                    {house.floor_area && (
                      <li className="card-item">
                        <strong>{house.floor_area}</strong>
                        <i className="fas fa-ruler-combined"></i>
                        <span>Square Ft</span>
                      </li>
                    )}
                  </ul>
                </div>

                {house.user && (
                  <div className="card-footer">
                    <div className="card-author">
                      <figure className="author-avatar">
                        {house.user.profile?.profile_image ? (
                          <img src={house.user.profile.profile_image} alt={house.user.username} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '18px', fontWeight: '600' }}>
                            {(() => {
                              const user = house.user;
                              if (user?.first_name && user.first_name.length > 0) {
                                return user.first_name[0];
                              }
                              const username = user?.username;
                              if (username && username.length > 0) {
                                const firstChar = username[0];
                                if (firstChar) {
                                  return firstChar.toUpperCase();
                                }
                              }
                              return 'U';
                            })()}
                          </div>
                        )}
                      </figure>
                      <div>
                        <p className="author-name">
                          {house.user.first_name} {house.user.last_name}
                        </p>
                        <p className="author-title">Owner of the house</p>
                      </div>
                    </div>
                    
                    <div className="card-footer-actions">
                      <button className="card-footer-actions-btn" onClick={(e) => { e.stopPropagation(); }}>
                        <i className="fas fa-share-alt"></i>
                      </button>
                      <button className="card-footer-actions-btn" onClick={(e) => { e.stopPropagation(); }}>
                        <i className="far fa-heart"></i>
                      </button>
                      <button className="card-footer-actions-btn" onClick={(e) => { e.stopPropagation(); }}>
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for House Details */}
      {modalHouse && (
        <div className="modal-overlay" onClick={() => setModalHouse(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalHouse(null)} aria-label="Close">
              ×
            </button>
            {((modalHouse.image_urls && modalHouse.image_urls.length > 0) || modalHouse.image) && (
              <div className="modal-image-wrapper">
                {modalHouse.image_urls && modalHouse.image_urls.length > 1 ? (
                  <div className="image-gallery-modal">
                    <div className="image-gallery-main-image">
                      <img 
                        src={modalHouse.image_urls[0]} 
                        alt={modalHouse.title} 
                        id="main-modal-image"
                      />
                    </div>
                    <div className="image-gallery-thumbnails">
                      {modalHouse.image_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${modalHouse.title} - Image ${index + 1}`}
                          className="image-gallery-thumbnail"
                          onClick={() => {
                            const mainImg = document.getElementById('main-modal-image') as HTMLImageElement;
                            if (mainImg) mainImg.src = url;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <img 
                    src={modalHouse.image_urls && modalHouse.image_urls.length > 0 
                      ? modalHouse.image_urls[0] 
                      : modalHouse.image} 
                    alt={modalHouse.title} 
                  />
                )}
              </div>
            )}
            <div className="modal-header">
              <div>
                <h3>{modalHouse.title}</h3>
                <p className="modal-location"> {modalHouse.location}</p>
              </div>
              <span className={`modal-badge ${modalHouse.listing_type === 'rent' ? 'badge-rent' : 'badge-sale'}`}>
                {modalHouse.listing_type === 'rent' ? 'FOR RENT' : 'FOR SALE'}
              </span>
            </div>
            
            <div className="modal-price-section">
              <span className="modal-price-label">{modalHouse.listing_type === 'rent' ? 'Monthly Rent' : 'Sale Price'}</span>
              <div className="modal-price">
                <span className="modal-price-amount">₱{Number(modalHouse.price).toLocaleString()}</span>
                {modalHouse.listing_type === 'rent' && <span className="modal-price-period">/month</span>}
              </div>
            </div>
            
            {modalHouse.description && (
              <div className="modal-description">
                <h4>Description</h4>
                <p>{modalHouse.description}</p>
              </div>
            )}
            
            {modalHouse.user && (
              <div className="modal-owner">
                <h4>Property Owner</h4>
                <p>{modalHouse.user.first_name} {modalHouse.user.last_name}</p>
              </div>
            )}
            
            {user && modalHouse.user && modalHouse.user.id === user.id && (
              <div className="house-actions">
                <button className="action-btn edit-btn" onClick={() => handleEdit(modalHouse)}>
                  Edit
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(modalHouse.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default HouseSalePage;
