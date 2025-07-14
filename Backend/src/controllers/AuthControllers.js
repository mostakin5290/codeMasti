const User = require('../models/user');
const OTP = require('../models/OTP')
const validUser = require('../utils/userValidator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis')
const { oauth2client } = require('../utils/googleConfig');
const { github } = require('../utils/githubConfig')
const axios = require('axios');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const otpGenerator = require('otp-generator')
const validator = require('validator');
const nodemailer = require('nodemailer');


const register = async (req, res) => {
    try {
        // Validate request body
        try {
            validUser(req.body);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message  // Changed from error.details[0].message
            });
        }

        const { emailId, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            role: 'user'
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                _id: newUser._id,
                emailId: newUser.emailId,
                role: newUser.role
            },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        // Set secure HTTP-only cookie
        res.cookie('token', token, {
            maxAge: 3600 * 1000,   // 1 hour
            httpOnly: true,
            secure: true,          // ✅ Must be true for SameSite=None
            sameSite: 'None',
            path: '/'              // ✅ Good practice
        });

        // Omit sensitive data from response
        const userResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            emailId: newUser.emailId,
            role: newUser.role
        };

        res.status(201).json({
            success: true,
            user: userResponse,
            message: "Registration successful"
        });

    } catch (err) {
        console.error('Registration error:', err);

        // Handle duplicate key errors (MongoDB)
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        res.status(500).json({
            success: false,
            message: "An error occurred during registration"
        });
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        // Validate input
        if (!emailId || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Check if user exists
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                _id: user._id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
        });

        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            role: user.role
            // Add other non-sensitive fields as needed
        };

        res.status(200).json({
            success: true,
            user: userResponse,
            message: "Login successful"
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: "An error occurred during login"
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required."
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match."
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long."
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Current password is incorrect." });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password."
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Optionally, re-issue a new token or clear existing ones.
        // For simplicity, we'll just send success.
        // The token already has a maxAge so it will expire naturally.

        res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });

    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({
            success: false,
            message: "An error occurred while changing password."
        });
    }
};

