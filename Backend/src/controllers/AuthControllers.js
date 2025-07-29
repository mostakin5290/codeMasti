const mongoose = require('mongoose');
const User = require('../models/user');
const OTP = require('../models/OTP')
const validUser = require('../utils/userValidator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis')
const { oauth2client } = require('../utils/googleConfig');
const { github } = require('../utils/githubConfig')
const axios = require('axios');
const otpGenerator = require('otp-generator')
const validator = require('validator');
const nodemailer = require('nodemailer');
const Subscription = require('../models/subscription')
const sendEmail = require('../utils/emailSender')
const { forgotPasswordEmailTemplate, RegisterEmailTemplate, PremiumGiftEmailTemplate } = require('../utils/emailTemplates');


const register = async (req, res) => {
    try {
        try {
            validUser(req.body);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message 
            });
        }

        const { emailId, password, firstName, lastName } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            role: 'user'
        });

        const token = jwt.sign(
            {
                _id: newUser._id,
                emailId: newUser.emailId,
                role: newUser.role
            },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            maxAge: 3600 * 1000,  
            httpOnly: true,
            secure: true,        
            sameSite: 'None',
            path: '/'             
        });

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

        if (!emailId || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

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

        await OTP.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            otp: hashedOTP
        });


        const emailSubject = `${process.env.APP_NAME} - Your Verification Code`;
        const emailHtmlContent = RegisterEmailTemplate(otp);

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

        const mailOptions = {
            from: `"${process.env.APP_NAME}" <${process.env.SENDER_EMAIL}>`,
            to: emailId,
            subject: emailSubject,
            html: emailHtmlContent
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

        // Check if user already exists
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
            password: otpRecord.password,
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

        res.cookie('token', token, {
            maxAge: 3600 * 1000, 
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
        });

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

        // Handle duplicxate key errors 
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


const forgotPassword = async (req, res) => {
    try {
        const { emailId } = req.body;
        // Input validation
        if (!emailId) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        if (!validator.isEmail(emailId)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ emailId });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found. Please register first."
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

        // Store OTP (hashed) and user's email for verification
        const hashedOTP = await bcrypt.hash(otp, 10);

        await OTP.create({
            emailId,
            otp: hashedOTP,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            password: existingUser.password
        });

        // Send email with OTP
        const emailSubject = `${process.env.APP_NAME} - Password Reset Request`;
        const emailHtmlContent = forgotPasswordEmailTemplate(process.env.APP_NAME, process.env.APP_LOGO_URL, otp);

        // Configure nodemailer transporter (same as in sendOTP)
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
            from: `"${process.env.APP_NAME}" <${process.env.SENDER_EMAIL}>`,
            to: emailId,
            subject: emailSubject,
            html: emailHtmlContent
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'A password reset OTP has been sent to your email.'
        });

    } catch (error) {
        console.error('Forgot Password Send OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send password reset OTP. Please try again.'
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { emailId, otp, newPassword, confirmNewPassword } = req.body;

        if (!emailId || !otp || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: email, OTP, new password, and confirmation."
            });
        }

        if (!validator.isEmail(emailId)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        if (newPassword !== confirmNewPassword) {
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

        const otpRecord = await OTP.findOne({ emailId });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found. Please request a new password reset."
            });
        }

        const currentTime = new Date();
        const otpTime = new Date(otpRecord.createdAt);
        const timeDifference = (currentTime - otpTime) / (1000 * 60); // in minutes

        if (timeDifference > 5) {
            await OTP.deleteOne({ emailId }); 
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new password reset."
            });
        }

        const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        const user = await User.findOne({ emailId });
        if (!user) {
            await OTP.deleteOne({ emailId });
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        await OTP.deleteOne({ emailId });

        const token = jwt.sign(
            {
                _id: user._id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            maxAge: 3600 * 1000,
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
        };

        return res.status(200).json({
            success: true,
            user: userResponse,
            message: "Password reset successfully. You are now logged in."
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during password reset. Please try again."
        });
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "No authentication token found"
            });
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            res.clearCookie('token');
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        try {
            await redisClient.setEx(
                `token:${token}`,
                Math.max(0, payload.exp - Math.floor(Date.now() / 1000)),
                'blocked'
            );
        } catch (redisErr) {
            console.error('Redis error:', redisErr);
        }

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

        const { emailId, password, firstName, lastName, role } = req.body;

        if (!role || !['admin', 'co-admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified. Must be 'admin' or 'co-admin'."
            });
        }

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered for another user."
            });
        }

        if (role === 'admin') {
            const currentAdminCount = await User.countDocuments({ role: 'admin' });
            if (currentAdminCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: "An 'admin' account already exists. Only one 'admin' is allowed. Consider creating a 'co-admin' instead."
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = await User.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            role: role 
        });

        const userResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            emailId: newUser.emailId,
            role: newUser.role
        };

        res.status(201).json({
            success: true,
            message: `${newUser.role} account created successfully.`,
            user: userResponse
        });

    } catch (err) {
        console.error('Admin Registration error:', err);
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }
        res.status(500).json({
            success: false,
            message: `An error occurred during ${req.body.role || 'admin'} account creation.`
        });
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
            avatarPublicId, 
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
        if (firstName !== undefined) updateFields.firstName = firstName;
        if (lastName !== undefined) updateFields.lastName = lastName;
        if (age !== undefined) updateFields.age = age;
        if (headline !== undefined) updateFields.headline = headline;
        if (bio !== undefined) updateFields.bio = bio;
        if (location !== undefined) updateFields.location = location;

        // Handle avatar and avatarPublicId updates
        if (avatar !== undefined) {
            updateFields.avatar = avatar;
            // If avatar is explicitly set to empty string, clear publicId
            if (avatar === '') {
                updateFields.avatarPublicId = null; // Clear the public ID when avatar is empty
            } else if (avatarPublicId !== undefined) {
                // If a new avatar URL is provided, update its publicId as well
                updateFields.avatarPublicId = avatarPublicId;
            }
            // Note: If avatar is provided but avatarPublicId is NOT, it means the avatar is
            // likely an external URL (e.g., social media default) or wasn't uploaded via Cloudinary.
            // In this case, we leave avatarPublicId as it is (or null if it was previously set and not updated).
            // This is handled by not including avatarPublicId in updateFields unless it's explicitly provided.
        }

        if (socialLinks !== undefined) {
            // Merge existing social links with new ones
            updateFields.socialLinks = { ...user.socialLinks, ...socialLinks };
        }
        if (preferences !== undefined) {
            // Merge existing preferences with new ones
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
            if (currentPassword === newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be different from current password."
                });
            }
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save(); // Save user object to persist password change
            // Password is handled separately; no need to put it in updateFields for findByIdAndUpdate
        }

        // Use findByIdAndUpdate for other profile fields
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from the response

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

        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const submissions = await User.find({
            userId: userId,
            createdAt: { $gte: oneYearAgo }
        })
            .populate('problemId', 'title difficulty')
            .sort({ createdAt: -1 })
            .select('problemId status createdAt');

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
        if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_REDIRECT_URI) {
            throw new Error("GitHub OAuth configuration is missing");
        }
        const state = Math.random().toString(36).substring(7);

        redisClient.setEx(`github:state:${state}`, 600, 'valid'); // 10 minute expiry

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

        if (state) {
            try {
                const isValidState = await redisClient.get(`github:state:${state}`);
                if (!isValidState) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid state parameter"
                    });
                }
                await redisClient.del(`github:state:${state}`);
            } catch (redisErr) {
                console.error('Redis state verification error:', redisErr);
            }
        }

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

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: 'application/json'
            }
        });

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

        let user = await User.findOne({
            $or: [
                { emailId: primaryEmail.email },
                { githubId: userResponse.data.id.toString() }
            ]
        });

        if (!user) {
            user = await User.create({
                firstName: userResponse.data.name?.split(' ')[0] || userResponse.data.login,
                lastName: userResponse.data.name?.split(' ').slice(1).join(' ') || '',
                emailId: primaryEmail.email,
                avatar: userResponse.data.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=default',
                githubId: userResponse.data.id.toString(),
                role: 'user',
                isVerified: true,
                provider: 'github',
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });
        } else {
            if (!user.githubId) {
                user.githubId = userResponse.data.id.toString();
                user.provider = user.provider || 'github';
                if (!user.avatar) {
                    user.avatar = userResponse.data.avatar_url;
                }
                await user.save();
            }
        }

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

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { emailId: searchRegex }
            ];
        }

        if (filter === 'premium') {
            query.isPremium = true;
        } else if (filter === 'normal') {
            query.isPremium = false;
        } else if (filter === 'admin') {
            query.role = 'admin';
        } else if (filter === 'co-admin') {
            query.role = 'co-admin';
        } else if (filter === 'user') {
            query.role = 'user';
        } else if (filter === 'all_admins') {
            query.role = { $in: ['admin', 'co-admin'] };
        }
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

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
        const { role: newRole } = req.body;
        const performingUser = req.user;
        if (!newRole || !['user', 'admin', 'co-admin'].includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role provided. Must be "user" or "admin".'
            });
        }

        if (performingUser._id.toString() === userId) {
            return res.status(403).json({
                success: false,
                message: 'You cannot change your own role directly using this route. If you want to transfer the admin role, promote another user to admin.'
            });
        }

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (userToUpdate.role === 'admin' && performingUser.role === 'co-admin') {
            return res.status(403).json({
                success: false,
                message: 'Co-administrators are not authorized to demote admin accounts.'
            });
        }

        if (newRole === 'admin' && performingUser.role === 'co-admin') {
            return res.status(403).json({
                success: false,
                message: 'Co-administrators are not authorized to promote users to admin.'
            });
        }

        if (newRole === 'admin' && performingUser.role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });

            if (existingAdmin && existingAdmin._id.toString() !== userToUpdate._id.toString()) {
                existingAdmin.role = 'user'; 
                await existingAdmin.save();
            }
        }

        userToUpdate.role = newRole;
        await userToUpdate.save();
        const updatedUserResponse = userToUpdate.toObject();
        delete updatedUserResponse.password; 

        res.status(200).json({
            success: true,
            message: `User role updated to ${newRole} successfully.`,
            user: updatedUserResponse 
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user role.'
        });
    }
};

const adminDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const performingUser = req.user;

        if (performingUser._id.toString() === userId) {
            return res.status(403).json({
                success: false,
                message: 'You cannot delete your own account using this administrative route.'
            });
        }

        const userToDelete = await User.findById(userId);

        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (userToDelete.role === 'admin' && performingUser.role === 'co-admin') {
            return res.status(403).json({
                success: false,
                message: 'Co-administrators are not authorized to delete admin accounts.'
            });
        }

        if (userToDelete.role === 'admin' && performingUser.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'The primary admin account cannot be deleted via this route. Please reassign the admin role first if needed.'
            });
        }

        await User.findByIdAndDelete(userId);

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


const toggleUserPremiumStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isPremium, duration, customMonths } = req.body;

        if (typeof isPremium !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Invalid premium status provided. Must be true or false.'
            });
        }

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

        if (isPremium) {
            if (!duration) {
                return res.status(400).json({
                    success: false,
                    message: 'Duration is required to grant premium.'
                });
            }

            let endDate = new Date();
            let planType;
            let durationString = ''; 
            const startDate = new Date();

            if (duration === '1month') {
                endDate.setMonth(endDate.getMonth() + 1);
                planType = 'monthly';
                durationString = '1 Month';
            } else if (duration === '2month') {
                endDate.setMonth(endDate.getMonth() + 2);
                planType = 'custom_duration';
                durationString = '2 Months';
            } else if (duration === '3month') {
                endDate.setMonth(endDate.getMonth() + 3);
                planType = 'custom_duration';
                durationString = '3 Months';
            } else if (duration === '1year') {
                endDate.setFullYear(endDate.getFullYear() + 1);
                planType = 'yearly';
                durationString = '1 Year';
            } else if (duration === 'custom') {
                const monthsToAdd = parseInt(customMonths, 10);
                if (isNaN(monthsToAdd) || monthsToAdd <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Valid positive custom months are required for custom duration.'
                    });
                }
                endDate.setMonth(endDate.getMonth() + monthsToAdd);
                planType = 'custom_duration';
                durationString = `${monthsToAdd} Months`;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid premium duration specified.'
                });
            }

            const newSubscription = new Subscription({
                userId: user._id,
                plan: planType,
                amount: 0, 
                currency: 'N/A', 
                startDate: startDate,
                endDate: endDate,
                status: 'active',
                source: 'admin_grant',
            });
            await newSubscription.save();

            user.isPremium = true;
            user.activeSubscription = newSubscription._id;
            await user.save(); // Save user after updating subscription reference

            // Send success email for granted premium
            if (user.emailId) {
                const subject = `🥳 Congratulations! You've Received CodeMasti Premium!`;
                const htmlContent = PremiumGiftEmailTemplate({
                    status: "Premium Granted",
                    user,
                    planType,
                    newSubscription,
                    durationString
                });
                await sendEmail(user.emailId, subject, htmlContent);
            }

        } else { // Revoking premium status
            const wasPremium = user.isPremium; // Check if they were actually premium before revoking

            user.isPremium = false;
            let revokedSubscriptionDetails = null; // To store details for the email

            if (user.activeSubscription) {
                const activeSub = await Subscription.findById(user.activeSubscription);
                if (activeSub) {
                    revokedSubscriptionDetails = {
                        plan: activeSub.plan,
                        source: activeSub.source,
                        startDate: activeSub.startDate,
                        endDate: activeSub.endDate,
                        reason: (activeSub.source === 'admin_grant' ? 'Administratively revoked' : 'Cancelled by administrator')
                    };

                    if (activeSub.source === 'admin_grant') {
                        // If it was an admin grant, delete it completely
                        await Subscription.findByIdAndDelete(activeSub._id);
                    } else {
                        // If it was a paid subscription (e.g., Razorpay), just mark it cancelled
                        activeSub.status = 'cancelled';
                        activeSub.endDate = new Date(); // Set end date to now for immediate revocation
                        await activeSub.save();
                    }
                }
            }
            user.activeSubscription = null; // Always clear the reference
            await user.save(); // Save user after updating subscription reference

            // Send revocation email only if they were premium before this action
            if (wasPremium && user.emailId) {
                const subject = `Changes to Your CodeMasti Premium Status`;
                const htmlContent = PremiumGiftEmailTemplate({
                    status: "Premium Revoked",
                    user,
                    revokedSubscriptionDetails
                });
                await sendEmail(user.emailId, subject, htmlContent);
            }
        }

        const updatedUserResponse = user.toObject();
        delete updatedUserResponse.password;

        res.status(200).json({
            success: true,
            message: `User premium status updated to ${isPremium ? 'Premium' : 'Normal'} successfully.`,
            user: updatedUserResponse
        });

    }
    catch (error) {
        console.error('Error toggling user premium status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling user premium status.'
        });
    }
};


