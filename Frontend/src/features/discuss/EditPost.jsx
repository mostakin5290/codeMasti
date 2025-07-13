// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import axiosClient from '../api/axiosClient';
// import Header from '../components/layout/Header';
// import Footer from '../components/layout/Footer';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import { toast } from 'react-toastify';
// import MonacoEditor from '@monaco-editor/react';

// const EditPostPage = () => {
//     const { postId } = useParams();
//     const navigate = useNavigate();
//     const { user: currentUser } = useSelector(state => state.auth);
//     const [post, setPost] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [formData, setFormData] = useState({
//         title: '',
//         description: '',
//         code: '',
//         language: 'javascript',
//         problemId: ''
//     });
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     useEffect(() => {
//         const fetchPost = async () => {
//             try {
//                 const { data } = await axiosClient.get(`/discuss/post/${postId}`);
//                 if (data.author._id !== currentUser._id && currentUser.role !== 'admin') {
//                     throw new Error('You are not authorized to edit this post');
//                 }
//                 setPost(data);
//                 setFormData({
//                     title: data.title,
//                     description: data.description,
//                     code: data.code || '',
//                     language: data.language || 'javascript',
//                     problemId: data.problem?._id || ''
//                 });
//             } catch (err) {
//                 setError(err.message || 'Failed to load post');
//                 toast.error(err.message || 'Failed to load post');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPost();
//     }, [postId, currentUser]);

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleCodeChange = (value) => {
//         setFormData({
//             ...formData,
//             code: value
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         try {
//             await axiosClient.put(`/discuss/post/${postId}`, formData);
//             toast.success('Post updated successfully');
//             navigate(`/discuss/${post.slug}`);
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Failed to update post');
//             console.error(err);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (loading) return <LoadingSpinner message="Loading post..." />;
//     if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
//             <Header />

//             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                 <button
//                     onClick={() => navigate(-1)}
//                     className="flex items-center gap-2 text-white/70 hover:text-primary mb-6 transition-colors"
//                 >
//                     <FiChevronLeft /> Back to Discussions
//                 </button>

//                 <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-xl p-6">
//                     <h1 className="text-2xl font-bold text-white mb-6">Edit Post</h1>

//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-6">
//                             <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-2">
//                                 Title
//                             </label>
//                             <input
//                                 type="text"
//                                 id="title"
//                                 name="title"
//                                 value={formData.title}
//                                 onChange={handleChange}
//                                 className="w-full bg-white/10 border border-white/20 text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                                 required
//                             />
//                         </div>

//                         <div className="mb-6">
//                             <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
//                                 Description
//                             </label>
//                             <textarea
//                                 id="description"
//                                 name="description"
//                                 value={formData.description}
//                                 onChange={handleChange}
//                                 rows="5"
//                                 className="w-full bg-white/10 border border-white/20 text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                                 required
//                             />
//                         </div>

//                         <div className="mb-6">
//                             <label htmlFor="language" className="block text-sm font-medium text-white/80 mb-2">
//                                 Programming Language
//                             </label>
//                             <select
//                                 id="language"
//                                 name="language"
//                                 value={formData.language}
//                                 onChange={handleChange}
//                                 className="w-full bg-white/10 border border-white/20 text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                             >
//                                 <option value="javascript">JavaScript</option>
//                                 <option value="python">Python</option>
//                                 <option value="java">Java</option>
//                                 <option value="cpp">C++</option>
//                                 <option value="csharp">C#</option>
//                             </select>
//                         </div>

//                         <div className="mb-6">
//                             <label htmlFor="code" className="block text-sm font-medium text-white/80 mb-2">
//                                 Code (Optional)
//                             </label>
//                             <div className="h-64 border border-white/20 rounded-lg overflow-hidden">
//                                 <MonacoEditor
//                                     language={formData.language}
//                                     theme="vs-dark"
//                                     value={formData.code}
//                                     onChange={handleCodeChange}
//                                     options={{
//                                         minimap: { enabled: false },
//                                         fontSize: 14,
//                                         scrollBeyondLastLine: false
//                                     }}
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex justify-end gap-3">
//                             <button
//                                 type="button"
//                                 onClick={() => navigate(-1)}
//                                 className="btn btn-ghost border-white/20"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isSubmitting}
//                                 className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none"
//                             >
//                                 {isSubmitting ? 'Saving...' : 'Save Changes'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>

//             <Footer />
//         </div>
//     );
// };

// export default EditPostPage;