const sendOTP = async (req, res) => {
    try {
        const { emailId, password, firstName, lastName } = req.body;

        // Input validation
        if (!emailId || !password || !firstName) {
            return res.status(400).json({
                success: false,
                message: "First name, email, and password are required."
            });
        }

        if (!validator.isEmail(emailId)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        // Delete any existing OTP for this email
        await OTP.deleteOne({ emailId });

        // Generate OTP
        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        // Hash password and OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Store temporary data with OTP
        await OTP.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            otp: hashedOTP
        });

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_EMAIL_PASSWORD
            }
        });

        // Email options
        const mailOptions = {
            from: `"CodeCrack" <${process.env.SENDER_EMAIL}>`,
            to: emailId,
            subject: 'CodeCrack - Your Verification Code',
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CodeCrack Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
                <div style="
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    box-shadow: 
                        0 25px 50px rgba(0, 0, 0, 0.25),
                        0 0 0 1px rgba(255, 255, 255, 0.2);
                    max-width: 500px;
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                ">
                    <!-- Header with 3D effect -->
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    ">
                        <!-- Background geometric shapes -->
                        <div style="
                            position: absolute;
                            top: -50px;
                            right: -50px;
                            width: 100px;
                            height: 100px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 50%;
                            transform: rotate(45deg);
                        "></div>
                        <div style="
                            position: absolute;
                            bottom: -30px;
                            left: -30px;
                            width: 60px;
                            height: 60px;
                            background: rgba(255, 255, 255, 0.1);
                            transform: rotate(45deg);
                        "></div>
                        
                        <!-- Logo/Brand -->
                        <div style="
                            background: rgba(255, 255, 255, 0.2);
                            width: 80px;
                            height: 80px;
                            border-radius: 20px;
                            margin: 0 auto 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 
                                0 10px 30px rgba(0, 0, 0, 0.2),
                                inset 0 1px 0 rgba(255, 255, 255, 0.3);
                            position: relative;
                        ">
                            <span style="
                                color: white;
                                font-size: 24px;
                                font-weight: bold;
                                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                            ">&lt;/&gt;</span>
                        </div>
                        
                        <h1 style="
                            color: white;
                            margin: 0;
                            font-size: 32px;
                            font-weight: 700;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                            letter-spacing: -0.5px;
                        ">CodeCrack</h1>
                        <p style="
                            color: rgba(255, 255, 255, 0.9);
                            margin: 8px 0 0;
                            font-size: 16px;
                            font-weight: 300;
                        ">Verification Required</p>
                    </div>
                    
                    <!-- Main content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="
                            color: #2d3748;
                            margin: 0 0 20px;
                            font-size: 24px;
                            font-weight: 600;
                            text-align: center;
                        ">Verify Your Account</h2>
                        
                        <p style="
                            color: #4a5568;
                            font-size: 16px;
                            line-height: 1.6;
                            margin: 0 0 30px;
                            text-align: center;
                        ">
                            Welcome to CodeCrack! Please use the verification code below to complete your registration:
                        </p>
                        
                        <!-- 3D OTP Container -->
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="
                                background: linear-gradient(145deg, #f7fafc, #edf2f7);
                                border: 2px solid #e2e8f0;
                                border-radius: 16px;
                                padding: 25px 20px;
                                display: inline-block;
                                position: relative;
                                box-shadow: 
                                    0 10px 25px rgba(0, 0, 0, 0.1),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.8),
                                    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
                                transform: perspective(1000px) rotateX(5deg);
                            ">
                                <div style="
                                    background: linear-gradient(135deg, #667eea, #764ba2);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                    font-size: 36px;
                                    font-weight: 800;
                                    letter-spacing: 8px;
                                    font-family: 'Courier New', monospace;
                                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                                    margin: 0;
                                    line-height: 1;
                                ">${otp}</div>
                            </div>
                        </div>
                        
                        <!-- Warning message -->
                        <div style="
                            background: linear-gradient(135deg, #fed7d7, #feb2b2);
                            border: 1px solid #fc8181;
                            border-radius: 12px;
                            padding: 16px;
                            margin: 25px 0;
                            position: relative;
                            box-shadow: 0 4px 12px rgba(252, 129, 129, 0.2);
                        ">
                            <div style="
                                position: absolute;
                                top: -6px;
                                left: 20px;
                                background: #fc8181;
                                color: white;
                                padding: 4px 12px;
                                border-radius: 12px;
                                font-size: 12px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            ">Important</div>
                            <p style="
                                color: #742a2a;
                                font-size: 14px;
                                margin: 8px 0 0;
                                font-weight: 500;
                            ">
                                ⏰ This verification code expires in <strong>5 minutes</strong>
                            </p>
                        </div>
                        
                        <!-- Instructions -->
                        <div style="
                            background: linear-gradient(135deg, #e6fffa, #b2f5ea);
                            border: 1px solid #4fd1c7;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 20px 0;
                            box-shadow: 0 4px 12px rgba(79, 209, 199, 0.2);
                        ">
                            <h3 style="
                                color: #234e52;
                                font-size: 16px;
                                margin: 0 0 12px;
                                font-weight: 600;
                            ">📋 Next Steps:</h3>
                            <ol style="
                                color: #2d5a60;
                                font-size: 14px;
                                margin: 0;
                                padding-left: 20px;
                                line-height: 1.6;
                            ">
                                <li>Return to the CodeCrack verification page</li>
                                <li>Enter the 6-digit code above</li>
                                <li>Complete your account setup</li>
                            </ol>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="
                        background: linear-gradient(135deg, #f7fafc, #edf2f7);
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    ">
                        <p style="
                            color: #718096;
                            font-size: 13px;
                            margin: 0 0 10px;
                            line-height: 1.5;
                        ">
                            Didn't request this code? Please ignore this email or contact our support team.
                        </p>
                        <div style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            font-size: 14px;
                            font-weight: 700;
                            margin: 0;
                        ">
                            © 2025 CodeCrack. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please verify to complete registration.'
        });

    } catch (error) {
        console.error('Send OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { emailId, otp } = req.body;

        // Input validation
        if (!emailId || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required."
            });
        }

        if (!validator.isEmail(emailId)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({ emailId });
        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                message: "OTP expired or not found. Please request a new OTP."
            });
        }

        // Check if OTP is expired (5 minutes)
        const currentTime = new Date();
        const otpTime = new Date(otpRecord.createdAt);
        const timeDifference = (currentTime - otpTime) / (1000 * 60); // in minutes

        if (timeDifference > 5) {
            // Delete expired OTP
            await OTP.deleteOne({ emailId });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // Verify OTP
        const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // Check if user already exists (additional safety check)
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            // Clean up OTP record
            await OTP.deleteOne({ emailId });
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        // Create new user with data from OTP record
        const newUser = await User.create({
            firstName: otpRecord.firstName,
            lastName: otpRecord.lastName,
            emailId: otpRecord.emailId,
            password: otpRecord.password, // Already hashed
            role: 'user'
        });

        // Clean up OTP record after successful registration
        await OTP.deleteOne({ emailId });

        // Generate JWT token
        const token = jwt.sign(
            {
                _id: newUser._id,
                emailId: newUser.emailId,
                role: newUser.role
            },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        // Set secure HTTP-only cookie
        res.cookie('token', token, {
            maxAge: 3600 * 1000, // 1 hour
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
        });

        // Omit sensitive data from response
        const userResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            emailId: newUser.emailId,
            role: newUser.role
        };

        res.status(201).json({
            success: true,
            user: userResponse,
            message: "Registration successful! Welcome to our platform."
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);

        // Handle duplicate key errors (MongoDB)
        if (error.code === 11000) {
            // Clean up OTP record
            await OTP.deleteOne({ emailId: req.body.emailId }).catch(console.error);
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        res.status(500).json({
            success: false,
            message: "An error occurred during verification. Please try again."
        });
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        // Check if token exists
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "No authentication token found"
            });
        }

        // Verify and decode token
        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            // If token is invalid, still clear the cookie
            res.clearCookie('token');
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        // Add token to Redis blocklist with TTL
        try {
            await redisClient.setEx(
                `token:${token}`,
                Math.max(0, payload.exp - Math.floor(Date.now() / 1000)),
                'blocked'
            );
        } catch (redisErr) {
            console.error('Redis error:', redisErr);
            // Even if Redis fails, we should still clear the cookie
        }

        // Clear the cookie with secure options
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (err) {
        console.error('Logout error:', err);

        // Ensure cookie is cleared even if error occurs
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(500).json({
            success: false,
            message: "An error occurred during logout"
        });
    }
};

