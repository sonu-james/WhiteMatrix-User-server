const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // Include nodemailer
const User = require('../models/User'); // Adjust the path as necessary

const router = express.Router();

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service
  auth: {
    user: 'whitematrix2024@gmail.com', // Replace with your email
    pass: 'tkxj mgpk cewx crni', // Replace with your email password (use an app-specific password if 2FA is enabled)
  },
});

// Signup Route
router.post('/signup', upload.fields([
  { name: 'crFile', maxCount: 1 },
]), async (req, res) => {
  try {
    
    const {
      username,
      email,
      phoneNumber,
      fullName,
      designation,
      description,
      location,
      website,
      instaId,
      agreeTerms,
    } = req.body;

    // Validate description character length on the server-side
    if (description.length < 450 || description.length > 500) {
      return res.status(400).json({ message: 'Description must be between 450 to 500 characters.' });
    }

    const files = req.files;
    const fileBase64 = {};
  
    if (files) {
      if (files.crFile) fileBase64.crFile = files.crFile[0].buffer.toString('base64');
    }
    // Create new user document
    const newUser = new User({
      username,
      email,
      phoneNumber,
      fullName,
      designation,
      description,
      location,
      website: website || null, // Optional
      instaId: instaId || null, // Optional
      crFile: fileBase64.crFile,
      agreeTerms,
    });
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or phone number already exists.' });
    }
    await newUser.save();

    // Send welcome email to the user
    const userMailOptions = {
      from: 'whitematrix2024@gmail.com', // Sender address (your email)
      to: email, // Receiver's email (the email user provided)
      subject: 'Welcome to Our Provider List!',
      text: `Dear ${fullName},

Thank you for signing up as a provider on our platform! We're excited to have you onboard.

Below are your registration details:
- Academy Name:  ${username}
- Full Name:  ${fullName}
- Email:  ${email}
- Phone Number:  ${phoneNumber}
- Designation:  ${designation}
- Description:  ${description}
- Location:  ${location}
- Website:  ${website ? website : 'N/A'}
- Instagram ID:  ${instaId ? instaId : 'N/A'}
- CR File:  ${req.file ? req.file : 'No CR file uploaded'}

Your account is under verification.

Please feel free to contact us if you have any questions.
`,
    };

    // Send notification email to whitematrix2024@gmail.com
    const adminMailOptions = {
      from: 'riyademo23@gmail.com', // Sender address (your email)
      to: 'whitematrix2024@gmail.com', // Admin email
      subject: 'New Provider Registration Request Submitted',
      text: `A new provider has submitted a registration request.

Details:
- Academy Name:  ${username}
- Full Name:  ${fullName}
- Email:  ${email}
- Phone Number:  ${phoneNumber}
- Designation:  ${designation}
- Location:  ${location}

Please review the request.`,
    };

    // Send both emails simultaneously using Promise.all
    await Promise.all([
      transporter.sendMail(userMailOptions),  // Send email to the user
      transporter.sendMail(adminMailOptions), // Send notification to the admin
    ]);

    // Respond to the user after successful signup
    res.status(201).json({ message: 'Signed up successfully and emails sent!' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'An error occurred during signup.' });
  }
});

// Sign-In Route
router.post('/signin', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    // Find the user by email or phone number
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Email/phone is incorrect' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Successful sign-in
    res.status(200).json({ message: 'Sign-in successful', user });
  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search Route
router.get('/search', async (req, res) => {
  const { query } = req.query;

  try {
    // Find the user by email or phone number
    const user = await User.findOne({
      $or: [{ email: query }, { phoneNumber: query }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Send the user details
    res.status(200).json(user);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get all users
// New route to get all verified users
router.get('/all', async (req, res) => {
  try {
    // Fetch only verified users with the specified fields (username, logo)
    const users = await User.find({ verificationStatus: 'verified' }, 'username logo');
    console.log('Fetched Users:', users); // Debugging log
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message); // Debugging log for errors
    res.status(400).json({ message: error.message });
  }
});


// Route to get provider details by providerId
router.get('/:providerId', async (req, res) => {
  const { providerId } = req.params;

  try {
    // Fetch provider details using the providerId
    const provider = await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Respond with provider name and logo
    res.json({
      name: provider.name,
      logo: provider.logo,
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get provider details by providerId
router.get('/provider/:providerId', async (req, res) => {
  const { providerId } = req.params;

  try {
    // Fetch provider details using the providerId
    const provider = await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Respond with all provider details
    res.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
