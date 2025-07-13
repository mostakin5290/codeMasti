// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shine-on': 'shineOn 0.5s ease forwards',
        'shine-off': 'shineOff 0.5s ease forwards',
        'click': 'click 0.3s ease forwards',
        'line': 'line 0.8s ease-in forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-and-rotate': 'floatAndRotate 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-up': 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        shineOn: {
          '0%': { '--tw-gradient-from': '#f50000', '--tw-gradient-to': '#f50000' },
          '50%': { '--tw-gradient-from': '#666666', '--tw-gradient-to': '#666666' },
          '100%': { '--tw-gradient-from': '#4CAF50', '--tw-gradient-to': '#4CAF50' },
        },
        shineOff: {
          '0%': { '--tw-gradient-from': '#4CAF50', '--tw-gradient-to': '#4CAF50' },
          '50%': { '--tw-gradient-from': '#666666', '--tw-gradient-to': '#666666' },
          '100%': { '--tw-gradient-from': '#f50000', '--tw-gradient-to': '#f50000' },
        },
        click: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        line: {
          '0%': { transform: 'translateY(0)' },
          '10%': { transform: 'translateY(10px)' },
          '40%': { transform: 'translateY(-25px)' },
          '60%': { transform: 'translateY(-25px)' },
          '85%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatAndRotate: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      scale: {
        '200': '2',
      },
      rotate: {
        '302': '302deg',
      },
      colors: {
        // --- ADDED PRIMARY AND SECONDARY COLORS HERE ---
        primary: '#4c6ef5', // Example: Blue-ish primary
        secondary: '#868e96', // Example: Gray-ish secondary
        // --- END ADDED COLORS ---

        // Keep these if you still need to pass hex to Ballpit or other components
        'indigo-600-hex': '#4F46E5',
        'purple-700-hex': '#6B21A8',
        'cyan-400-hex': '#22D3EE',
        'pink-400-hex': '#F472B6',
        'red-500-hex': '#EF4444',
        'orange-500-hex': '#F97316',
        'blue-500-hex': '#3B82F6',
        'purple-500-hex': '#A855F7',
        'indigo-500-hex': '#6366F1',
        'indigo-400-hex': '#818CF8',
        'blue-100-hex': '#DBEAFE',
        'indigo-100-hex': '#E0E7FF',
        'zinc-950-hex': '#09090B',
        'indigo-950-hex': '#1E1B4B',
        'purple-400-hex': '#C084FC',
        'green-400-hex': '#4ADE80',
        'emerald-500-hex': '#10B981',
      }
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const scrollbarUtilities = {
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.slate.800', '#1F2937'),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(180deg, ${theme('colors.blue.500', '#3B82F6')}, ${theme('colors.purple.500', '#A855F7')})`,
            borderRadius: '4px',
            border: `1px solid ${theme('colors.slate.700', '#334155')}`,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: `linear-gradient(180deg, ${theme('colors.blue.600', '#2563EB')}, ${theme('colors.purple.600', '#9333EA')})`,
          },
        },
      };

      const sliderUtilities = {
        '.slider': {
          '&::-webkit-slider-thumb': {
            appearance: 'none',
            height: '20px',
            width: '20px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme('colors.blue.500', '#3b82f6')}, ${theme('colors.purple.500', '#8b5cf6')}, ${theme('colors.pink.500', '#ec4899')})`,
            cursor: 'pointer',
            boxShadow: `0 4px 12px ${theme('colors.blue.500', '#3b82f6')}40`,
            border: `2px solid ${theme('colors.white', '#FFFFFF')}1A`,
            transition: 'all 0.3s ease',
          },
          '&::-webkit-slider-thumb:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 6px 16px ${theme('colors.blue.500', '#3b82f6')}99`,
          },
          '&::-moz-range-thumb': {
            height: '20px',
            width: '20px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme('colors.blue.500', '#3b82f6')}, ${theme('colors.purple.500', '#8b5cf6')}, ${theme('colors.pink.500', '#ec4899')})`,
            cursor: 'pointer',
            border: `2px solid ${theme('colors.white', '#FFFFFF')}1A`,
            boxShadow: `0 4px 12px ${theme('colors.blue.500', '#3b82f6')}40`,
          },
          '&::-moz-range-thumb:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 6px 16px ${theme('colors.blue.500', '#3b82f6')}99`,
          },
        },
      };

      addUtilities(scrollbarUtilities, ['responsive', 'hover']);
      addUtilities(sliderUtilities, ['responsive', 'hover']);
    },
  ],
  safelist: [
    // This part is good for ensuring dynamic classes based on standard Tailwind colors are included
    {
      pattern: /(bg|from|to)-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus', 'active']
    },
    {
      pattern: /text-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus', 'active']
    },
    {
      pattern: /border-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus', 'active']
    },
    {
      pattern: /ring-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
    },
    // Specific classes used in components (including primary/secondary)
    'min-h-screen', 'flex-col', 'h-screen',
    'bg-slate-900', 'text-white', 'bg-slate-800', 'border-slate-700/50', 'bg-slate-700', 'bg-slate-600',
    'text-slate-400', 'text-slate-300', 'text-slate-200', 'text-slate-500',
    'cursor-col-resize', 'cursor-row-resize', 'transition-all', 'duration-300', 'duration-500',
    'shadow-lg', 'shadow-xl', 'shadow-2xl', 'rounded-lg', 'rounded-xl', 'rounded-full',
    'animate-spin', 'animate-pulse', 'animate-bounce', 'animate-float',
    'border-t', 'border-b', 'border-l', 'border-r', 'opacity-50',
    'cursor-not-allowed', 'disabled:opacity-50', 'disabled:cursor-not-allowed',
    'flex-shrink-0', 'overflow-hidden', 'overflow-y-auto',
    'bg-slate-900/80', 'bg-slate-700/30', 'bg-slate-700/40', 'bg-slate-900/50',
    'text-emerald-300', 'border-emerald-400/40', 'text-amber-300', 'border-amber-400/40',
    'text-rose-300', 'border-rose-400/40', 'text-emerald-400', 'text-red-400', 'text-amber-400',
    'bg-emerald-500/20', 'to-green-500/20', 'bg-amber-500/20', 'to-orange-500/20',
    'bg-rose-500/20', 'to-red-500/20', 'bg-emerald-500/10', 'to-green-500/10',
    'bg-red-500/10', 'to-rose-500/10', 'bg-amber-500/10', 'to-orange-500/10',
    'from-blue-500', 'to-cyan-500', 'from-yellow-500', 'to-amber-500',
    'from-purple-500', 'to-pink-500', 'from-orange-500', 'to-red-500',
    'hover:from-blue-400', 'hover:via-purple-500', 'hover:to-blue-400',
    'bg-gradient-to-b', 'bg-gradient-to-r',
    'w-1.5', 'h-1.5', 'focus:ring-blue-500/50', 'focus:border-transparent',
    'placeholder-slate-500', 'border-white/30', 'border-t-white',
    'from-blue-600', 'to-purple-600',
    'from-red-500/20', 'to-rose-500/20', 'border-red-500/30',
    'from-red-400', 'to-rose-400',
    'group-hover:-translate-x-1', 'font-medium',
    'bg-gray-100', 'bg-gray-200', 'border-gray-200', 'border-gray-300',
    'text-gray-900', 'text-gray-500', 'text-gray-400',
    'w-2', 'h-2',
    'animation-delay-2000', 'animation-delay-4000',
    'top-24', 'left-4', 'w-72', 'w-80', 'p-8', 'blur', 'opacity-10', 'opacity-20',
    'mix-blend-multiply', 'filter', 'blur-xl',
    'bg-white/10', 'bg-white/5', 'border-white/10', 'border-white/20',
    'min-h-[75vh]',
    'bg-black/60', 'bg-red-900/50', 'animate-fade-in', 'animate-scale-up',
    'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700',
    'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700',
    'bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600', 'bg-cyan-700',
    'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700',
    'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700',
    'bg-fuchsia-400', 'bg-fuchsia-500', 'bg-fuchsia-600', 'bg-fuchsia-700',
    'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700',
    'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700',
    'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700',
    'bg-amber-400', 'bg-amber-500', 'bg-amber-600', 'bg-amber-700',
    'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700',
    'bg-lime-400', 'bg-lime-500', 'bg-lime-600', 'bg-lime-700',
    'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700',
    'bg-teal-400', 'bg-teal-500', 'bg-teal-600', 'bg-teal-700',
    'bg-sky-400', 'bg-sky-500', 'bg-sky-600', 'bg-sky-700',
    'bg-stone-400', 'bg-stone-500', 'bg-stone-600', 'bg-stone-700',

    // Add explicit safelist entries for primary/secondary and their common variants,
    // although JIT should ideally pick these up if they are explicitly written in JSX.
    // This is good for robustness if any dynamic concatenation were to happen.
    'from-primary', 'to-secondary', 'text-primary', 'border-primary/50',
    'from-primary/30', 'from-secondary/20',
    'hover:shadow-primary/30', 'hover:text-primary/80',
  ]
};