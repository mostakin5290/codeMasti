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
        // Define your core theme colors directly here.
        // These should match what you set in your defaultTheme object in JS.
        // Tailwind will then generate classes like `bg-primary-500`, `text-highlight`, etc.
        // Make sure these are actual hex or RGB values.
        'gray': { // Keeping standard gray scale if not fully replaced by theme.cardBg/text
          50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB',
          400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151',
          800: '#1F2937', 900: '#111827', 950: '#030712'
        },
        'indigo': {
          600: '#4F46E5', 700: '#4338CA'
        },
        'blue': {
          500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8'
        },
        'cyan': {
          400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2'
        },
        'purple': {
          400: '#C084FC', 500: '#A855F7', 600: '#9333EA', 700: '#7E22CE'
        },
        'emerald': {
          300: '#6EE7B7', 400: '#34D399', 500: '#10B981', 600: '#059669'
        },
        'amber': {
          300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706'
        },
        'red': {
          300: '#FCA5A5', 400: '#F87171', 500: '#EF4444', 600: '#DC2626'
        },
        'sky': {
          500: '#0EA5E9'
        },
        'slate': { // Match with gradientFrom/To if you want 'from-slate-xxx' to work
          800: '#1E293B',
          900: '#0F172A',
        },

        // New semantic colors from your defaultTheme.js
        // These should ideally be mapped to existing Tailwind colors
        // or defined explicitly as hex values here.
        // Example mapping:
        primary: '#06B6D4', // This should be your 'cyan-500' based on header defaultTheme
        'primary-hover': '#0891B2', // This should be your 'cyan-600'
        secondary: '#2563EB', // This should be your 'blue-600'
        'secondary-hover': '#1D4ED8', // This should be your 'blue-700'
        cardBg: '#1F2937', // This should be your 'gray-800'
        cardText: '#D1D5DB', // This should be your 'gray-300'
        border: '#374151', // This should be your 'gray-700'
        buttonPrimary: '#4F46E5', // This should be your 'indigo-600'
        buttonPrimaryHover: '#4338CA', // This should be your 'indigo-700'
        buttonSecondary: '#2563EB', // This should be your 'blue-600'
        buttonSecondaryHover: '#1D4ED8', // This should be your 'blue-700'
        highlight: '#A855F7', // This is purple-500, but in header it's cyan-400. CONSISTENCY IS KEY.
                              // Let's adjust based on the Header's defaultTheme:
        headerHighlight: '#22D3EE', // cyan-400
        highlightSecondary: '#3B82F6', // blue-500
        highlightTertiary: '#C084FC', // purple-400

        successColor: '#10B981', // emerald-500
        warningColor: '#F59E0B', // amber-500
        errorColor: '#EF4444', // red-500
        infoColor: '#0EA5E9', // sky-500

        // Gradients (these are usually handled directly by 'from-COLOR-TO-COLOR' classes)
        // gradientFrom: '#0F172A', // slate-900
        // gradientTo: '#1E293B', // slate-800
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Ensure this is included if using line-clamp or text-transparent with bg-clip-text
    require('tailwindcss-animate'),      // For animate-in classes (fade-in, slide-in, etc.)
    function ({ addUtilities, theme }) {
      const scrollbarUtilities = {
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.cardBg', '#1F2937'), // Use themed cardBg
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(180deg, ${theme('colors.buttonPrimary', '#4F46E5')}, ${theme('colors.buttonSecondary', '#2563EB')})`, // Use themed buttonPrimary/Secondary
            borderRadius: '4px',
            border: `1px solid ${theme('colors.border', '#374151')}`, // Use themed border
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: `linear-gradient(180deg, ${theme('colors.buttonPrimaryHover', '#4338CA')}, ${theme('colors.buttonSecondaryHover', '#1D4ED8')})`, // Use themed hover colors
          },
        },
      };

      const sliderUtilities = {
        '.slider-thumb-custom': { // Renamed for more specificity and to avoid conflict with default Tailwind input styles
          '&::-webkit-slider-thumb': {
            appearance: 'none',
            height: '20px',
            width: '20px',
            borderRadius: '50%',
            // Using themed highlight colors for a gradient thumb
            background: `linear-gradient(135deg, ${theme('colors.highlightSecondary', '#3B82F6')}, ${theme('colors.highlightTertiary', '#A855F7')}, ${theme('colors.primary', '#06B6D4')})`,
            cursor: 'pointer',
            boxShadow: `0 4px 12px ${theme('colors.highlightSecondary', '#3B82F6')}40`,
            border: `2px solid ${theme('colors.text', '#FFFFFF')}1A`, // Use themed text color with transparency
            transition: 'all 0.3s ease',
          },
          '&::-webkit-slider-thumb:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 6px 16px ${theme('colors.highlightSecondary', '#3B82F6')}99`,
          },
          '&::-moz-range-thumb': {
            height: '20px',
            width: '20px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme('colors.highlightSecondary', '#3B82F6')}, ${theme('colors.highlightTertiary', '#A855F7')}, ${theme('colors.primary', '#06B6D4')})`,
            cursor: 'pointer',
            border: `2px solid ${theme('colors.text', '#FFFFFF')}1A`,
            boxShadow: `0 4px 12px ${theme('colors.highlightSecondary', '#3B82F6')}40`,
          },
          '&::-moz-range-thumb:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 6px 16px ${theme('colors.highlightSecondary', '#3B82F6')}99`,
          },
        },
      };

      addUtilities(scrollbarUtilities, ['responsive', 'hover']);
      addUtilities(sliderUtilities, ['responsive', 'hover']);
    },
  ],
  safelist: [
    // Existing safelist patterns are generally good.
    // Ensure all variants are listed if they appear with patterns.
    {
      pattern: /(bg|from|to)-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus', 'active', 'group-hover'] // Added group-hover
    },
    {
      pattern: /text-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus', 'active', 'group-hover']
    },
    {
      pattern: /border-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus', 'active', 'group-hover']
    },
    {
      pattern: /ring-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus'] // Added focus
    },
    // Pattern for dynamic width generation in visualizer bars
    {
        pattern: /w-\[\d+(\.\d+)?%\]/,
        variants: ['responsive']
    },
    // Pattern for dynamic duration in visualizer bars
    {
        pattern: /duration-\d+/,
        variants: []
    },
    // Specific classes that might not be picked up by patterns or used dynamically
    'min-h-screen', 'flex-col', 'h-screen', 'w-full',
    'bg-gray-900', 'text-white', 'bg-gray-800', 'border-gray-700/50',
    'bg-gray-700', 'bg-gray-600', 'bg-gray-500',
    'text-gray-400', 'text-gray-300', 'text-gray-200', 'text-gray-500',
    'cursor-col-resize', 'cursor-row-resize', 'transition-all',
    'shadow-lg', 'shadow-xl', 'shadow-2xl', 'rounded-lg', 'rounded-xl', 'rounded-full',
    'animate-spin', 'animate-pulse', 'animate-bounce', 'animate-float',
    'border-t', 'border-b', 'border-l', 'border-r', 'opacity-50',
    'cursor-not-allowed', 'disabled:opacity-50', 'disabled:cursor-not-allowed',
    'flex-shrink-0', 'overflow-hidden', 'overflow-y-auto',
    'backdrop-blur-md', 'backdrop-blur-2xl',
    'text-emerald-300', 'border-emerald-500/50', // for status badges
    'text-amber-300', 'border-amber-500/50', // for status badges
    'text-red-300', 'border-red-500/50', // for status badges
    'bg-blue-500/20', 'bg-emerald-500/20', 'bg-gray-700/50', // for status badges backgrounds
    'from-indigo-600', 'to-blue-600', // for common gradients
    'from-red-600', 'to-red-700', // for pause button
    'from-emerald-500', 'to-emerald-500/80', // for start button
    'hover:bg-gray-600', 'hover:border-gray-500', // for secondary buttons
    'w-2', 'h-2', 'min-w-[2px]', // for visualizer bars
    'absolute', 'inset-0', 'top-40', 'right-40', 'bottom-40', 'left-40',
    'w-80', 'h-80', 'mix-blend-multiply', 'filter', 'blur-xl',
    'animate-pulse-slow', 'animation-delay-2000', 'animation-delay-4000',
    'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2',
    'pointer-events-none',
    'z-10', 'z-30', 'z-40', 'z-50', 'z-100', // Ensure high z-indices are safelisted
    'fixed', 'sticky', 'top-24', 'top-28',
    'translate-x-0', '-translate-x-full', 'lg:translate-x-0', 'lg:static', 'lg:block',
    'p-3', 'p-4', 'p-6', 'p-7', 'p-8', 'p-10', 'p-1.5',
    'px-4', 'px-5', 'px-6', 'px-8',
    'py-2', 'py-2.5', 'py-3', 'py-4', 'py-6', 'py-8', 'py-10',
    'text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
    'font-medium', 'font-semibold', 'font-bold', 'font-extrabold',
    'space-x-2', 'space-x-3', 'space-x-4',
    'space-y-2', 'space-y-3', 'space-y-4',
    'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8', 'gap-10', 'gap-0.5', 'gap-1.5',
    'flex', 'items-center', 'justify-between', 'justify-center', 'items-start', 'items-end',
    'hidden', 'lg:flex', 'md:flex', 'lg:hidden',
    'relative', 'group', 'overflow-hidden',
    'bg-clip-text', 'text-transparent',
    'block', 'w-full', 'w-20', 'w-32', 'w-72', 'w-80', 'w-96', 'max-w-7xl', 'mx-auto',
    'h-10', 'h-12', 'h-16', 'h-20', 'h-80', 'h-full', 'h-fit',
    'object-cover', 'border-2', 'border-transparent',
    'rounded-md', 'rounded-2xl', 'rounded-3xl',
    'origin-top-right', 'mt-3', 'animate-in', 'slide-in-from-top-2',
    'line-clamp-3', 'leading-relaxed', 'whitespace-nowrap',
    'transform', 'scale-[1.01]', 'scale-[1.02]', 'scale-105', 'scale-110', 'rotate-6',
    'from-cyan-500', 'to-cyan-600', // Header NavLink active state
    'from-blue-600', 'to-blue-700', // Header NavLink active state
    'hover:text-white', // Added for filter tabs hover
    'text-blue-300', 'text-emerald-300', 'text-gray-400', // Badges
    'group-hover:animate-none', 'group-hover:scale-110', 'group-hover:rotate-6', 'group-hover:border-highlight', // Visualizer card animations
    'group-hover:border-indigo-400', // Example specific hover border (needs to match highlight)
    '-m-0.5', // For border effect
    'slide-in-from-bottom-2', // Visualizer card entry
  ]
};