const adminRegister = async (req, res) => {
    try {
        validUser(req.body);

        const { emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'admin';

        const newAdmin = await User.create(req.body);

        const token = jwt.sign({ _id: newAdmin._id, emailId: emailId, role: 'admin' }, process.env.JWT_KEY, { expiresIn: '1h' })

        res.cookie('token', token, { maxAge: 3600 * 1000 })

        res.status(201).send("Admin registered successfully");
    } catch (err) {
        res.status(400).send(`Error:${err}`);
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: user
        });

    } catch (err) {
        console.error('Get Profile Error:', err);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the profile"
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            firstName,
            lastName,
            age,
            headline,
            bio,
            location,
            avatar,
            socialLinks,
            preferences,
            newPassword,
            currentPassword
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (age) updateFields.age = age;
        if (headline) updateFields.headline = headline;
        if (bio) updateFields.bio = bio;
        if (location) updateFields.location = location;
        if (avatar) updateFields.avatar = avatar;

        if (socialLinks) {
            updateFields.socialLinks = { ...user.socialLinks, ...socialLinks };
        }
        if (preferences) {
            updateFields.preferences = { ...user.preferences, ...preferences };
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to set a new one." });
            }
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: "Invalid current password." });
            }
            updateFields.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true } // runValidators ensures min/max length etc. are checked
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the profile"
        });
    }
};

const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required to confirm account deletion."
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password. Account not deleted." });
        }

        await User.findByIdAndDelete(userId);

        res.clearCookie('token');

        res.status(200).json({
            success: true,
            message: "Your account has been successfully deleted."
        });

    } catch (err) {
        console.error('Delete Account Error:', err);
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the account."
        });
    }
};

