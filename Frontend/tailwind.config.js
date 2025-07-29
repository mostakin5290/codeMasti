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
        'fade-in-up-delay-200': 'fade-in-up 0.8s ease-out forwards 0.2s', // Specific delay utility
        'fade-in-up-delay-400': 'fade-in-up 0.8s ease-out forwards 0.4s', // Specific delay utility
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-and-rotate': 'floatAndRotate 6s ease-in-out infinite',
        'float-and-rotate-delay-2000': 'floatAndRotate 10s ease-in-out infinite 2s', // Specific delay utility
        'float-and-rotate-delay-4000': 'floatAndRotate 10s ease-in-out infinite 4s', // Specific delay utility
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-up': 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        // NEW ANIMATIONS
        'glow-border': 'glow-border 3s infinite ease-in-out',
        'code-background-gradient': 'code-background-gradient 8s ease infinite',
        'blob': 'blob 7s infinite cubic-bezier(0.64, 0.01, 0.07, 1.65)',
        'blob-delay-2000': 'blob 7s infinite cubic-bezier(0.01, 0.64, 1.65, 0.07) 2s',
        'blob-delay-4000': 'blob 7s infinite cubic-bezier(0.64, 0.01, 0.07, 1.65) 4s',
        'typing': 'typing 2s steps(40, end) forwards',
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
        // NEW KEYFRAMES
        'glow-border': {
          '0%, 100%': { 'box-shadow': '0 0 8px rgba(0, 255, 255, 0.4), 0 0 15px rgba(0, 255, 255, 0.2)' }, // Cyan glow
          '50%': { 'box-shadow': '0 0 20px rgba(0, 255, 255, 0.8), 0 0 35px rgba(0, 255, 255, 0.4)' },
        },
        'code-background-gradient': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        'blob': {
            '0%': { transform: 'translate(0px, 0px) scale(1)' },
            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
            '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'typing': {
            from: { width: '0' },
            to: { width: '100%' },
        },
      },
      scale: {
        '200': '2',
      },
      rotate: {
        '302': '302deg',
      },
      colors: {
        // Standard Tailwind colors (maintain these if you use them directly by name like `bg-gray-900`)
        'gray': {
          50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB',
          400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151',
          800: '#1F2937', 900: '#111827', 950: '#030712'
        },
        'indigo': {
          600: '#4F46E5', 700: '#4338CA'
        },
        'blue': {
          400: '#60A5FA', // Added blue-400 to match highlightSecondary
          500: '#3B82F6',
          600: '#2563EB', 700: '#1D4ED8'
        },
        'cyan': {
          400: '#22D3EE', // Added cyan-400 to match highlight
          500: '#06B6D4', 600: '#0891B2'
        },
        'purple': {
          400: '#C084FC', // Added purple-400 to match highlightTertiary
          500: '#A855F7', 600: '#9333EA', 700: '#7E22CE'
        },
        'emerald': {
          300: '#6EE7B7', 400: '#34D399', // Added emerald-400 to match successColor
          500: '#10B981', 600: '#059669'
        },
        'amber': {
          300: '#FCD34D', 400: '#FBBF24', // Added amber-400 if needed for badges
          500: '#F59E0B', 600: '#D97706'
        },
        'red': {
          300: '#FCA5A5', 400: '#F87171', // Added red-400 to match errorColor
          500: '#EF4444', 600: '#DC2626'
        },
        'sky': {
          500: '#0EA5E9'
        },
        'slate': {
          800: '#1E293B',
          900: '#0F172A',
        },

        // Semantic colors explicitly defined with hex values for consistency with defaultTheme.js
        primary: '#06B6D4', // cyan-500
        'primary-hover': '#0891B2', // cyan-600
        secondary: '#2563EB', // blue-600
        'secondary-hover': '#1D4ED8', // blue-700
        cardBg: '#1F2937', // gray-800
        cardText: '#D1D5DB', // gray-300
        border: '#374151', // gray-700
        buttonPrimary: '#4F46E5', // indigo-600
        buttonPrimaryHover: '#4338CA', // indigo-700
        buttonText: '#FFFFFF', // white
        highlight: '#22D3EE', // cyan-400
        highlightSecondary: '#60A5FA', // blue-400 (using this for consistency as `text-blue-400` is common)
        highlightTertiary: '#C084FC', // purple-400

        successColor: '#34D399', // emerald-400
        warningColor: '#FBBF24', // amber-400
        errorColor: '#F87171', // red-400
        infoColor: '#0EA5E9', // sky-500
      },
      backgroundSize: {
        '200%': '200% 100%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    function ({ addUtilities, theme }) {
      const scrollbarUtilities = {
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.cardBg', '#1F2937'),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(180deg, ${theme('colors.buttonPrimary', '#4F46E5')}, ${theme('colors.buttonSecondary', '#2563EB')})`,
            borderRadius: '4px',
            border: `1px solid ${theme('colors.border', '#374151')}`,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: `linear-gradient(180deg, ${theme('colors.buttonPrimaryHover', '#4338CA')}, ${theme('colors.buttonSecondaryHover', '#1D4ED8')})`,
          },
        },
      };

      const sliderUtilities = {
        '.slider-thumb-custom': {
          '&::-webkit-slider-thumb': {
            appearance: 'none',
            height: '20px',
            width: '20px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme('colors.highlightSecondary', '#60A5FA')}, ${theme('colors.highlightTertiary', '#C084FC')}, ${theme('colors.primary', '#06B6D4')})`,
            cursor: 'pointer',
            boxShadow: `0 4px 12px ${theme('colors.highlightSecondary', '#60A5FA')}40`,
            border: `2px solid ${theme('colors.text', '#FFFFFF')}1A`,
            transition: 'all 0.3s ease',
          },
          '&::-webkit-slider-thumb:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 6px 16px ${theme('colors.highlightSecondary', '#60A5FA')}99`,
          },
          '&::-moz-range-thumb': {
            height: '20px',
            width: '20px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme('colors.highlightSecondary', '#60A5FA')}, ${theme('colors.highlightTertiary', '#C084FC')}, ${theme('colors.primary', '#06B6D4')})`,
            cursor: 'pointer',
            border: `2px solid ${theme('colors.text', '#FFFFFF')}1A`,
            boxShadow: `0 4px 12px ${theme('colors.highlightSecondary', '#60A5FA')}40`,
          },
          '&::-moz-range-thumb:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 6px 16px ${theme('colors.highlightSecondary', '#60A5FA')}99`,
          },
        },
      };

      addUtilities(scrollbarUtilities, ['responsive', 'hover']);
      addUtilities(sliderUtilities, ['responsive', 'hover']);
    },
  ],
  safelist: [
    {
      pattern: /delay-(0|100|200|300|400|500|600|700|800|900|1000|1100|1200|1300|1400|1500|1600|1700|1800|1900|2000)/, // Adjust range based on max index * 100
    },
    {
      pattern: /(bg|from|to)-(slate|gray|zinc|emerald|lime|orange|blue|cyan|teal|indigo|purple|fuchsia|pink|red|amber|yellow|neutral)-(50|100|200|300|400|500|600|700|800|900|950)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus', 'active', 'group-hover']
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
      variants: ['hover', 'focus']
    },
    // Safelist for semantic colors (e.g., bg-primary, text-highlight)
    {
      pattern: /(bg|from|to|text|border|ring)-(primary|primary-hover|secondary|secondary-hover|cardBg|cardText|border|buttonPrimary|buttonPrimaryHover|buttonText|highlight|highlightSecondary|highlightTertiary|successColor|warningColor|errorColor|infoColor)(\/(10|20|30|40|50|60|70|80|90|95))?/,
      variants: ['hover', 'focus', 'active', 'group-hover']
    },
    // Pattern for dynamic width generation in visualizer bars (if used with arbitrary values)
    {
        pattern: /w-\[\d+(\.\d+)?%\]/,
        variants: ['responsive']
    },
    // Pattern for dynamic duration in visualizer bars (if used with arbitrary values)
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
    // Added specific text colors for badges for safety
    'text-emerald-400', 'border-emerald-400/50',
    'text-amber-400', 'border-amber-400/50',
    'text-red-400', 'border-red-400/50',
    'text-blue-400', 'border-blue-400/50',
    'bg-blue-500/20', 'bg-emerald-500/20', 'bg-gray-700/50',
    'from-indigo-600', 'to-blue-600',
    'from-red-600', 'to-red-700',
    'from-emerald-500', 'to-emerald-500/80',
    'hover:bg-gray-600', 'hover:border-gray-500',
    'w-2', 'h-2', 'min-w-[2px]',
    'absolute', 'inset-0', 'top-40', 'right-40', 'bottom-40', 'left-40',
    'w-80', 'h-80', 'mix-blend-multiply', 'filter', 'blur-xl',
    'animate-pulse-slow', // Already present but confirming
    'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2',
    'pointer-events-none',
    'z-0', 'z-1', 'z-10', 'z-30', 'z-40', 'z-50', 'z-[100]', // Ensure high z-indices are safelisted
    'fixed', 'sticky', 'top-24', 'top-28',
    'translate-x-0', '-translate-x-full', 'lg:translate-x-0', 'lg:static', 'lg:block',
    'p-3', 'p-4', 'p-6', 'p-7', 'p-8', 'p-10', 'p-1.5',
    'px-4', 'px-5', 'px-6', 'px-8',
    'py-2', 'py-2.5', 'py-3', 'py-4', 'py-6', 'py-8', 'py-10',
    'text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', // Added higher text sizes
    'font-medium', 'font-semibold', 'font-bold', 'font-extrabold',
    'space-x-2', 'space-x-3', 'space-x-4',
    'space-y-2', 'space-y-3', 'space-y-4',
    'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8', 'gap-10', 'gap-0.5', 'gap-1.5',
    'flex', 'items-center', 'justify-between', 'justify-center', 'items-start', 'items-end',
    'hidden', 'lg:flex', 'md:flex', 'lg:hidden',
    'relative', 'group', 'overflow-hidden',
    'bg-clip-text', 'text-transparent',
    'block', 'w-full', 'w-20', 'w-32', 'w-72', 'w-80', 'w-96', 'max-w-7xl', 'mx-auto',
    'h-10', 'h-12', 'h-16', 'h-20', 'h-80', 'h-96', 'h-full', 'h-fit', 'h-30', // Added h-96, h-30
    'object-cover', 'border-2', 'border-transparent',
    'rounded-md', 'rounded-2xl', 'rounded-3xl',
    'origin-top-right', 'mt-3', 'animate-in', 'slide-in-from-top-2',
    'line-clamp-3', 'leading-relaxed', 'whitespace-nowrap',
    'transform', 'scale-[1.01]', 'scale-[1.02]', 'scale-105', 'scale-110', 'rotate-6',
    'from-cyan-500', 'to-cyan-600',
    'from-blue-600', 'to-blue-700',
    'hover:text-white',
    'text-blue-300', 'text-purple-400', 'text-yellow-300', 'text-green-400', 'text-orange-400', // For code syntax highlighting
    'group-hover:animate-none', 'group-hover:scale-110', 'group-hover:rotate-6', 'group-hover:border-highlight',
    'group-hover:border-indigo-400',
    '-m-0.5',
    'slide-in-from-bottom-2',
    // New classes from the animated sections:
    'bg-[length:200%_100%]', // For background gradients that move
    'opacity-20', 'group-hover:opacity-40', // For the code editor background animation
  ]
};