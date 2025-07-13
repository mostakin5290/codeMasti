// src/components/RightSidebar.js
import React from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';

const Calendar = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = Array.from({ length: 30 }, (_, i) => i + 1);
    const today = 9;

    return (
        <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4 text-slate-200">
                <FaChevronLeft className="cursor-pointer hover:text-white" />
                <div className="text-center font-semibold">
                    <div>Day {today}</div>
                    <div className="text-xs text-slate-400">19:35:50 left</div>
                </div>
                <FaChevronRight className="cursor-pointer hover:text-white" />
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 mb-2">
                {days.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
                {dates.map(date => (
                    <div key={date} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors ${date === today ? 'bg-green-500 text-white font-bold' : 'text-slate-300 hover:bg-slate-700/50'}`}>
                        {date}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TrendingCompanies = () => {
    const companies = [
        { name: 'Meta', count: 1195, color: 'bg-blue-500/20 text-blue-300' },
        { name: 'Google', count: 1990, color: 'bg-yellow-500/20 text-yellow-300' },
        { name: 'Amazon', count: 1844, color: 'bg-orange-500/20 text-orange-300' },
    ];
    return (
        <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold text-slate-200 mb-3">Trending Companies</h3>
            <div className="relative mb-4">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Search for a company..." className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"/>
            </div>
            <div className="flex flex-wrap gap-2">
                {companies.map(c => (
                     <div key={c.name} className={`text-xs px-3 py-1.5 rounded-full cursor-pointer hover:brightness-125 transition ${c.color}`}>
                        {c.name} <span className="font-semibold">{c.count}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const RightSidebar = () => {
    return (
        <aside className="flex flex-col gap-6 sticky top-24">
            <Calendar />
            <TrendingCompanies />
        </aside>
    );
};

export default RightSidebar;