import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import MonacoEditor from '@monaco-editor/react';
import {
    FaSearch, FaTimes, FaCode, FaLink,
    FaAlignLeft, FaAlignCenter, FaAlignRight,
    FaTextHeight, FaBold, FaItalic, FaUnderline, FaStrikethrough,
    FaPalette, FaLink as FaLinkIcon, FaUndo, FaRedo, FaTrashAlt,
    FaListUl, FaListOl, FaQuoteLeft, FaHeading,
    FaExpand, FaCompress, FaHighlighter
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';

// Default theme for the app context
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

// Updated MenuBar component
const MenuBar = ({ editor, appTheme }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [customColor, setCustomColor] = useState('#000000');
    const [customHighlight, setCustomHighlight] = useState('#fef08a');

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

    // Fixed link functions
    const handleAddLink = () => {
        if (!linkUrl.trim()) return;

        const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
            ? linkUrl
            : `https://${linkUrl}`;

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        setLinkUrl('');
        setShowLinkInput(false);
    };

    const handleRemoveLink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        setLinkUrl('');
        setShowLinkInput(false);
    };

    // Enhanced color palettes
    const presetColors = [
        '#000000', '#ffffff', '#6b7280', '#374151',
        '#ef4444', '#dc2626', '#991b1b', '#7f1d1d',
        '#f97316', '#ea580c', '#c2410c', '#9a3412',
        '#f59e0b', '#d97706', '#b45309', '#92400e',
        '#eab308', '#ca8a04', '#a16207', '#854d0e',
        '#84cc16', '#65a30d', '#4d7c0f', '#365314',
        '#22c55e', '#16a34a', '#15803d', '#166534',
        '#10b981', '#059669', '#047857', '#065f46',
        '#06b6d4', '#0891b2', '#0e7490', '#155e75',
        '#0ea5e9', '#0284c7', '#0369a1', '#075985',
        '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
        '#6366f1', '#4f46e5', '#4338ca', '#3730a3',
        '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
        '#a855f7', '#9333ea', '#7e22ce', '#6b21a8',
        '#d946ef', '#c026d3', '#a21caf', '#86198f',
        '#ec4899', '#db2777', '#be185d', '#9d174d'
    ];

    const presetHighlights = [
        '#fef3c7', '#fef08a', '#fde047', '#facc15',
        '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
        '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
        '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6',
        '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc',
        '#fed7d7', '#fecaca', '#fca5a5', '#f87171',
        '#fff2cc', '#ffeb9c', '#ffe066', '#ffd93d',
        '#e0f2fe', '#b3e5fc', '#81d4fa', '#4fc3f7'
    ];

    return (
        <div ref={menuBarRef} className={`flex flex-wrap gap-1 mb-2 p-3 ${appTheme.cardBg} rounded-t-lg border-b ${appTheme.border}`}>
            {/* Undo/Redo */}
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 ${appTheme.cardText} hover:${appTheme.highlight} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Undo (Ctrl+Z)"
            >
                <FaUndo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 ${appTheme.cardText} hover:${appTheme.highlight} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Redo (Ctrl+Y)"
            >
                <FaRedo className="w-4 h-4" />
            </button>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Headings */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('heading', { level: 1 })
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Heading 1"
            >
                <span className="text-lg font-bold">H1</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('heading', { level: 2 })
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Heading 2"
            >
                <span className="text-base font-bold">H2</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('heading', { level: 3 })
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Heading 3"
            >
                <span className="text-sm font-bold">H3</span>
            </button>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Text Formatting */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('bold')
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Bold (Ctrl+B)"
            >
                <FaBold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('italic')
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Italic (Ctrl+I)"
            >
                <FaItalic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('underline')
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Underline (Ctrl+U)"
            >
                <FaUnderline className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('strike')
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Strikethrough"
            >
                <FaStrikethrough className="w-4 h-4" />
            </button>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Lists */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('bulletList')
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Bullet List"
            >
                <FaListUl className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('orderedList')
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Numbered List"
            >
                <FaListOl className="w-4 h-4" />
            </button>

            {/* Blockquote */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('blockquote')
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Quote"
            >
                <FaQuoteLeft className="w-4 h-4" />
            </button>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Text Alignment */}
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive({ textAlign: 'left' })
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Align Left"
            >
                <FaAlignLeft className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive({ textAlign: 'center' })
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Align Center"
            >
                <FaAlignCenter className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive({ textAlign: 'right' })
                    ? `${appTheme.primary} ${appTheme.buttonText}`
                    : `${appTheme.cardText} hover:${appTheme.highlight}`
                    }`}
                title="Align Right"
            >
                <FaAlignRight className="w-4 h-4" />
            </button>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Link */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setShowLinkInput(!showLinkInput);
                        if (editor.isActive('link')) {
                            setLinkUrl(editor.getAttributes('link').href || '');
                        } else {
                            setLinkUrl('');
                        }
                    }}
                    className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 ${editor.isActive('link')
                        ? `${appTheme.primary} ${appTheme.buttonText}`
                        : `${appTheme.cardText} hover:${appTheme.highlight}`
                        }`}
                    title="Add Link"
                >
                    <FaLinkIcon className="w-4 h-4" />
                </button>
                {showLinkInput && (
                    <div className={`absolute top-full mt-2 left-0 p-4 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-xl z-50 w-80`}>
                        <div className="space-y-3">
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-1`}>
                                    Enter URL:
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://example.com or example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className={`w-full px-3 py-2 ${appTheme.cardBg} border ${appTheme.border} rounded-md ${appTheme.text} text-sm focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent placeholder-${appTheme.cardText}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddLink();
                                        }
                                        if (e.key === 'Escape') {
                                            setShowLinkInput(false);
                                            setLinkUrl('');
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleAddLink}
                                    disabled={!linkUrl.trim()}
                                    className={`flex-1 px-3 py-2 text-sm ${appTheme.primary} ${appTheme.buttonText} rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {editor.isActive('link') ? 'Update' : 'Add Link'}
                                </button>
                                {editor.isActive('link') && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveLink}
                                        className={`px-3 py-2 text-sm ${appTheme.errorColor} border border-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors`}
                                    >
                                        Remove
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLinkInput(false);
                                        setLinkUrl('');
                                    }}
                                    className={`px-3 py-2 text-sm ${appTheme.cardText} border ${appTheme.border} rounded-md hover:${appTheme.cardBg}/80 transition-colors`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Enhanced Text Color Picker */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`p-2 rounded-md hover:${appTheme.cardBg}/80 ${appTheme.cardText} hover:${appTheme.highlight} transition-all duration-200 flex items-center gap-2`}
                    title="Text Color"
                >
                    <FaPalette className="w-4 h-4" />
                    <div
                        className="w-4 h-4 rounded border-2 border-gray-400"
                        style={{ backgroundColor: editor.getAttributes('textStyle').color || customColor }}
                    ></div>
                </button>
                {showColorPicker && (
                    <div className={`absolute top-full mt-2 left-0 p-4 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-xl z-50 w-80`}>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-2`}>
                                    Text Color:
                                </label>
                                <div className="grid grid-cols-8 gap-2 mb-3">
                                    {presetColors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                editor.chain().focus().setColor(color).run();
                                                setCustomColor(color);
                                            }}
                                            className={`w-7 h-7 rounded-md border-2 hover:scale-110 transition-transform ${editor.getAttributes('textStyle').color === color
                                                ? `border-${appTheme.primary.split('-')[1]}-500 shadow-md`
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className={`block text-xs ${appTheme.cardText} mb-1`}>
                                        Custom Color:
                                    </label>
                                    <input
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => {
                                            setCustomColor(e.target.value);
                                            editor.chain().focus().setColor(e.target.value).run();
                                        }}
                                        className="w-full h-10 rounded-md border cursor-pointer"
                                        title="Pick Custom Color"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().unsetColor().run();
                                            setShowColorPicker(false);
                                        }}
                                        className={`px-3 py-2 text-xs ${appTheme.cardBg}/80 hover:${appTheme.cardBg}/60 ${appTheme.cardText} rounded-md border ${appTheme.border} transition-colors`}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowColorPicker(false)}
                                        className={`px-3 py-2 text-xs ${appTheme.primary} ${appTheme.buttonText} rounded-md hover:opacity-90 transition-opacity`}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Highlight Color Picker */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                    className={`p-2 rounded-md hover:${appTheme.cardBg}/80 transition-all duration-200 flex items-center gap-2 ${editor.isActive('highlight')
                        ? `${appTheme.primary} ${appTheme.buttonText}`
                        : `${appTheme.cardText} hover:${appTheme.highlight}`
                        }`}
                    title="Highlight Text"
                >
                    <FaHighlighter className="w-4 h-4" />
                    <div
                        className="w-4 h-4 rounded border-2 border-gray-400"
                        style={{ backgroundColor: editor.getAttributes('highlight').color || customHighlight }}
                    ></div>
                </button>
                {showHighlightPicker && (
                    <div className={`absolute top-full mt-2 left-0 p-4 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-xl z-50 w-80`}>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${appTheme.cardText} mb-2`}>
                                    Highlight Color:
                                </label>
                                <div className="grid grid-cols-8 gap-2 mb-3">
                                    {presetHighlights.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                editor.chain().focus().setHighlight({ color }).run();
                                                setCustomHighlight(color);
                                            }}
                                            className={`w-7 h-7 rounded-md border-2 hover:scale-110 transition-transform ${editor.getAttributes('highlight').color === color
                                                ? `border-${appTheme.primary.split('-')[1]}-500 shadow-md`
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className={`block text-xs ${appTheme.cardText} mb-1`}>
                                        Custom Highlight:
                                    </label>
                                    <input
                                        type="color"
                                        value={customHighlight}
                                        onChange={(e) => {
                                            setCustomHighlight(e.target.value);
                                            editor.chain().focus().setHighlight({ color: e.target.value }).run();
                                        }}
                                        className="w-full h-10 rounded-md border cursor-pointer"
                                        title="Pick Custom Highlight Color"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().unsetHighlight().run();
                                            setShowHighlightPicker(false);
                                        }}
                                        className={`px-3 py-2 text-xs ${appTheme.cardBg}/80 hover:${appTheme.cardBg}/60 ${appTheme.cardText} rounded-md border ${appTheme.border} transition-colors`}
                                    >
                                        Remove
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowHighlightPicker(false)}
                                        className={`px-3 py-2 text-xs ${appTheme.primary} ${appTheme.buttonText} rounded-md hover:opacity-90 transition-opacity`}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`w-px h-8 ${appTheme.border} mx-1`}></div>

            {/* Clear Formatting */}
            <button
                type="button"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                className={`p-2 rounded-md hover:${appTheme.cardBg}/80 ${appTheme.cardText} hover:${appTheme.errorColor} transition-all duration-200`}
                title="Clear All Formatting"
            >
                <FaTrashAlt className="w-4 h-4" />
            </button>
        </div>
    );
};

// Updated CreateDiscussPost Component
const CreateDiscussPost = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [problemQuery, setProblemQuery] = useState('');
    const [updateTarget, setUpdateTarget] = useState(null);

    const [searchedProblems, setSearchedProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchRef = useRef(null);

    const postToEdit = location.state?.post;

    // Updated Tiptap Editor setup with correct Placeholder import
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-gray-300 pl-4 italic my-4',
                    },
                },
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
                    class: 'text-blue-500 underline hover:text-blue-700 cursor-pointer',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] p-4 custom-scrollbar ${appTheme.text} ${appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9') ? 'prose-invert' : ''
                    }`,
            },
        },
        immediatelyRender: false,
    });

    const [monacoEditorTheme, setMonacoEditorTheme] = useState('vs-dark');

    useEffect(() => {
        if (appTheme.background.includes('dark') || appTheme.background.includes('black') || appTheme.background.includes('zinc-9')) {
            setMonacoEditorTheme('vs-dark');
        } else {
            setMonacoEditorTheme('vs-light');
        }
    }, [appTheme.background]);

    useEffect(() => {
        if (postToEdit && editor) {
            setTitle(postToEdit.title);
            setCode(postToEdit.code || '');
            setLanguage(postToEdit.language || 'javascript');
            setSelectedProblem(postToEdit.problem || null);
            setProblemQuery(postToEdit.problem?.title || '');

            setTimeout(() => {
                if (editor && postToEdit.description) {
                    editor.commands.setContent(postToEdit.description);
                }
            }, 200);
        }
    }, [postToEdit, editor]);

    useEffect(() => {
        if (problemQuery.length < 2) {
            setSearchedProblems([]);
            return;
        }

        setIsSearching(true);
        const handler = setTimeout(async () => {
            try {
                const response = await axiosClient.get(`/problem/search?q=${problemQuery}&limit=10`);
                setSearchedProblems(response.data);
            } catch (err) {
                console.error("Problem search failed:", err);
                toast.error("Failed to search problems");
                setSearchedProblems([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [problemQuery]);

    const handleSelectProblem = (problem) => {
        setSelectedProblem(problem);
        setProblemQuery(problem.title);
        setSearchedProblems([]);
    };

    const clearSelectedProblem = () => {
        setSelectedProblem(null);
        setProblemQuery('');
        setSearchedProblems([]);
    };

    const validateForm = () => {
        if (!title.trim()) {
            toast.error("Please enter a title for your post");
            return false;
        }
        if (title.trim().length < 10) {
            toast.error("Title should be at least 10 characters long");
            return false;
        }
        if (!editor?.getText().trim()) {
            toast.error("Please write a description for your post");
            return false;
        }
        if (editor.getText().trim().length < 20) {
            toast.error("Description should be at least 20 characters long");
            return false;
        }
        if (!selectedProblem) {
            toast.error("Please select a related problem");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const postData = {
                title: title.trim(),
                description: editor.getHTML(),
                code: code.trim() || null,
                language: code.trim() ? language : null,
                problemId: selectedProblem._id,
            };

            let response;
            if (postToEdit) {
                response = await axiosClient.put(`/discuss/posts/${postToEdit._id}`, postData);
                toast.success('Post updated successfully! ✨');
                console.log(response)
            } else {
                response = await axiosClient.post('/discuss/create', postData);
                toast.success('Post created successfully! 🎉');
            }

            navigate('/discuss');

        } catch (error) {
            console.error("Post save error:", error);
            const errorMessage = error.response?.data?.message || "Failed to save post. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const editorOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        lineNumbers: 'on',
        folding: true,
        bracketMatching: 'always',
        theme: monacoEditorTheme,
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${appTheme.gradientFrom} ${appTheme.gradientTo}`}>
            <div className='mb-20'>
                <Header />
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className={`${appTheme.cardBg}/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border ${appTheme.border}`}>
                    <div className={`p-6 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.secondary.replace('bg-', 'to-')}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-2xl font-bold ${appTheme.buttonText}`}>
                                    {postToEdit ? 'Edit Discussion Post' : 'Create Discussion Post'}
                                </h1>
                                <p className={`${appTheme.buttonText.replace('text-white', `text-${appTheme.primary.split('-')[1]}-100`)}`}>
                                    Share your thoughts and solutions with the community
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full ${appTheme.buttonText.replace('text-white', 'bg-white/20 text-white')} text-sm`}>
                                Press Ctrl+S to save
                            </div>
                        </div>
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
                                        className={`w-full px-4 py-3 ${appTheme.cardBg} border ${appTheme.border} rounded-lg ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent pr-10 transition-all`}
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
                                        <FaSearch className={`absolute top-1/2 right-3 -translate-y-1/2 ${appTheme.cardText}/80 ${isSearching ? 'animate-pulse' : ''}`} />
                                    )}
                                </div>

                                {searchedProblems.length > 0 && !selectedProblem && (
                                    <ul className={`absolute z-20 w-full mt-1 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-xl max-h-60 overflow-y-auto`}>
                                        {searchedProblems.map(p => (
                                            <li
                                                key={p._id}
                                                onClick={() => handleSelectProblem(p)}
                                                className={`px-4 py-3 hover:${appTheme.cardBg}/80 cursor-pointer ${appTheme.text} border-b ${appTheme.border} last:border-b-0 transition-colors`}
                                            >
                                                <div className="font-medium">{p.title}</div>
                                                <div className={`text-xs ${appTheme.cardText} mt-1`}>
                                                    Difficulty: {p.difficulty} • Category: {p.category}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {isSearching && (
                                    <div className={`absolute z-20 w-full mt-1 ${appTheme.cardBg} border ${appTheme.border} rounded-lg shadow-xl p-4 text-center ${appTheme.cardText}`}>
                                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mx-auto mb-2"></div>
                                        Searching problems...
                                    </div>
                                )}
                            </div>

                            {selectedProblem && (
                                <div className={`mt-2 p-4 ${appTheme.cardBg}/50 rounded-lg border ${appTheme.successColor.replace('text-', 'border-')}/30`}>
                                    <div className={`flex items-center gap-2 ${appTheme.successColor} mb-2`}>
                                        <span className="font-medium">✓ Selected: {selectedProblem.title}</span>
                                    </div>
                                    <div className={`text-xs ${appTheme.cardText}`}>
                                        Difficulty: {selectedProblem.difficulty} • Category: {selectedProblem.category}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Post Title */}
                        <div>
                            <label htmlFor="title" className={`block text-sm font-medium ${appTheme.cardText} mb-2 flex items-center gap-2`}>
                                <FaTextHeight className={`${appTheme.infoColor}`} />
                                <span>Post Title *</span>
                                <span className={`text-xs ${appTheme.cardText}/60`}>({title.length}/100)</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter a descriptive title for your post"
                                maxLength={100}
                                className={`w-full px-4 py-3 ${appTheme.cardBg} border ${appTheme.border} rounded-lg ${appTheme.text} placeholder-${appTheme.cardText.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 focus:border-transparent transition-all`}
                                required
                            />
                            {title.length > 0 && title.length < 10 && (
                                <p className={`text-xs ${appTheme.warningColor} mt-1`}>
                                    Title should be at least 10 characters long
                                </p>
                            )}
                        </div>

                        {/* Description Editor */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-2 flex items-center justify-between`}>
                                <span>Description *</span>
                                <span className={`text-xs ${appTheme.cardText}/60`}>
                                    {editor?.getText().length || 0} characters
                                </span>
                            </label>
                            <div className={`rounded-lg overflow-hidden border ${appTheme.border}`}>
                                <MenuBar editor={editor} appTheme={appTheme} />
                                <div className={`${appTheme.cardBg}`}>
                                    <EditorContent
                                        editor={editor}
                                        className={`min-h-[400px] focus:outline-none`}
                                    />
                                </div>
                            </div>
                            <p className={`text-xs ${appTheme.cardText}/70 mt-1`}>
                                Use the toolbar above to format your text with headings, colors, links, and more
                            </p>
                        </div>

                        {/* Code Editor */}
                        <div>
                            <label className={`block text-sm font-medium ${appTheme.cardText} mb-4 flex items-center gap-2`}>
                                <FaCode className={`${appTheme.infoColor}`} />
                                <span>Code Snippet (Optional)</span>
                            </label>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <select
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        className={`px-4 py-2 ${appTheme.cardBg} border ${appTheme.border} rounded-lg ${appTheme.text} focus:outline-none focus:ring-2 focus:ring-${appTheme.primary.split('-')[1]}-500 transition-all`}
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
                                    {code && (
                                        <span className={`text-sm ${appTheme.cardText}`}>
                                            {code.split('\n').length} lines
                                        </span>
                                    )}
                                </div>
                                <div className={`h-80 rounded-lg overflow-hidden border ${appTheme.border}`}>
                                    <MonacoEditor
                                        language={language}
                                        theme={monacoEditorTheme}
                                        value={code}
                                        onChange={setCode}
                                        options={editorOptions}
                                        loading={
                                            <div className={`h-full flex items-center justify-center ${appTheme.cardBg} ${appTheme.cardText}`}>
                                                <div className="text-center">
                                                    <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2"></div>
                                                    Loading editor...
                                                </div>
                                            </div>
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigate('/discuss')}
                                className={`px-6 py-3 ${appTheme.cardBg} ${appTheme.cardText} font-medium rounded-lg hover:${appTheme.cardBg}/80 transition-all`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-8 py-3 ${appTheme.primary.replace('bg-', 'bg-gradient-to-r from-')} ${appTheme.secondary.replace('bg-', 'to-')} ${appTheme.buttonText} font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
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
