import React, { useEffect, useState, useRef, FormEvent } from 'react';
import { getToken, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import newsAlertIcon from '../images/newsalert.png';
import logOut from '../images/logout1.png'; 
import './HomePage.css';
import aboutUsImage1 from '../images/aboutus.png';
import aboutUsImage2 from '../images/aboutus.jpg';
import aboutUsImage3 from '../images/aboutus (2).png';
import house123Image from '../images/house123.png';
import service1Image from '../images/service-1.png';
import service2Image from '../images/service-2.png';
import service3Image from '../images/service-3.png';
import BuildIcon from '@mui/icons-material/Build';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_verified?: boolean;
  profile?: {
    contact_number?: string;
    profile_image?: string;
    is_verified?: boolean;
  };
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_published?: boolean;
}

interface AlertItem {
  id: number;
  title: string;
  message: string;
  severity: string;
  created_at: string;
  is_active?: boolean;
}

type CombinedItem = {
  id: number;
  type: 'news' | 'alert';
  title: string;
  message: string;
  category: string;
  urgent: boolean;
  timestamp: string;
};

interface Post {
  id: number;
  title: string;
  body: string;
}

interface BlogStory {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image?: string;
  isRealPost?: boolean; // Flag to indicate if this is a real post from the database
}

interface Comment {
  id: number;
  blog_id: number;
  user: string;
  user_id?: number; // Add user_id to check ownership
  username: string;
  content: string;
  created_at: string;
  is_admin?: boolean;
  profile_image?: string | null; // Profile image URL for the commenter
}

interface MediaItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: 'image' | 'video';
  date?: string;
}

interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  description?: string;
  category: string;
  is_active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

