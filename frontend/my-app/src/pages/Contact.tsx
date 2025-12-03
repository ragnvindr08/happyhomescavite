import React, { FC, FormEvent, useState } from "react";
import NavBar from "./NavBar";
import "./Contact.css";
import { useNotifications } from "./NotificationContext";



const Contact: FC = () => {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    inquiryType: '',
    fullName: '',
    email: '',
    phone: '',
    message: '',
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!formData.consent) {
    alert('Please accept the terms and conditions to proceed.');
    return;
  }

  setIsSubmitting(true);
  setSubmitStatus('idle');

  try {
    const emailPayload = {
      subject: `New Inquiry: ${formData.inquiryType} from ${formData.fullName}`,
      // HTML-formatted message
      message: `
        New Inquiry Received
        Name:${formData.fullName}
        Email:${formData.email}
        Phone:${formData.phone}
        Inquiry Type:${formData.inquiryType}
        Message:${formData.message.replace(/\n/g, '<br/>')}
      `,
      recipient: "happyphhomes@gmail.com",
      isHtml: true // Ensure your backend interprets this
    };

    const response = await fetch('http://localhost:8000/api/notifications/send-email/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) throw new Error('Failed to send email');

    addNotification(`✅ Inquiry submitted successfully! We'll get back to you soon.`);
    setSubmitStatus('success');
    setFormData({
      inquiryType: '',
      fullName: '',
      email: '',
      phone: '',
      message: '',
      consent: false
    });
    setTimeout(() => setSubmitStatus('idle'), 5000);
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    setSubmitStatus('error');
    addNotification(`❌ Failed to submit inquiry. Please try again or contact us directly.`);
    setTimeout(() => setSubmitStatus('idle'), 5000);
  } finally {
    setIsSubmitting(false);
  }
};

const inquiryTypes = [
  { label: 'Select an option', value: '', disabled: true },
  { label: 'Property Inquiry', value: 'Property Inquiry' },
  { label: 'General Information', value: 'General Information' },
  { label: 'Support Request', value: 'Support Request' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'Feedback', value: 'Feedback' },
  { label: 'Other', value: 'Other' }
];

  return (
    <>
      <NavBar />
      <div className="contact-page-container">
        {/* Hero Section */}
        <div className="contact-hero">
          <h1>Contact Us</h1>
          <p>
            Get in touch with our team for any questions about properties, support, or general inquiries. 
            We're here to help you find your perfect home.
          </p>
        </div>

        {/* Contact Content */}
        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-container">
            <h2 className="contact-form-title">Send Inquiry</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="inquiryType">Inquiry Type *</label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  required
                >
                  {inquiryTypes.map((type, index) => (
                    <option
                      key={index}
                      value={type.value}
                      disabled={type.disabled || false}
                      hidden={index === 0}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Tell us about your inquiry..."
                />
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="consent">
                  I accept the Terms and Privacy Policy
                </label>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Sending...' : 'Submit Inquiry'}</span>
              </button>

              {submitStatus === 'success' && (
                <div className="status-message success">
                  ✓ Your inquiry was sent successfully! We'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="status-message error">
                  ✗ Something went wrong. Please try again.
                </div>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info-container">
            <h2 className="contact-info-title">Our Contact Info</h2>
            <ul className="contact-info-list">
              <li className="contact-info-item">
                <span className="contact-info-item-icon">📧</span>
                <div className="contact-info-item-content">
                  <div className="contact-info-item-label">Email</div>
                  <div className="contact-info-item-value">
                    <a href="mailto:happyphhomes@gmail.com">happyphhomes@gmail.com</a>
                  </div>
                </div>
              </li>
              <li className="contact-info-item">
                <span className="contact-info-item-icon">📞</span>
                <div className="contact-info-item-content">
                  <div className="contact-info-item-label">Phone</div>
                  <div className="contact-info-item-value">+1 234 567 890</div>
                </div>
              </li>
              <li className="contact-info-item">
                <span className="contact-info-item-icon">📍</span>
                <div className="contact-info-item-content">
                  <div className="contact-info-item-label">Address</div>
                  <div className="contact-info-item-value">Happy Homes, Imus, Cavite</div>
                </div>
              </li>
            </ul>

            <div className="contact-map-container">
              <div className="map-responsive">
                <iframe
                  title="Happy Homes Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2397.602078931177!2d120.94677353861209!3d14.407506596514082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d3acc860116d%3A0xd1c6dd43386abbdd!2sHappy%20Homes%20Subdivision%2C%20Imus%2C%20Cavite!5e1!3m2!1sen!2sph!4v1761660624868!5m2!1sen!2sph"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
