// src/components/LeftSidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaGraduationCap, FaStar, FaLock, FaPlus, FaCodeBranch } from 'react-icons/fa';

const LeftSidebar = () => {
    // A reusable style for sidebar links
    const linkStyle = "flex items-center gap-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors duration-200";
    const activeLinkStyle = `${linkStyle} bg-slate-700/80 text-white font-semibold`;

    return (
        <aside className="bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-xl p-4 flex flex-col gap-4 text-sm sticky top-24">
            <div>
                <Link to="#" className={linkStyle}>
                    <FaBook className="text-slate-400" />
                    <span>Library</span>
                </Link>
                <Link to="#" className={activeLinkStyle}>
                    <FaGraduationCap className="text-slate-400" />
                    <span>Study Plan</span>
                </Link>
            </div>

            <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between items-center mb-2 px-3">
                    <h3 className="font-semibold text-slate-200">My Lists</h3>
                    <button className="text-slate-400 hover:text-white transition-colors"><FaPlus /></button>
                </div>
                <Link to="#" className={`${linkStyle} justify-between`}>
                    <div className="flex items-center gap-3">
                        <FaStar className="text-yellow-400" />
                        <span>Favorite</span>
                    </div>
                    <FaLock className="text-slate-500" />
                </Link>
            </div>

            <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold text-slate-200 mb-2 px-3">Saved by me</h3>
                <Link to="#" className={`${linkStyle} justify-between`}>
                    <div className="flex items-center gap-3">
                        <FaCodeBranch className="text-slate-400" />
                        <span>Recursion</span>
                    </div>
                </Link>
                <Link to="#" className={`${linkStyle} justify-between`}>
                    <div className="flex items-center gap-3">
                        <FaCodeBranch className="text-slate-400" />
                        <span>Array</span>
                    </div>
                </Link>
            </div>
        </aside>
    );
};

export default LeftSidebar;