interface Pin {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status?: string;
  description?: string;
  price?: string;
  occupant?: string;
  image?: string;
  square_meter?: number | string;
}

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [combinedItems, setCombinedItems] = useState<CombinedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // State for Bulletin Board, News, Blogs, Media, and Alerts
  const [bulletinPosts, setBulletinPosts] = useState<Post[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [blogStories, setBlogStories] = useState<BlogStory[]>([]);
  const [blogPosts, setBlogPosts] = useState<Post[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogStory | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedCombinedItem, setSelectedCombinedItem] = useState<CombinedItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const mediaGalleryRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [currentAboutImageIndex, setCurrentAboutImageIndex] = useState(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Modal states for bulletin board items
  const [selectedBulletinPost, setSelectedBulletinPost] = useState<Post | null>(null);
  const [selectedBulletinNews, setSelectedBulletinNews] = useState<NewsItem | null>(null);
  const [selectedBulletinBlog, setSelectedBulletinBlog] = useState<Post | null>(null);
  const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<EmergencyContact | null>(null);
  const [selectedBulletinPin, setSelectedBulletinPin] = useState<Pin | null>(null);
  
  // Array of about us images
  const aboutUsImages = [
    aboutUsImage1,
    aboutUsImage2,
    aboutUsImage3,
  ];

  // Helper function to calculate scroll position
  const calculateScrollPosition = (pageNum: number, gallery: HTMLDivElement | null): number => {
    if (!gallery) return 0;
    
    const firstCard = gallery.querySelector('.media-card-horizontal') as HTMLElement;
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth;
      const gap = 20;
      const cardsPerPage = 5;
      // Calculate the position of the first card of the requested page
      // Page 1: item 0, Page 2: item 5, Page 3: item 10, etc.
      const firstItemIndex = (pageNum - 1) * cardsPerPage;
      // Scroll to the position of that first card
      // Account for padding (20px on each side = 40px total)
      const padding = 20;
      return firstItemIndex * (cardWidth + gap) + padding;
    }
    // Fallback calculation
    const cardWidth = 300;
    const gap = 20;
    const cardsPerPage = 5;
    const firstItemIndex = (pageNum - 1) * cardsPerPage;
    const padding = 20;
    return firstItemIndex * (cardWidth + gap) + padding;
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch profile
    fetch('http://127.0.0.1:8000/api/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data: User) => setUser(data))
      .catch(() => {
        logout();
        navigate('/login');
      });
  }, [navigate]);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down more than 300px
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      setShowScrollToTop(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function fetchNewsAlerts() {
      try {
        const [newsRes, alertsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/news/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://127.0.0.1:8000/api/alerts/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!newsRes.ok || !alertsRes.ok) throw new Error('Failed to fetch');

        const newsData: NewsItem[] = await newsRes.json();
        const alertsData: AlertItem[] = await alertsRes.json();

        const combined: CombinedItem[] = [
          ...newsData.map((n) => ({
            id: n.id,
            type: 'news' as const,
            title: n.title,
            message: n.content,
            category: 'Community',
            urgent: false,
            timestamp: n.created_at,
          })),
          ...alertsData.map((a) => ({
            id: a.id,
            type: 'alert' as const,
            title: a.title,
            message: a.message,
            category: a.severity,
            urgent: a.severity === 'critical',
            timestamp: a.created_at,
          })),
        ];

        // Sort: urgent first, then by timestamp
        combined.sort((a, b) => {
          if (a.urgent && !b.urgent) return -1;
          if (!a.urgent && b.urgent) return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        setCombinedItems(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNewsAlerts();

    // Set up automatic refresh every 30 seconds for news & alerts
    const refreshInterval = setInterval(() => {
      fetchNewsAlerts();
    }, 30000); // Refresh every 30 seconds

    // Refresh when window gains focus
    const handleFocus = () => {
      fetchNewsAlerts();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Fetch Bulletin Board, News, Alerts, Media, and Blogs
  useEffect(() => {
    const fetchData = async () => {
      setSectionLoading(true);
      try {
        const token = getToken();
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch bulletin board posts (public endpoint - no auth required)
        const bulletinsRes = await fetch('http://127.0.0.1:8000/api/bulletins/', { 
          headers: { 'Content-Type': 'application/json' } 
        });
        let bulletinsData: any[] = [];
        let postsData: Post[] = [];
        if (bulletinsRes.ok) {
          bulletinsData = await bulletinsRes.json();
          // Convert bulletins to Post format for compatibility
          postsData = bulletinsData.map((b: any) => ({
            id: b.id,
            title: b.title,
            body: b.content
          }));
          // Show all bulletins, filter only published ones
          setBulletinPosts(postsData.filter((p: Post) => {
            const bulletin = bulletinsData.find((b: any) => b.id === p.id);
            return bulletin?.is_published !== false;
          }));
        } else {
          console.error('Failed to fetch bulletins:', bulletinsRes.status, bulletinsRes.statusText);
        }

        // Fetch news
        const newsRes = await fetch('http://127.0.0.1:8000/api/news/', { headers });
        const newsData: NewsItem[] = newsRes.ok ? await newsRes.json() : [];

        // Fetch alerts
        const alertsRes = await fetch('http://127.0.0.1:8000/api/alerts/', { headers });
        const alertsData: AlertItem[] = alertsRes.ok ? await alertsRes.json() : [];

        // Fetch emergency contacts
        const emergencyContactsRes = await fetch('http://127.0.0.1:8000/api/emergency-contacts/?is_active=true', { headers });
        const emergencyContactsData = emergencyContactsRes.ok ? await emergencyContactsRes.json() : [];
        setEmergencyContacts(Array.isArray(emergencyContactsData) ? emergencyContactsData : (emergencyContactsData.results || []));

        // Fetch blog posts
        const blogPostsRes = await fetch('http://127.0.0.1:8000/api/posts/', { headers });
        const blogPostsData: Post[] = blogPostsRes.ok ? await blogPostsRes.json() : [];
        setBlogPosts(blogPostsData); // Store all blog posts for Bulletin Board

        // Fetch pins
        const pinsRes = await fetch('http://127.0.0.1:8000/api/pins/');
        const pinsData: Pin[] = pinsRes.ok ? await pinsRes.json() : [];
        setPins(pinsData); // Store pins for Bulletin Board
        
        // Sort news by created_at (newest first) and filter published items - show all
        const sortedNews = newsData
          .filter(item => item.is_published !== false)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNewsItems(sortedNews);
        
        // Sort alerts by created_at (newest first) and filter active items - show all
        const sortedAlerts = alertsData
          .filter(item => item.is_active !== false)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAlerts(sortedAlerts);

        // Create dummy blog stories with enhanced content
        const dummyBlogs: BlogStory[] = [
          {
            id: 1,
            title: 'Building a Stronger Community: Our Journey Together',
            content: 'At Happy Homes, we believe that a house becomes a home when neighbors become friends. Over the past year, we\'ve witnessed incredible community spirit through our various events, from summer barbecues to holiday celebrations. This blog post shares heartwarming stories of how our residents have come together to create lasting friendships and support each other through life\'s ups and downs. Join us as we celebrate the bonds that make Happy Homes more than just a place to live—it\'s a place to thrive.',
            author: 'Maria Santos',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            category: 'Community',
            readTime: '5 min read',
            image: house123Image,
          },
          {
            id: 2,
            title: 'Sustainable Living: Green Initiatives in Our Community',
            content: 'Happy Homes is committed to environmental sustainability and green living. We\'ve recently implemented several eco-friendly initiatives including solar panel installations, community gardens, and recycling programs. Our residents have embraced these changes wholeheartedly, and we\'re proud to share our progress. Learn about how small changes in our daily lives can make a big impact on our planet, and discover the green features that make Happy Homes a leader in sustainable community living.',
            author: 'John Martinez',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            category: 'Sustainability',
            readTime: '7 min read',
            image: house123Image,
          },
          {
            id: 3,
            title: 'Safety First: Security Updates and Neighborhood Watch',
            content: 'Your safety and security are our top priorities at Happy Homes. We\'re excited to announce the launch of our enhanced security system and the formation of a neighborhood watch program. This comprehensive guide covers everything you need to know about our new security features, how to participate in the watch program, and tips for keeping your home and family safe. Together, we can create a secure environment where everyone feels protected and at peace.',
            author: 'Sarah Johnson',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            category: 'Safety',
            readTime: '6 min read',
            image: house123Image,
          },
        ];

        // Convert all blog posts to BlogStory format
        const convertedBlogs: BlogStory[] = blogPostsData.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.body,
          author: 'Community Admin',
          date: new Date().toISOString(),
          category: 'Community',
          readTime: `${Math.ceil(post.body.length / 200)} min read`,
          image: post.image 
            ? (post.image.startsWith('http') ? post.image : `http://127.0.0.1:8000${post.image}`)
            : house123Image,
          isRealPost: true, // Mark as real post from database
        }));
        
        setBlogStories(convertedBlogs);

        // Fetch community media from API
        const mediaRes = await fetch('http://127.0.0.1:8000/api/community-media/?is_public=true', { headers });
        let communityMediaData: any[] = [];
        if (mediaRes.ok) {
          communityMediaData = await mediaRes.json();
        }

        // Convert API media to MediaItem format
        const apiMedia: MediaItem[] = communityMediaData
          .filter((item: any) => item.is_approved && item.is_public)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            imageUrl: item.media_url 
              ? (item.media_url.startsWith('http') ? item.media_url : `http://127.0.0.1:8000${item.media_url}`)
              : '',
            type: item.media_type as 'image' | 'video',
            date: item.created_at || new Date().toISOString(),
          }));

        // Fallback: Use house images if no community media available
        if (apiMedia.length === 0) {
          const houseMedia: MediaItem[] = housesData
            .filter((house: any) => house.image)
            .slice(0, 6)
            .map((house: any, index: number) => ({
              id: house.id || index,
              title: house.title || `House ${house.id}`,
              description: house.description || house.location || 'Beautiful home in Happy Homes community',
              imageUrl: house.image.startsWith('http') ? house.image : `http://127.0.0.1:8000${house.image}`,
              type: 'image' as const,
              date: house.created_at || new Date().toISOString(),
            }));

          const sampleImage = house123Image;
          const templateItems: MediaItem[] = Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            title: `Community Feature ${i + 1}`,
            description: 'Beautiful community feature in Happy Homes.',
            imageUrl: sampleImage,
            type: 'image' as const,
          }));

          const finalMedia = houseMedia.length > 0 
            ? [...houseMedia, ...templateItems.slice(0, 30 - houseMedia.length)]
            : templateItems;
          setMediaItems(finalMedia.slice(0, 30));
        } else {
          // Use API media (limit to 30 items)
          setMediaItems(apiMedia.slice(0, 30));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setSectionLoading(false);
      }
    };

    fetchData();

    // Set up automatic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    // Refresh when window gains focus (user comes back to tab)
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Fetch comments when a blog is selected - works for everyone (guests, users, admins)
  useEffect(() => {
    if (selectedBlog) {
      // Fetch comments immediately
      fetchComments(selectedBlog.id);
      
      // Poll for new comments every 3 seconds for real-time updates (works for everyone)
      const intervalId = setInterval(() => {
        if (selectedBlog) {
          fetchComments(selectedBlog.id);
        }
      }, 3000);
      
      return () => clearInterval(intervalId);
    } else {
      setComments([]);
      return undefined;
    }
  }, [selectedBlog]);

  const fetchComments = async (blogId: number) => {
    setFetchingComments(true);
    try {
      const token = getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/blog-comments/?post_id=${blogId}`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        // Map API response to Comment interface
        const mappedComments: Comment[] = data.map((comment: any) => ({
          id: comment.id,
          blog_id: comment.post,
          user: comment.username,
          user_id: comment.user_id || comment.user, // Include user_id for ownership check
          username: comment.username,
          content: comment.content,
          created_at: comment.created_at,
          is_admin: comment.is_admin,
          profile_image: comment.user_profile_image || null, // Include profile image
        }));
        setComments(mappedComments);
      } else {
        console.error('Error fetching comments:', response.statusText);
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setFetchingComments(false);
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedBlog || !user) return;

    setCommentLoading(true);
    try {
      const token = getToken();
      if (!token) {
        alert('Please login to comment');
        setCommentLoading(false);
        return;
      }

      const requestBody = {
        post: selectedBlog.id,
        content: newComment.trim(),
      };

      console.log('Submitting comment:', requestBody);

      const response = await fetch('http://127.0.0.1:8000/api/blog-comments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status, response.statusText);

      if (response.ok) {
        const newCommentData = await response.json();
        // Map API response to Comment interface
        const comment: Comment = {
          id: newCommentData.id,
          blog_id: newCommentData.post,
          user: newCommentData.username,
          user_id: newCommentData.user_id || newCommentData.user,
          username: newCommentData.username,
          content: newCommentData.content,
          created_at: newCommentData.created_at,
          is_admin: newCommentData.is_admin,
          profile_image: newCommentData.user_profile_image || null, // Include profile image
        };
        
        // Add new comment to the top of the list immediately
        setComments([comment, ...comments]);
        setNewComment('');
        
        // Refresh comments from server to ensure consistency (real-time update)
        if (selectedBlog) {
          fetchComments(selectedBlog.id);
        }
      } else {
        // Try to get error message from response
        let errorMessage = 'Failed to add comment. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'object') {
            // Handle validation errors
            const errors = Object.values(errorData).flat();
            errorMessage = errors.join(', ') || errorMessage;
          }
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        console.error('Comment submission error:', errorMessage, response.status);
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert(`Failed to add comment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        alert('Please login to delete comments');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/blog-comments/${commentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        // Remove comment from list immediately
        setComments(comments.filter(c => c.id !== commentId));
        
        // Refresh comments from server to ensure consistency
        if (selectedBlog) {
          fetchComments(selectedBlog.id);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.detail || 'Failed to delete comment. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  if (!user) return <p className="loading">Loading...</p>;

  return (
    <div className="homepage-container">
      <NavBar />

      <div className="homepage-body">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-greeting">
            Welcome back, <span className="user-name">{`${user.first_name} ${user.last_name}`.trim() || user.username}</span>
          </h1>
          <p className="welcome-tagline">Explore our services and stay updated with the latest news</p>
        </div>

        {/* Welcome Message Section */}
        <div className="welcome-message-section">
          <div className="welcome-message-header">
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#666', 
              marginBottom: '10px',
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h2 className="welcome-message-heading">About <strong>Happy Homes</strong></h2>
            <div className="welcome-divider"></div>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#666', 
              marginTop: '10px',
              fontFamily: "'Courier New', monospace",
              fontStyle: 'italic'
            }}>
              Community News & Information
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '80px',
            alignItems: 'flex-start',
            marginBottom: '80px',
            maxWidth: '100%',
            margin: '0 auto 80px',
            padding: '0 10px',
          }}>
            {/* Left Side - About Us Content */}
            <div style={{
              flex: '1',
              padding: '0',
            }}>
              <div className="welcome-intro">
                <p className="welcome-lead">
                  At Happy Homes, we believe that a house becomes a home when neighbors become friends. Our mission is to create a thriving, connected community where families can build lasting relationships and create beautiful memories together.
                </p>
              </div>
              <div className="welcome-body">
                <p>
                  We strive to provide exceptional community management services, state-of-the-art facilities, and a platform that brings residents together. Our goal is to make Happy Homes more than just a place to live—it's a place where life connects, friendships flourish, and happiness thrives.
                </p>

                {/* Mission and Vision Section - Side by Side */}
                <div className="mission-vision-container">
                  {/* Mission Section */}
                  <div className="mission-box">
                    <h4>Our Mission</h4>
                    <p>
                      To create and maintain a vibrant, safe, and inclusive community where every resident feels valued, connected, and at home. We are committed to providing exceptional services, fostering meaningful relationships, and building a sustainable environment where families can thrive for generations to come.
                    </p>
                  </div>

                  {/* Vision Section */}
                  <div className="vision-box">
                    <h4>Our Vision</h4>
                    <p>
                      To be the leading community management platform that sets the standard for residential living. We envision Happy Homes as a model community where innovation, sustainability, and human connection come together to create an unparalleled living experience that residents are proud to call home.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - About Us Image Carousel */}
            <div style={{
              flex: '1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              paddingTop: '0px',
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
              }}>
                {/* Image Container - Newspaper Style */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: '0',
                  overflow: 'hidden',
                  border: '3px solid #000',
                  boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.1), 4px 4px 0px rgba(0, 0, 0, 0.05)',
                }}>
                  <img
                    src={aboutUsImages[currentAboutImageIndex % aboutUsImages.length]}
                    alt={`About Happy Homes ${currentAboutImageIndex + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover',
                      transition: 'opacity 0.3s ease',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = house123Image;
                    }}
                  />
                  
                  {/* Left Arrow - Newspaper Style */}
                  <button
                    onClick={() => {
                      setCurrentAboutImageIndex((prev) => 
                        prev > 0 ? prev - 1 : aboutUsImages.length - 1
                      );
                    }}
                    style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#000',
                      border: '2px solid #000',
                      borderRadius: '0',
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: '#fff',
                      boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      zIndex: 10,
                      fontFamily: "'Times New Roman', serif",
                      fontWeight: 'bold',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#333';
                      e.currentTarget.style.transform = 'translateY(-50%) translateX(-2px)';
                      e.currentTarget.style.boxShadow = '3px 3px 0px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000';
                      e.currentTarget.style.transform = 'translateY(-50%)';
                      e.currentTarget.style.boxShadow = '2px 2px 0px rgba(0, 0, 0, 0.2)';
                    }}
                    aria-label="Previous image"
                  >
                    ←
                  </button>

                  {/* Right Arrow - Newspaper Style */}
                  <button
                    onClick={() => {
                      setCurrentAboutImageIndex((prev) => 
                        (prev + 1) % aboutUsImages.length
                      );
                    }}
                    style={{
                      position: 'absolute',
                      right: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#000',
                      border: '2px solid #000',
                      borderRadius: '0',
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: '#fff',
                      boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      zIndex: 10,
                      fontFamily: "'Times New Roman', serif",
                      fontWeight: 'bold',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#333';
                      e.currentTarget.style.transform = 'translateY(-50%) translateX(2px)';
                      e.currentTarget.style.boxShadow = '3px 3px 0px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000';
                      e.currentTarget.style.transform = 'translateY(-50%)';
                      e.currentTarget.style.boxShadow = '2px 2px 0px rgba(0, 0, 0, 0.2)';
                    }}
                    aria-label="Next image"
                  >
                    →
                  </button>

                  {/* Image Indicators (Dots) - Newspaper Style */}
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10,
                  }}>
                    {aboutUsImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentAboutImageIndex(index)}
                        style={{
                          width: currentAboutImageIndex === index ? '24px' : '10px',
                          height: '10px',
                          borderRadius: '0',
                          border: '1px solid #000',
                          backgroundColor: currentAboutImageIndex === index ? '#000' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          padding: 0,
                        }}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section - Second Priority */}
        <div className="services-main-section">
          <div className="section-header-modern">
            <span className="section-label">What We Offer</span>
            <h2 className="section-heading">Our Services</h2>
          </div>
          <div className="services-grid-modern">
            <div 
              className="service-item service-clickable"
              onClick={() => navigate('/house-sales')}
            >
              <div className="service-image-box">
                <img src={service1Image} alt="Buy a Home" />
              </div>
              <div className="service-content">
                <h3>Buy a Home</h3>
                <p>Find your dream home today among our exclusive listings.</p>
                <span className="service-link">Explore Homes →</span>
              </div>
            </div>
            <div 
              className="service-item service-clickable"
              onClick={() => navigate('/house-sales')}
            >
              <div className="service-image-box">
                <img src={service2Image} alt="Rent a Home" />
              </div>
              <div className="service-content">
                <h3>Rent a Home</h3>
                <p>Rent homes with ease and enjoy a thriving community life.</p>
                <span className="service-link">Browse Rentals →</span>
              </div>
            </div>
            <div 
              className="service-item service-clickable"
              onClick={() => navigate('/calendar')}
            >
              <div className="service-image-box">
                <img src={service3Image} alt="Book Amenities" />
              </div>
              <div className="service-content">
                <h3>Book Amenities</h3>
                <p>Reserve amenities like pool and courts instantly.</p>
                <span className="service-link">Book Now →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bulletin Board Section - Newspaper Style */}
        <div className="section-container bulletin-board-container" style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          fontFamily: "'Georgia', 'Times New Roman', serif"
        }}>
          <div className="bulletin-board-header">
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#666', 
              marginBottom: '10px',
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h2 className="bulletin-board-title">Community Bulletin</h2>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#666', 
              marginTop: '10px',
              fontFamily: "'Courier New', monospace",
              fontStyle: 'italic'
            }}>
              Your Neighborhood News & Updates
            </div>
          </div>

          {sectionLoading ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>Loading...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
              {/* Row 1: Announcements */}
              <section className="bulletin-section">
                <h3 className="bulletin-section-title">Announcements</h3>
                {bulletinPosts.length > 0 ? (
                  <div className="bulletin-board-grid">
                    {bulletinPosts.map((post, index) => (
                      <article 
                        key={post.id} 
                        className="bulletin-card bulletin-card-clickable"
                        style={{ '--card-index': index } as React.CSSProperties}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedBulletinPost(post);
                        }}
                      >
                        <h4 className="bulletin-card-title">{post.title}</h4>
                        <p className="bulletin-card-content" style={{ whiteSpace: 'pre-wrap' }}>
                          {post.body}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="bulletin-empty">No announcements available at the moment.</p>
                )}
              </section>

              {/* Row 2: News */}
              <section className="bulletin-section">
                <h3 className="bulletin-section-title">News</h3>
                {newsItems.length > 0 ? (
                  <div className="bulletin-board-grid">
                    {newsItems.map((news, index) => (
                      <article 
                        key={news.id} 
                        className="bulletin-card bulletin-card-clickable"
                        style={{ '--card-index': index } as React.CSSProperties}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedBulletinNews(news);
                        }}
                      >
                        <h4 className="bulletin-card-title">{news.title}</h4>
                        <p className="bulletin-card-content" style={{ whiteSpace: 'pre-wrap' }}>
                          {news.content}
                        </p>
                        <div className="bulletin-card-meta">
                          <span>{new Date(news.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="bulletin-empty">No news available at the moment.</p>
                )}
              </section>

              {/* Row 4: Emergency Contacts */}
              <section className="bulletin-section">
                <h3 className="bulletin-section-title">Emergency Contacts</h3>
                {emergencyContacts.length > 0 ? (
                  <div className="bulletin-board-grid">
                    {emergencyContacts.map((contact: EmergencyContact, index) => (
                      <article 
                        key={contact.id} 
                        className="bulletin-card bulletin-card-clickable"
                        style={{ '--card-index': index } as React.CSSProperties}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedEmergencyContact(contact);
                        }}
                      >
                        <div className="bulletin-card-content" style={{ padding: '20px' }}>
                          <h4 className="bulletin-card-title" style={{ marginBottom: '10px', color: '#2e6F40' }}>
                            {contact.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e6F40' }}>
                              <a href={`tel:${contact.phone}`} style={{ color: '#2e6F40', textDecoration: 'none' }}>
                                {contact.phone}
                              </a>
                            </span>
                          </div>
                          {contact.category && (
                            <span className="bulletin-card-tag" style={{ 
                              background: contact.category === 'police' ? '#2196F3' : 
                                         contact.category === 'fire' ? '#f44336' : 
                                         contact.category === 'medical' ? '#4CAF50' : 
                                         '#9e9e9e',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              display: 'inline-block',
                              marginTop: '8px'
                            }}>
                              {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
                            </span>
                          )}
                          {contact.description && (
                            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                              {contact.description.length > 100 ? contact.description.substring(0, 100) + '...' : contact.description}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="bulletin-empty">No emergency contacts available at the moment.</p>
                )}
              </section>

            </div>
          )}
        </div>

        {/* Bulletin Board Modals */}
        {/* Announcement Modal */}
        {selectedBulletinPost && (
          <div className="bulletin-modal-overlay" onClick={() => setSelectedBulletinPost(null)}>
            <div className="bulletin-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="bulletin-modal-close" onClick={() => setSelectedBulletinPost(null)}>×</button>
              <h2 className="bulletin-modal-title">{selectedBulletinPost.title}</h2>
              <div className="bulletin-modal-body">
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{selectedBulletinPost.body}</p>
              </div>
            </div>
          </div>
        )}

        {/* News Modal */}
        {selectedBulletinNews && (
          <div className="bulletin-modal-overlay" onClick={() => setSelectedBulletinNews(null)}>
            <div className="bulletin-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="bulletin-modal-close" onClick={() => setSelectedBulletinNews(null)}>×</button>
              <h2 className="bulletin-modal-title">{selectedBulletinNews.title}</h2>
              <div className="bulletin-modal-body">
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', marginBottom: '20px' }}>
                  {selectedBulletinNews.content}
                </p>
                <div className="bulletin-modal-meta">
                  <span>Published: {new Date(selectedBulletinNews.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* House Modal */}
        {selectedEmergencyContact && (
          <div className="bulletin-modal-overlay" onClick={() => setSelectedEmergencyContact(null)}>
            <div className="bulletin-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="bulletin-modal-close" onClick={() => setSelectedEmergencyContact(null)}>×</button>
              <h2 className="bulletin-modal-title">{selectedEmergencyContact.name}</h2>
              <div className="bulletin-modal-body">
                <div className="bulletin-modal-details">
                  <div className="bulletin-modal-detail-item">
                    <strong>Phone Number:</strong> 
                    <a href={`tel:${selectedEmergencyContact.phone}`} style={{ 
                      fontSize: '20px', 
                      color: '#2e6F40', 
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      marginLeft: '10px'
                    }}>
                      {selectedEmergencyContact.phone}
                    </a>
                  </div>
                  {selectedEmergencyContact.category && (
                    <div className="bulletin-modal-detail-item">
                      <strong>Category:</strong> 
                      <span className="bulletin-card-tag" style={{ 
                        background: selectedEmergencyContact.category === 'police' ? '#2196F3' : 
                                   selectedEmergencyContact.category === 'fire' ? '#f44336' : 
                                   selectedEmergencyContact.category === 'medical' ? '#4CAF50' : 
                                   '#9e9e9e',
                        color: 'white',
                        padding: '6px 16px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        marginLeft: '10px'
                      }}>
                        {selectedEmergencyContact.category.charAt(0).toUpperCase() + selectedEmergencyContact.category.slice(1)}
                      </span>
                    </div>
                  )}
                  {selectedEmergencyContact.description && (
                    <div className="bulletin-modal-detail-item" style={{ marginTop: '20px' }}>
                      <strong>Description:</strong>
                      <p style={{ marginTop: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                        {selectedEmergencyContact.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Services Section 2 - Maintenance, Billing, Visitors - Only for verified homeowners */}
        {user && !user.is_staff && (user.is_verified || user.profile?.is_verified) && (
          <div className="services-main-section">
            <div className="section-header-modern">
              <span className="section-label">Resident Services</span>
              <h2 className="section-heading">Our Services</h2>
            </div>
            <div className="services-grid-modern">
              <div 
                className="service-item service-clickable"
                onClick={() => navigate('/maintenance-request')}
              >
                <div className="service-image-box">
                  <BuildIcon sx={{ fontSize: 64, color: '#2e6F40' }} />
                </div>
                <div className="service-content">
                  <h3>Maintenance</h3>
                  <p>Request professional maintenance services for your home. From carpentry to air conditioning repair.</p>
                  <span className="service-link">Request Service →</span>
                </div>
              </div>
              <div 
                className="service-item service-clickable"
                onClick={() => navigate('/billing')}
              >
                <div className="service-image-box">
                  <PaymentIcon sx={{ fontSize: 64, color: '#2e6F40' }} />
                </div>
                <div className="service-content">
                  <h3>Billing</h3>
                  <p>Manage your bills and service fees. View payment history and upload receipts easily.</p>
                  <span className="service-link">View Billing →</span>
                </div>
              </div>
              <div 
                className="service-item service-clickable"
                onClick={() => navigate('/resident-dashboard')}
              >
                <div className="service-image-box">
                  <PeopleIcon sx={{ fontSize: 64, color: '#2e6F40' }} />
                </div>
                <div className="service-content">
                  <h3>Visitors</h3>
                  <p>Manage your visitors. Generate PINs, approve requests, and track visitor check-ins.</p>
                  <span className="service-link">Manage Visitors →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blogs & Stories Section */}
        <div className="section-container blogs-stories-container">
          <div className="section-header">
            <p className="section-label">Community Stories</p>
            <h2 className="section-title">Blogs & Stories</h2>
          </div>
          {blogStories.length > 0 ? (
            <div className="blogs-grid">
              {blogStories.map((blog, index) => (
                <div
                  key={`blog-${blog.id}`}
                  className="blog-story-card"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Blog Image */}
                  {blog.image && (
                    <div className="blog-image-wrapper">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="blog-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="blog-category-badge">{blog.category}</div>
                    </div>
                  )}

                  <div className="blog-card-body">
                    <div className="blog-card-header">
                      <div className="blog-author-info">
                        <div className="blog-author-avatar">
                          {blog.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="blog-author-details">
                          <span className="blog-author-name">{blog.author}</span>
                          <span className="blog-date">
                            {new Date(blog.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="blog-read-time">{blog.readTime}</div>
                    </div>

                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-content">
                      {blog.content.length > 180 ? `${blog.content.substring(0, 180)}...` : blog.content}
                    </p>

                    <div className="blog-footer">
                      <a
                        href="#"
                        className="read-more-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedBlog(blog);
                        }}
                      >
                        Read Full Story <span className="arrow">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No blog posts available at the moment.</p>
            </div>
          )}
        </div>

        {/* Media Gallery Section - Horizontal Scrollable with Navigation */}
        <div className="section-container media-gallery-container">
          <div className="section-header">
            <p className="section-label">Community Gallery</p>
            <h2 className="section-title">Pictures & Videos</h2>
          </div>
          {mediaItems.length > 0 ? (
            <>
              {/* Navigation Buttons */}
              <div className="gallery-navigation">
                {(() => {
                  const itemsPerPage = 5;
                  const totalPages = Math.ceil(mediaItems.length / itemsPerPage);
                  return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`nav-button ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage(pageNum);
                    }}
                    >
                      {pageNum}
                    </button>
                  ));
                })()}
              </div>

              {/* Horizontal Scrollable Gallery with Integrated Arrows */}
              <div className="media-gallery-wrapper">
                {/* Left Arrow - Inside Gallery */}
                <button
                  className="gallery-arrow gallery-arrow-left"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  aria-label="Scroll left"
                  disabled={currentPage === 1}
                >
                  ←
                </button>

                {/* Gallery Container */}
                <div
                  ref={mediaGalleryRef}
                  className="media-gallery-horizontal"
                >
                  {(() => {
                    const itemsPerPage = 5;
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const currentPageItems = mediaItems.slice(startIndex, endIndex);
                    
                    return currentPageItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="media-card-horizontal"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => setSelectedMedia(item)}
                      >
                      <div className="media-image-container">
                        {item.type === 'image' ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="media-image"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = house123Image;
                            }}
                          />
                        ) : (
                          <div className="media-video-placeholder">
                            <div className="play-icon">▶</div>
                          </div>
                        )}
                        <div className="media-overlay">
                          <div className="media-type-badge">
                            {item.type === 'image' ? '📷 Photo' : '🎥 Video'}
                          </div>
                        </div>
                      </div>
                      <div className="media-content">
                        <h3 className="media-title">{item.title}</h3>
                        <p className="media-description">{item.description}</p>
                        {item.date && (
                          <span className="media-date">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    ));
                  })()}
                </div>

                {/* Right Arrow - Inside Gallery */}
                <button
                  className="gallery-arrow gallery-arrow-right"
                  onClick={() => {
                    const itemsPerPage = 5;
                    const totalPages = Math.ceil(mediaItems.length / itemsPerPage);
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  aria-label="Scroll right"
                  disabled={currentPage >= Math.ceil(mediaItems.length / 5)}
                >
                  →
                </button>
              </div>

              {/* Section Indicator */}
              <div className="section-indicator">
                <span className="scroll-hint">
                  Section <strong>{currentPage}</strong> of <strong>{Math.ceil(mediaItems.length / 5)}</strong>
                </span>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No media available at the moment.</p>
            </div>
          )}
        </div>

        {/* Media Modal */}
        {selectedMedia && (
          <div
            className="media-modal"
            onClick={() => setSelectedMedia(null)}
          >
            <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="media-modal-close"
                onClick={() => setSelectedMedia(null)}
              >
                ×
              </button>
              <div className="media-modal-image">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.imageUrl}
                    alt={selectedMedia.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = house123Image;
                    }}
                  />
                ) : (
                  <video
                    src={selectedMedia.imageUrl}
                    controls
                    autoPlay
                    style={{ width: '100%', maxHeight: '80vh', borderRadius: '8px' }}
                  />
                )}
              </div>
              <div className="media-modal-info">
                <h2>{selectedMedia.title}</h2>
                <p>{selectedMedia.description}</p>
                {selectedMedia.date && (
                  <span className="media-date">
                    {new Date(selectedMedia.date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Blog Modal */}
        {selectedBlog && (
          <div
            className="blog-modal"
            onClick={() => setSelectedBlog(null)}
          >
            <div className="blog-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="blog-modal-close"
                onClick={() => setSelectedBlog(null)}
              >
                ×
              </button>
              {selectedBlog.image && (
                <div className="blog-modal-image">
                  <img
                    src={selectedBlog.image}
                    alt={selectedBlog.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="blog-modal-category-badge">{selectedBlog.category}</div>
                </div>
              )}
              <div className="blog-modal-body">
                <div className="blog-modal-header">
                  <div className="blog-modal-author-info">
                    <div className="blog-modal-author-avatar">
                      {selectedBlog.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="blog-modal-author-details">
                      <span className="blog-modal-author-name">{selectedBlog.author}</span>
                      <span className="blog-modal-date">
                        {new Date(selectedBlog.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="blog-modal-read-time">{selectedBlog.readTime}</div>
                </div>
                <h1 className="blog-modal-title">{selectedBlog.title}</h1>
                <div className="blog-modal-content-text">
                  <p>{selectedBlog.content}</p>
                </div>
                <div className="blog-comments-section">
                  <h3 className="comments-section-title">
                    Comments ({comments.length})
                  </h3>
                  
                  {/* Comment form - only for authenticated users */}
                  {user && selectedBlog && (
                    <form className="comment-form" onSubmit={handleAddComment}>
                      <div className="comment-input-wrapper">
                        <div className="comment-user-avatar">
                          {user.profile?.profile_image ? (
                            <img 
                              src={user.profile.profile_image.startsWith('http') 
                                ? user.profile.profile_image 
                                : `http://127.0.0.1:8000${user.profile.profile_image}`}
                              alt={user.username}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.textContent = user.username.charAt(0).toUpperCase();
                                }
                              }}
                            />
                          ) : (
                            user.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <textarea
                          className="comment-input"
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                          required
                        />
                      </div>
                      <div className="comment-form-actions">
                        <button
                          type="submit"
                          className="comment-submit-btn"
                          disabled={commentLoading || !newComment.trim()}
                        >
                          {commentLoading ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </form>
                  )}
                  
                  {/* Message for guests */}
                  {!user && (
                    <div className="comment-guest-message">
                      <p>
                        Please <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>login</a> to leave a comment.
                      </p>
                    </div>
                  )}
                  <div className="comments-list">
                    {fetchingComments ? (
                      <div className="comments-loading">Loading comments...</div>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => {
                        // Check if current user can delete this comment (owner or admin)
                        // Admin can delete ANY comment, users can only delete their own
                        const isAdmin = user && user.is_staff === true;
                        const isOwner = user && comment.user_id && (
                          user.id === comment.user_id || 
                          user.id === parseInt(String(comment.user_id)) ||
                          String(user.id) === String(comment.user_id)
                        );
                        // Admins can delete ALL comments, regular users can only delete their own
                        const canDelete = isAdmin || isOwner;
                        
                        // Debug: Log admin status for troubleshooting
                        if (user && user.is_staff) {
                          console.log('[DEBUG] Admin user detected, delete button should show for all comments');
                        }
                        
                        return (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <div className="comment-author-info">
                                <div className={`comment-author-avatar ${comment.is_admin ? 'admin' : ''}`}>
                                  {comment.profile_image ? (
                                    <img 
                                      src={comment.profile_image.startsWith('http') 
                                        ? comment.profile_image 
                                        : `http://127.0.0.1:8000${comment.profile_image}`}
                                      alt={comment.username}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        const parent = (e.target as HTMLImageElement).parentElement;
                                        if (parent) {
                                          parent.textContent = comment.username.charAt(0).toUpperCase();
                                        }
                                      }}
                                    />
                                  ) : (
                                    comment.username.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="comment-author-details">
                                  <span className="comment-author-name">
                                    {comment.username}
                                    {comment.is_admin && (
                                      <span className="admin-badge">Admin</span>
                                    )}
                                  </span>
                                  <span className="comment-date">
                                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                              {/* Delete button - ALWAYS show for admins on ALL comments, or for users on their own comments */}
                              {(isAdmin || isOwner) && (
                                <button
                                  className="comment-delete-btn"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (window.confirm(isAdmin ? 'Delete this comment? (Admin)' : 'Delete your comment?')) {
                                      handleDeleteComment(comment.id);
                                    }
                                  }}
                                  title={isAdmin ? "Delete comment (Admin)" : "Delete your comment"}
                                  style={{
                                    display: 'inline-flex',
                                    visibility: 'visible',
                                    opacity: 1
                                  }}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            <div className="comment-content">{comment.content}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="comments-empty">
                        No comments yet. {user ? 'Be the first to comment!' : 'Login to leave a comment.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Modal */}
        {selectedNews && (
          <div
            className="blog-modal"
            onClick={() => setSelectedNews(null)}
          >
            <div className="blog-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="blog-modal-close"
                onClick={() => setSelectedNews(null)}
              >
                ×
              </button>
              <div className="blog-modal-body">
                <div className="blog-modal-header">
                  <div className="blog-modal-author-info">
                    <div className="blog-modal-author-avatar">
                      N
                    </div>
                    <div className="blog-modal-author-details">
                      <span className="blog-modal-author-name">News & Updates</span>
                      <span className="blog-modal-date">
                        {new Date(selectedNews.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <h1 className="blog-modal-title">{selectedNews.title}</h1>
                <div className="blog-modal-content-text">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedNews.content}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#2e6F40',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e5a30';
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2e6F40';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
