// frontend/src/components/EditProfile.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setUser } from '../../features/auth/authSlice';
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { FiUploadCloud, FiTrash, FiEdit, FiUser, FiMail, FiMapPin, FiGlobe, FiGithub, FiLinkedin, FiTwitter, FiSave, FiArrowLeft } from 'react-icons/fi';

const defaultAppTheme = { /* ... your default theme ... */ };

const EditProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { theme: appThemeFromContext } = useTheme();
    const navigate = useNavigate();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        headline: '',
        bio: '',
        location: '',
        avatar: '',
        avatarPublicId: '',
        github: '',
        linkedin: '',
        twitter: '',
        website: '',
    });

    const [isUpdating, setIsUpdating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageUploadProgress, setImageUploadProgress] = useState(0);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                headline: user.headline || '',
                bio: user.bio || '',
                location: user.location || '',
                avatar: user.avatar || '',
                avatarPublicId: user.avatarPublicId || '',
                github: user.socialLinks?.github || '',
                linkedin: user.socialLinks?.linkedin || '',
                twitter: user.socialLinks?.twitter || '',
                website: user.socialLinks?.website || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        setImageUploadProgress(0);

        const oldPublicId = formData.avatarPublicId;

        try {
            const signatureResponse = await axiosClient.get('/images/signature');
            const { 
                signature, 
                timestamp, 
                api_key, 
                cloud_name, 
                public_id,
                upload_url,
                transformation,
                eager
            } = signatureResponse.data;

            if (!cloud_name || !upload_url) {
                toast.error("Cloudinary upload configuration missing from backend.");
                setUploadingImage(false);
                return;
            }

            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('eager', eager);
            cloudinaryFormData.append('public_id', public_id);
            cloudinaryFormData.append('timestamp', timestamp);
            cloudinaryFormData.append('transformation', transformation);
            cloudinaryFormData.append('api_key', api_key);
            cloudinaryFormData.append('signature', signature);
            cloudinaryFormData.append('file', file);

            const uploadResponse = await axios.post(
                upload_url,
                cloudinaryFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setImageUploadProgress(percentCompleted);
                    },
                }
            );

            const newAvatarUrl = uploadResponse.data.eager?.[0]?.secure_url || uploadResponse.data.secure_url;
            const newAvatarPublicId = uploadResponse.data.public_id;

            if (oldPublicId && oldPublicId !== newAvatarPublicId) {
                try {
                    await axiosClient.post('/images/delete', { publicId: oldPublicId });
                    toast.info("Previous avatar removed from Cloudinary.");
                } catch (deleteError) {
                    console.warn(`Failed to delete old avatar:`, deleteError);
                    toast.warn("Could not delete previous avatar from server.");
                }
            }

            setFormData(prev => ({
                ...prev,
                avatar: newAvatarUrl,
                avatarPublicId: newAvatarPublicId,
            }));
            toast.success('Avatar uploaded successfully!');

        } catch (error) {
            console.error('Avatar upload error:', error);
            const errorMessage = error.response?.data?.error || 
                              error.message || 
                              "Failed to upload avatar. Please try again.";
            toast.error(errorMessage);
        } finally {
            setUploadingImage(false);
            setImageUploadProgress(0);
            e.target.value = null;
        }
    };

    const handleRemoveAvatar = async () => {
        if (!formData.avatar && !formData.avatarPublicId) {
            toast.info("No custom avatar to remove.");
            return;
        }

        if (uploadingImage) {
            toast.warn("Please wait for the current upload to complete.");
            return;
        }

        if (formData.avatarPublicId) {
            try {
                await axiosClient.post('/images/delete', { publicId: formData.avatarPublicId });
                toast.success("Avatar removed from Cloudinary.");
            } catch (error) {
                console.error("Failed to delete avatar from Cloudinary:", error.response?.data || error);
                toast.error(error.response?.data?.message || "Failed to remove avatar from Cloudinary.");
            }
        }

        setFormData(prev => ({
            ...prev,
            avatar: '',
            avatarPublicId: '',
        }));
        toast.info("Avatar cleared. Remember to save your profile to apply changes.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const dataToSend = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                headline: formData.headline,
                bio: formData.bio,
                location: formData.location,
                avatar: formData.avatar,
                avatarPublicId: formData.avatarPublicId,
                socialLinks: {
                    github: formData.github,
                    linkedin: formData.linkedin,
                    twitter: formData.twitter,
                    website: formData.website
                }
            };

            const { data } = await axiosClient.put('/user/profile', dataToSend);
            dispatch(setUser(data.user));
            toast.success('Profile updated successfully!');
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!user) {
        return (
            <div className={`min-h-screen ${appTheme.background} flex items-center justify-center`}>
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                    <p className={`text-lg ${appTheme.text}`}>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${appTheme.background} ${appTheme.text}`}>
            <div className='mb-10'>
                <Header />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section with Breadcrumb */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate('/profile')}
                        className={`flex items-center space-x-2 text-sm ${appTheme.cardText} hover:${appTheme.text} transition-colors duration-200 mb-6`}
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        <span>Back to Profile</span>
                    </button>
                    
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <FiUser className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className={`text-4xl font-bold ${appTheme.text} mb-2`}>Edit Profile</h1>
                            <p className={`text-lg ${appTheme.cardText}`}>Manage your account and profile information</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Avatar Section - Sidebar */}
                    <div className="lg:col-span-1">
                        <div className={`${appTheme.cardBg} rounded-2xl border ${appTheme.border} p-6 shadow-lg sticky top-6`}>
                            <h3 className={`text-xl font-semibold ${appTheme.text} mb-6`}>Profile Picture</h3>
                            
                            <div className="flex flex-col items-center space-y-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-lg">
                                        <img
                                            src={formData.avatar || user.avatar || '/default-avatar.png'}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 rounded-full bg-white text-gray-800 hover:bg-gray-100 transition-colors"
                                            disabled={uploadingImage}
                                        >
                                            <FiEdit className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    {uploadingImage && (
                                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-75">
                                            <div className="text-white text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                                <span className="text-sm">{imageUploadProgress}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />

                                <div className="flex flex-col space-y-3 w-full">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingImage}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                    >
                                        <FiUploadCloud className="w-5 h-5" />
                                        <span>{uploadingImage ? 'Uploading...' : 'Upload New'}</span>
                                    </button>
                                    
                                    {formData.avatar && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            disabled={uploadingImage}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                        >
                                            <FiTrash className="w-5 h-5" />
                                            <span>Remove</span>
                                        </button>
                                    )}
                                </div>

                                {uploadingImage && (
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${imageUploadProgress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Form Section */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information */}
                            <div className={`${appTheme.cardBg} rounded-2xl border ${appTheme.border} p-8 shadow-lg`}>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                                        <FiUser className="w-4 h-4 text-white" />
                                    </div>
                                    <h2 className={`text-2xl font-semibold ${appTheme.text}`}>Personal Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="Enter your first name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${appTheme.cardText}`} />
                                        <input
                                            type="email"
                                            value={user.emailId}
                                            readOnly
                                            className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.cardText} rounded-xl pl-11 pr-4 py-3 cursor-not-allowed opacity-60`}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                        Professional Headline
                                    </label>
                                    <input
                                        type="text"
                                        name="headline"
                                        value={formData.headline}
                                        onChange={handleChange}
                                        className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                        placeholder="e.g., Full-Stack Developer | React Enthusiast"
                                    />
                                </div>

                                <div className="mt-6 space-y-2">
                                    <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                        About Me
                                    </label>
                                    <textarea
                                        name="bio"
                                        rows={4}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none`}
                                        placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                                    />
                                </div>

                                <div className="mt-6 space-y-2">
                                    <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                        Location
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${appTheme.cardText}`} />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="e.g., San Francisco, CA"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className={`${appTheme.cardBg} rounded-2xl border ${appTheme.border} p-8 shadow-lg`}>
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                        <FiGlobe className="w-4 h-4 text-white" />
                                    </div>
                                    <h2 className={`text-2xl font-semibold ${appTheme.text}`}>Social Links</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                            GitHub
                                        </label>
                                        <div className="relative">
                                            <FiGithub className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${appTheme.cardText}`} />
                                            <input
                                                type="text"
                                                name="github"
                                                value={formData.github}
                                                onChange={handleChange}
                                                className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                                placeholder="github.com/yourusername"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                            LinkedIn
                                        </label>
                                        <div className="relative">
                                            <FiLinkedin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${appTheme.cardText}`} />
                                            <input
                                                type="text"
                                                name="linkedin"
                                                value={formData.linkedin}
                                                onChange={handleChange}
                                                className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                                placeholder="linkedin.com/in/yourprofile"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                            Twitter
                                        </label>
                                        <div className="relative">
                                            <FiTwitter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${appTheme.cardText}`} />
                                            <input
                                                type="text"
                                                name="twitter"
                                                value={formData.twitter}
                                                onChange={handleChange}
                                                className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                                placeholder="twitter.com/yourhandle"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className={`block text-sm font-medium ${appTheme.cardText}`}>
                                            Website
                                        </label>
                                        <div className="relative">
                                            <FiGlobe className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${appTheme.cardText}`} />
                                            <input
                                                type="text"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className={`w-full ${appTheme.cardBg} border ${appTheme.border} ${appTheme.text} rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                                placeholder="yourwebsite.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/profile')}
                                    className={`px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating || uploadingImage}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="w-5 h-5" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default EditProfile;