const getUserRank = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format." });
        }

        const ranks = await User.aggregate([
            {
                $project: {
                    _id: 1,
                    problemsSolvedCount: { $size: { $ifNull: ["$problemsSolved", []] } }
                }
            },
            {
                $setWindowFields: {
                    sortBy: { problemsSolvedCount: -1 },
                    output: {
                        rank: {
                            $denseRank: {}
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    problemsSolvedCount: 1,
                    rank: 1
                }
            }
        ]);

        const currentUserRankInfo = ranks.find(rankDoc => rankDoc._id.toString() === userId);

        if (!currentUserRankInfo) {
            const userExists = await User.findById(userId);
            if (!userExists) {
                return res.status(404).json({ success: false, message: "User not found." });
            } else {
                const totalUsersCount = await User.countDocuments({});
                return res.status(200).json({
                    success: true,
                    rank: totalUsersCount > 0 ? totalUsersCount : "N/A",
                    problemsSolvedCount: 0,
                    totalUsers: totalUsersCount
                });
            }
        }

        const totalUsers = await User.countDocuments({});

        res.status(200).json({
            success: true,
            rank: currentUserRankInfo.rank,
            problemsSolvedCount: currentUserRankInfo.problemsSolvedCount,
            totalUsers: totalUsers
        });

    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user rank.'
        });
    }
};


const getTotalRank = async (req, res) => {
    try {
        const allUsersRanked = await User.aggregate([
            {
                $project: {
                    _id: 1,
                    firstName: 1, 
                    lastName: 1,  
                    emailId: 1,   
                    avatar: 1,    
                    problemsSolvedCount: { $size: { $ifNull: ["$problemsSolved", []] } }
                }
            },
            {
                $sort: { problemsSolvedCount: -1 }
            },
            {
                $setWindowFields: {
                    sortBy: { problemsSolvedCount: -1 }, 
                    output: {
                        rank: {
                            $denseRank: {}
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    avatar: 1,
                    problemsSolvedCount: 1,
                    rank: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            ranks: allUsersRanked,
            totalUsers: allUsersRanked.length 
        });

    } catch (error) {
        console.error('Error fetching total ranks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching total ranks.'
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
    adminDeleteUser,
    toggleUserPremiumStatus,
    forgotPassword,
    resetPassword,
    getUserRank,
    getTotalRank
};