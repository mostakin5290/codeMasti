import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import MonacoEditor from '@monaco-editor/react';
import {
    FaSearch, FaTimes, FaCode, FaLink,
    FaAlignLeft, FaAlignCenter, FaAlignRight,
    FaTextHeight, FaBold, FaItalic, FaUnderline, FaStrikethrough,
    FaPalette, FaLink as FaLinkIcon, FaUndo, FaRedo, FaTrashAlt // FaListUl, FaListOl, FaQuoteLeft were unused/redundant if using StarterKit defaults
} from 'react-icons/fa';
// FiCheckCircle, FiXCircle were imported but not used in this component's JSX
// and are not strictly needed for basic functionality.
import { useTheme } from '../../context/ThemeContext';

// Rich text editor imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';

// NOTE: Blockquote, CodeBlock, HardBreak, HorizontalRule are already part of StarterKit.
// Importing and adding them separately causes the "Duplicate extension names found" warning.
// If you need custom configurations for these, you should disable them in StarterKit's config
// and then add your custom configured versions. For simplicity and to resolve the warning,
// I've removed the redundant explicit imports and usage.

// Default theme for the app context (provided in your original code)
const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

// MenuBar component for Tiptap editor
const MenuBar = ({ editor, appTheme }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    // Ref for the menu bar container to detect clicks outside
    const menuBarRef = useRef(null);

    // Close pickers if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuBarRef.current && !menuBarRef.current.contains(event.target)) {
                setShowColorPicker(false);
                setShowHighlightPicker(false);
                setShowLinkInput(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!editor) {
        return null;
    }

    const addLink = () => {
        if (linkUrl) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkInput(false);
        }
    };

    const removeLink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        setLinkUrl(''); // Clear URL field after removing
        setShowLinkInput(false);
    };

    // Predefined color options - using Tailwind default colors, adjust as needed
    const presetColors = [
        '#000000', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#a855f7', '#6b7280'
    ];

    // Highlight color options - using Tailwind default colors, adjust as needed
    const presetHighlights = [
        '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#a78bfa', '#fda4af', '#fcd34d',
    ];

    return (
        <div ref={menuBarRef} className={`flex flex-wrap gap-1 mb-2 p-3 ${appTheme.cardBg} rounded-t-lg border-b ${appTheme.border}`}>
            {/* Undo/Redo */}
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 ${appTheme.cardText} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Undo"
            >
                <FaUndo />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 ${appTheme.cardText} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Redo"
            >
                <FaRedo />
            </button>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Text Formatting */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive('bold') ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                    }`}
                title="Bold"
            >
                <FaBold className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive('italic') ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                    }`}
                title="Italic"
            >
                <FaItalic className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive('underline') ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                    }`}
                title="Underline"
            >
                <FaUnderline className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive('strike') ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                    }`}
                title="Strikethrough"
            >
                <FaStrikethrough className="w-5 h-5" />
            </button>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>
            {/* Text Alignment */}
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive({ textAlign: 'left' }) ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                    }`}
                title="Align Left"
            >
                <FaAlignLeft className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive({ textAlign: 'center' }) ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                    }`}
                title="Align Center"
            >
                <FaAlignCenter className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive({ textAlign: 'right' }) ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                    }`}
                title="Align Right"
            >
                <FaAlignRight className="w-5 h-5" />
            </button>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Link */}
            <div className="relative link-input-group">
                <button
                    type="button"
                    onClick={() => {
                        setShowLinkInput(!showLinkInput);
                        if (editor.isActive('link')) {
                            setLinkUrl(editor.getAttributes('link').href);
                        } else {
                            setLinkUrl('');
                        }
                    }}
                    className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive('link') ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                        }`}
                    title="Add Link"
                >
                    <FaLinkIcon className="w-5 h-5" />
                </button>
                {showLinkInput && (
                    <div className={`absolute top-full mt-1 left-0 p-2 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-lg z-10 w-64`}>
                        <input
                            type="url"
                            placeholder="Enter URL"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className={`w-full px-2 py-1 mb-2 ${appTheme.cardBg} border ${appTheme.border} rounded ${appTheme.text} text-sm`}
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={addLink}
                                className={`px-3 py-1 text-sm ${appTheme.primary} ${appTheme.buttonText} rounded hover:opacity-80`}
                            >
                                Add
                            </button>
                            {editor.isActive('link') && (
                                <button
                                    type="button"
                                    onClick={removeLink}
                                    className={`px-3 py-1 text-sm ${appTheme.errorColor} border border-red-400 rounded hover:bg-red-400 hover:text-white`}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Text Color */}
            <div className="relative color-picker-group">
                <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${appTheme.cardText}`}
                    title="Text Color"
                >
                    <FaPalette className="w-5 h-5" />
                </button>
                {showColorPicker && (
                    <div className={`absolute top-full mt-1 left-0 p-2 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-lg z-10`}>
                        <div className="grid grid-cols-8 gap-1 mb-2">
                            {presetColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().setColor(color).run();
                                        setShowColorPicker(false);
                                    }}
                                    className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                        <input
                            type="color"
                            onChange={(e) => {
                                editor.chain().focus().setColor(e.target.value).run();
                                setShowColorPicker(false);
                            }}
                            value={editor.getAttributes('textStyle').color || (appTheme.text.includes('white') ? '#ffffff' : '#000000')}
                            className="w-full h-8 rounded border cursor-pointer"
                            title="Custom Color"
                        />
                    </div>
                )}
            </div>

            {/* Highlight Color */}
            <div className="relative highlight-picker-group">
                <button
                    type="button"
                    onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                    className={`p-2 rounded hover:${appTheme.cardBg}/80 transition-colors ${editor.isActive('highlight') ? `${appTheme.primary} ${appTheme.buttonText}` : `${appTheme.cardText}`
                        }`}
                    title="Highlight"
                >
                    <span className="text-sm font-bold" style={{ backgroundColor: 'yellow', color: 'black', padding: '2px 4px', borderRadius: '2px' }}>H</span>
                </button>
                {showHighlightPicker && (
                    <div className={`absolute top-full mt-1 left-0 p-2 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-lg z-10`}>
                        <div className="grid grid-cols-8 gap-1 mb-2">
                            {presetHighlights.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().setHighlight({ color }).run();
                                        setShowHighlightPicker(false);
                                    }}
                                    className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                editor.chain().focus().unsetHighlight().run();
                                setShowHighlightPicker(false);
                            }}
                            className={`mt-2 w-full px-2 py-1 rounded text-xs ${appTheme.cardBg}/80 hover:${appTheme.cardBg}/60 ${appTheme.cardText}`}
                            title="Remove Highlight"
                        >
                            Remove Highlight
                        </button>
                    </div>
                )}
            </div>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>
            {/* Clear Formatting */}
            <button
                type="button"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                className={`p-2 rounded hover:${appTheme.cardBg}/80 ${appTheme.cardText}`}
                title="Clear Formatting"
            >
                <FaTrashAlt className="w-5 h-5" />
            </button>
        </div>
    );
};

// Main CreateDiscussPost Component
const CreateDiscussPost = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [problemQuery, setProblemQuery] = useState('');
    const [searchedProblems, setSearchedProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchRef = useRef(null);

    // Get post data if editing
    const postToEdit = location.state?.post;
    console.log("Post received for editing:", postToEdit); // Debugging: log postToEdit

    // Tiptap Editor setup
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                codeBlock: { // This is for inline code blocks, not the Monaco editor
                    languageClasses: true,
                },
                // Removed redundant extensions like blockquote, hardBreak, horizontalRule
                // as StarterKit already provides them. If custom versions are needed,
                // disable them here: blockquote: false, etc.
            }),
            TextStyle,
            Color.configure({
                types: ['textStyle'],
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 underline hover:text-blue-700',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: postToEdit ? postToEdit.description : '',
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] p-4 custom-scrollbar ${appTheme.text} ${appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9') ? 'prose-invert' : ''}`,
            },
        },
        immediatelyRender: false, // Prevents immediate render issues on hydration
    });

    // Monaco Editor theme synchronization
    const [monacoEditorTheme, setMonacoEditorTheme] = useState('vs-dark');

    useEffect(() => {
        if (appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9')) {
            setMonacoEditorTheme('vs-dark');
        } else {
            setMonacoEditorTheme('vs-light');
        }
    }, [appTheme.background]);

    // Populate form fields if editing an existing post
    useEffect(() => {
        if (postToEdit && editor) {
            setTitle(postToEdit.title);
            setCode(postToEdit.code || '');
            setLanguage(postToEdit.language || 'javascript');
            setSelectedProblem(postToEdit.problem || null);
            setProblemQuery(postToEdit.problem?.title || '');

            // Set editor content. Use `commands.setContent` for Tiptap
            editor.commands.setContent(postToEdit.description);
        }
    }, [postToEdit, editor]); // Depend on editor instance and postToEdit

    // Fetch problems based on search query
    useEffect(() => {
        if (problemQuery.length < 2) {
            setSearchedProblems([]);
            return;
        }
        setIsSearching(true);
        const handler = setTimeout(() => {
            axiosClient.get(`/problem/search?q=${problemQuery}`)
                .then(response => setSearchedProblems(response.data))
                .catch(err => console.error("Problem search failed:", err))
                .finally(() => setIsSearching(false));
        }, 500);
        return () => clearTimeout(handler);
    }, [problemQuery]);

    const handleSelectProblem = (problem) => {
        setSelectedProblem(problem);
        setProblemQuery(problem.title);
        setSearchedProblems([]); // Clear search results after selection
    };

    const clearSelectedProblem = () => {
        setSelectedProblem(null);
        setProblemQuery('');
    };

    // Handle form submission (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !editor?.getText().trim() || !selectedProblem) {
            toast.error("Please fill in the title, description, and select a problem.");
            return;
        }

        setIsSubmitting(true);
        try {
            const postData = {
                title: title.trim(),
                description: editor.getHTML(),
                // Ensure empty code string becomes null if not provided
                code: code.trim() !== '' ? code.trim() : null,
                language: code.trim() !== '' ? language : null, // Only set language if code exists
                problemId: selectedProblem._id,
            };

            let response;
            if (postToEdit) {
                // Update existing post
                response = await axiosClient.put(`/discuss/${postToEdit._id}`, postData);
                toast.success('Post updated successfully! ✨');
                navigate(`/discuss/${response.data.post.slug}`);

            } else {
                // Create new post
                response = await axiosClient.post('/discuss/create', postData);
                toast.success('Post created successfully! 🎉');
                navigate(`/discuss/${response.data.slug}`);

            }

            // Navigate to the newly created/updated post using its slug.
            // The backend is now expected to return the full post object directly
            // (e.g., `res.json(updatedPost)` or `res.json(savedPost)`).
        } catch (error) {
            console.error("Post save error:", error); // Log the full error for debugging
            toast.error(error.response?.data?.message || "Failed to save post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Monaco editor options
    const editorOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${appTheme.gradientFrom} ${appTheme.gradientTo}`}>
            <div className='mb-20'> <Header /></div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className={`${appTheme.cardBg}/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border ${appTheme.border}`}>
                    <div className={`p-6 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.secondary.replace('bg-', 'to-')}`}>
                        <h1 className={`text-2xl font-bold ${appTheme.buttonText}`}>
                            {postToEdit ? 'Edit Discussion Post' : 'Create Discussion Post'}
                        </h1>
                        <p className={`${appTheme.buttonText.replace('text-white', `text-${appTheme.primary.split('-')[1]}-100`)}`}>
                            Share your thoughts and solutions with the community
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Problem Selection */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-2 flex items-center gap-2`}>
                                <FaLink className={`${appTheme.infoColor}`} />
                                <span>Link to Problem *</span>
                            </label>
                            <div className="relative" ref={searchRef}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={problemQuery}
                                        onChange={(e) => setProblemQuery(e.target.value)}
                                        placeholder="Search for a problem by title..."
                                        disabled={!!selectedProblem}
                                        className={`w-full px-4 py-3 ${appTheme.cardBg} border ${appTheme.border} rounded-lg ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent pr-10`}
                                    />
                                    {selectedProblem ? (
                                        <button
                                            type="button"
                                            onClick={clearSelectedProblem}
                                            className={`absolute top-1/2 right-3 -translate-y-1/2 ${appTheme.cardText} hover:${appTheme.errorColor} transition-colors`}
                                            title="Clear selected problem"
                                        >
                                            <FaTimes />
                                        </button>
                                    ) : (
                                        <FaSearch className={`absolute top-1/2 right-3 -translate-y-1/2 ${appTheme.cardText}/80`} />
                                    )}
                                </div>

                                {searchedProblems.length > 0 && !selectedProblem && ( // Only show if not selected
                                    <ul className={`absolute z-10 w-full mt-1 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                                        {searchedProblems.map(p => (
                                            <li
                                                key={p._id}
                                                onClick={() => handleSelectProblem(p)}
                                                className={`px-4 py-3 hover:${appTheme.cardBg}/80 cursor-pointer ${appTheme.text} border-b ${appTheme.border} last:border-b-0`}
                                            >
                                                {p.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {selectedProblem && (
                                <div className={`mt-2 p-3 ${appTheme.cardBg}/50 rounded-lg border ${appTheme.successColor.replace('text-', 'border-')}/30`}>
                                    <div className={`flex items-center gap-2 ${appTheme.successColor}`}>
                                        <span className="font-medium">Selected: {selectedProblem.title}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Post Title */}
                        <div>
                            <label htmlFor="title" className={`block text-sm font-medium ${appTheme.cardText} mb-2 flex items-center gap-2`}>
                                <FaTextHeight className={`${appTheme.infoColor}`} />
                                <span>Post Title *</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter a descriptive title for your post"
                                className={`w-full px-4 py-3 ${appTheme.cardBg} border ${appTheme.border} rounded-lg ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                required
                            />
                        </div>

                        {/* Description Editor */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-2`}>Description *</label>
                            <div className={`rounded-lg overflow-hidden border ${appTheme.border}`}>
                                {/* Tiptap Editor Menu Bar */}
                                <MenuBar editor={editor} appTheme={appTheme} />
                                {/* Tiptap Editor Content Area */}
                                <div className={`${appTheme.cardBg}`}>
                                    <EditorContent
                                        editor={editor}
                                        className={`min-h-[300px] p-4 ${appTheme.text} focus:outline-none`}
                                    />
                                </div>
                            </div>
                            <p className={`text-xs ${appTheme.cardText}/70 mt-1`}>
                                Use the toolbar above to format your text with headings, colors, links, and more
                            </p>
                        </div>

                        {/* Code Editor */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-2 flex items-center gap-2`}>
                                <FaCode className={`${appTheme.infoColor}`} />
                                <span>Code Snippet (Optional)</span>
                            </label>
                            <div className="mb-2">
                                <select
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className={`px-4 py-2 ${appTheme.cardBg} border ${appTheme.border} rounded-lg ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500`}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="php">PHP</option>
                                    <option value="ruby">Ruby</option>
                                    <option value="go">Go</option>
                                    <option value="rust">Rust</option>
                                    <option value="kotlin">Kotlin</option>
                                    <option value="swift">Swift</option>
                                    <option value="csharp">C#</option>
                                </select>
                            </div>
                            <div className={`h-60 rounded-lg overflow-hidden border ${appTheme.border}`}>
                                <MonacoEditor
                                    language={language}
                                    theme={monacoEditorTheme}
                                    value={code}
                                    onChange={setCode}
                                    options={editorOptions}
                                    loading={<div className={`h-full flex items-center justify-center ${appTheme.cardBg} ${appTheme.cardText}`}>Loading editor...</div>}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className={`px-6 py-3 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.secondary.replace('bg-', 'to-')} ${appTheme.buttonText} font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin">⚙️</span>
                                        {postToEdit ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span>
                                        {postToEdit ? 'Update Post' : 'Create Post'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CreateDiscussPost;