const getFullUserProfile = async (req, res) => {
    try {

        const { userId } = req.params; // We'll get the ID from the route parameter

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // --- Fetch Submission Data for the Heatmap and Recent Activity ---
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const submissions = await User.find({
            userId: userId,
            createdAt: { $gte: oneYearAgo }
        })
            .populate('problemId', 'title difficulty') // Populate with problem details
            .sort({ createdAt: -1 }) // Get newest first
            .select('problemId status createdAt'); // Select only the necessary fields

        // --- Combine and send the data ---
        res.status(200).json({
            success: true,
            profile: user,
            submissions: submissions,
        });

    } catch (err) {
        console.error('Get Full Profile Error:', err);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the profile data"
        });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ success: false, message: "Google auth code is missing." });
        }
        const { tokens } = await oauth2client.getToken(code);
        oauth2client.setCredentials(tokens);
        const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
        const { email, given_name: firstName, family_name: lastName, picture: avatar } = userResponse.data;
        let existingUser = await User.findOne({ emailId: email });
        if (!existingUser) {
            existingUser = await User.create({
                emailId: email,
                firstName,
                lastName: lastName || '',
                password: await bcrypt.hash(email + process.env.JWT_KEY, 10),
                role: 'user',
                avatar: avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=default'
            });
        }
        const token = jwt.sign(
            {
                _id: existingUser._id,
                emailId: existingUser.emailId,
                role: existingUser.role
            },
            process.env.JWT_KEY,
            { expiresIn: '7d' }
        );
        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
        });
        const userData = {
            _id: existingUser._id,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            emailId: existingUser.emailId,
            role: existingUser.role,
            avatar: existingUser.avatar
        };

        res.status(200).json({
            success: true,
            user: userData,
            message: "Google login successful"
        });

    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ success: false, message: "Google login failed. Please try again." });
    }
}

const initiateGithubLogin = (req, res) => {
    try {
        // Validate environment variables
        if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_REDIRECT_URI) {
            throw new Error("GitHub OAuth configuration is missing");
        }

        // Generate a random state for security
        const state = Math.random().toString(36).substring(7);

        // Store state in Redis (optional but recommended)
        redisClient.setEx(`github:state:${state}`, 600, 'valid'); // 10 minute expiry

        // Construct the GitHub OAuth URL
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI)}&scope=user:email&state=${state}`;

        res.status(200).json({
            success: true,
            url: authUrl
        });
    } catch (error) {
        console.error('GitHub login initiation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to initiate GitHub login"
        });
    }
};

const handleGithubCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Authorization code not found"
            });
        }

        // Optional: Verify state parameter if you're using it
        if (state) {
            try {
                const isValidState = await redisClient.get(`github:state:${state}`);
                if (!isValidState) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid state parameter"
                    });
                }
                // Delete the state to prevent reuse
                await redisClient.del(`github:state:${state}`);
            } catch (redisErr) {
                console.error('Redis state verification error:', redisErr);
                // Continue anyway if Redis is down
            }
        }



        // 1. Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: process.env.GITHUB_REDIRECT_URI
            },
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );


        // 2. Check for errors in token response
        if (tokenResponse.data.error) {
            return res.status(400).json({
                success: false,
                message: tokenResponse.data.error_description || "GitHub authentication failed"
            });
        }

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            return res.status(400).json({
                success: false,
                message: "Failed to get GitHub access token"
            });
        }

        // 3. Get user data from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: 'application/json'
            }
        });

        // 4. Get user emails (needed because primary email might be private)
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: 'application/json'
            }
        });

        const primaryEmail = emailsResponse.data.find(e => e.primary) || emailsResponse.data[0];

        if (!primaryEmail) {
            return res.status(400).json({
                success: false,
                message: "No email found in GitHub account"
            });
        }

        // 5. Create or update user in your database
        let user = await User.findOne({
            $or: [
                { emailId: primaryEmail.email },
                { githubId: userResponse.data.id.toString() }
            ]
        });

        if (!user) {
            // Create new user
            user = await User.create({
                firstName: userResponse.data.name?.split(' ')[0] || userResponse.data.login,
                lastName: userResponse.data.name?.split(' ').slice(1).join(' ') || '',
                emailId: primaryEmail.email,
                avatar: userResponse.data.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=default',
                githubId: userResponse.data.id.toString(),
                role: 'user',
                isVerified: true,
                provider: 'github',
                // Generate a random password for GitHub users (they won't use it)
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });
        } else {
            // Update existing user with GitHub info if needed
            if (!user.githubId) {
                user.githubId = userResponse.data.id.toString();
                user.provider = user.provider || 'github';
                if (!user.avatar) {
                    user.avatar = userResponse.data.avatar_url;
                }
                await user.save();
            }
        }

        // 6. Generate JWT token
        const token = jwt.sign(
            {
                _id: user._id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            { expiresIn: '7d' }
        );

        // 7. Set cookie and return response
        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
        });

        // For development, you might want to redirect to frontend
        if (process.env.NODE_ENV === 'development') {
            return res.redirect(`${process.env.FRONTEND_URL}/github/success?token=${token}`);
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                avatar: user.avatar,
                role: user.role,
                provider: user.provider
            }
        });

    } catch (error) {
        console.error('GitHub OAuth error:', error.response?.data || error.message);

        // If it's a development environment, redirect with error
        if (process.env.NODE_ENV === 'development') {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_auth_failed`);
        }

        res.status(500).json({
            success: false,
            message: "GitHub authentication failed",
            error: error.message
        });
    }
};

