import React, { useState } from 'react';
import Button from './Button';
import './SignUpForm.css';
import axios from 'axios';

const BusinessSignUp = () => {
  const initialFormState = {
    username: '',
    email: '',
    phoneNumber: '',
    fullName: '',
    designation: '',
    crFile: null,
    description: '',
    location: '',
    website: '',
    instaId: '',
    agreeTerms: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [charCount, setCharCount] = useState(0);
  const charLimit = 500;

  const cities = [
    "Doha", "Al Wakrah", "Al Khor", "Al Rayyan", 
    "Al Shamal", "Al Shahaniya", "Al Daayen", 
    "Umm Salal", "Dukhan", "Mesaieed"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'description') {
      setCharCount(value.length);
    }

    if (files) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (charCount < 450 || charCount > charLimit) {
      setError('Description must be between 450 to 500 characters.');
      setSuccess('');
      return;
    }
  
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        if (key === 'crFile' && formData[key] instanceof File) {
          data.append(key, formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      }
    });
  
    try {
      const response = await axios.post('http://localhost:5000/api/users/signup', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 201) {
        setSuccess('Signed Up Successfully!');
        setError('');
        setFormData(initialFormState);
        setCharCount(0);
      } else {
        setError('An error occurred during signup. Please try again.');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error submitting form:', error.response ? error.response.data : error.message);
      setError('An error occurred. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className='s-form-body'>
      <form className="signup-form-bs" onSubmit={handleSubmit}>
        <h2>JOIN OUR PROVIDER LIST, IT'S FREE</h2>
        <p style={{fontSize:'smaller', marginBottom:'20px',marginLeft:'10px' }}>Please note that currently we are onboarding companies registered in Qatar</p>
        <label className='sign-in-label'>Academy Name (As per Company Registration)</label>
        <div className='side-by-side'>
          <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Academy Name" required />
        </div>

        <label className='sign-in-label'>Academy Bio</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex. You may include a brief introduction containing activities, classes you provide, age category etc.."
          rows="4"
          cols="50"
          style={{marginBottom:'0px'}}
          maxLength={charLimit}
          required
        />
        <p style={{fontSize:'smaller', marginBottom:'20px',marginLeft:'10px' , color:'darkblue'}}>{charCount}/{charLimit} characters</p>
        <div className='side-by-side'>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail ID" required />
          <div className="phone-number-container" style={{ position: 'relative', width: '100%' }}>
            <span className="country-code" style={{ position: 'absolute', left: '10px', top: '16px', transform: 'translateY(-50%)', fontSize: 'small', color: '#555' }}>
              +974
            </span>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone number"
              required
              style={{ paddingLeft: '50px' }}
            />
          </div>
        </div>
        <div className='side-by-side' style={{gap:'36%'}}>
        <label className='sign-in-label'>Website (Optional)</label>
        <label className='sign-in-label'>Instagram ID (Optional)</label>

        </div>

        <div className='side-by-side'>
        <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="Enter website link" />
        <input type="text" name="instaId" value={formData.instaId} onChange={handleChange} placeholder="Enter Instagram ID" />

        </div>

        <div className='side-by-side' style={{gap:'44%'}}>

        <label className='sign-in-label'>Location</label>
        <label className='sign-in-label' htmlFor="crFile">CR Doc</label>
        </div>

        <div className='side-by-side'>

        <select name="location" value={formData.location} onChange={handleChange} required>
          <option value="" disabled>Select your city</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <input type="file" name="crFile" onChange={handleChange} accept=".pdf" />

        </div>
        

        <div className='side-by-side' style={{marginTop:'20px',gap:'42%'}}>
        <label className='sign-in-label'>Full Name</label>
        <label className='sign-in-label'>Designation</label>
        </div>

        <div className='side-by-side'>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full name" required />
          <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Designation" required />
        </div>

        <div className="terms-container" style={{marginTop:'10px'}}>
          <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required />
          <label htmlFor="agreeTerms">I agree that all provided information is correct for administrators' verification.</label>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
          <div style={{display:'flex', flexDirection:'row',width:'100%', justifyContent:'flex-end'}}>
          <button type='submit'>Submit for Verification</button>

          </div>
      </form>
    </div>
  );
};

export default BusinessSignUp;