const getAllUsersForAdmin = async (req, res) => {
    try {
        const { search, filter } = req.query;
        const query = {};

        // Search functionality
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { emailId: searchRegex }
            ];
        }

        // Filter functionality
        if (filter === 'premium') {
            query.isPremium = true;
        } else if (filter === 'normal') {
            query.isPremium = false;
        } else if (filter === 'admin') {
            query.role = 'admin';
        } else if (filter === 'user') { // Renamed from 'normal_user' for clarity
            query.role = 'user';
        }

        const users = await User.find(query)
            .select('-password') // Exclude password from the result
            .sort({ createdAt: -1 }); // Latest users first

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users.'
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body; // New role: 'user' or 'admin'

        // Basic validation for role
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role provided. Must be "user" or "admin".'
            });
        }

        // Prevent an admin from changing their own role (optional but recommended)
        if (req.user._id.toString() === userId) {
            return res.status(403).json({
                success: false,
                message: 'You cannot change your own role.'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.role = role;
        await user.save();
        const updatedUserResponse = user.toObject(); // Convert Mongoose document to plain JS object
        delete updatedUserResponse.password; // Remove password field

        res.status(200).json({
            success: true,
            message: `User role updated to ${role} successfully.`,
            user: updatedUserResponse // Return updated user without password
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user role.'
        });
    }
};

const toggleUserPremiumStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isPremium } = req.body; // boolean: true to make premium, false to revoke

        // Validate boolean
        if (typeof isPremium !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Invalid premium status provided. Must be true or false.'
            });
        }

        // Prevent an admin from changing their own premium status (optional but recommended for consistency)
        if (req.user._id.toString() === userId) {
            return res.status(403).json({
                success: false,
                message: 'You cannot change your own premium status through this route.'
            });
        }


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.isPremium = isPremium;
        // Optionally, you might want to manage the `activeSubscription` field here
        // e.g., if setting to premium, create a dummy subscription or link an existing one.
        // For simplicity, we'll just toggle `isPremium`.
        await user.save();
        const updatedUserResponse = user.toObject(); // Convert Mongoose document to plain JS object
        delete updatedUserResponse.password;

        res.status(200).json({
            success: true,
            message: `User premium status updated to ${isPremium} successfully.`,
            user: updatedUserResponse
        });

    } catch (error) {
        console.error('Error toggling user premium status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling user premium status.'
        });
    }
};

const adminDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (req.user._id.toString() === userId) {
            return res.status(403).json({
                success: false,
                message: 'Admins cannot delete their own account using this route.'
            });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // IMPORTANT: In a real application, when a user is deleted, you should
        // also clean up all associated data (their posts, comments, submissions, etc.)
        // This would involve finding all documents referencing this user's ID and deleting them.
        // For example:
        // await DiscussionPost.deleteMany({ author: userId });
        // await ProblemSubmission.deleteMany({ user: userId });
        // ... and so on for any other models that reference the User model.
        // This is crucial for data integrity but beyond the scope of this request.

        res.status(200).json({
            success: true,
            message: 'User deleted successfully.'
        });

    } catch (error) {
        console.error('Error deleting user by admin:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user.'
        });
    }
};



module.exports = {
    register,
    sendOTP,
    verifyOTP,
    login,
    logout,
    adminRegister,
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    getFullUserProfile,
    googleLogin,
    initiateGithubLogin,
    handleGithubCallback,
    changePassword,
    getAllUsersForAdmin,
    updateUserRole,
    toggleUserPremiumStatus,
    adminDeleteUser
};