/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#050818', // Darker base like album art
          dark: '#0A0F2A',   // Slightly lighter dark blue
          darker: '#03050F', // Even darker variant
        },
        accent: {
          blue: '#215DFF',    // Electric blue from art
          magenta: '#B43CFF', // Magenta/purple from art
          cyan: '#00FFFF',    // Cyan
        },
      },
      fontFamily: {
        sans: ['MonoplexKR-Light', 'sans-serif'], // Changed default sans to MonoplexKR-Light
        blender: ['Giants-Inline', 'sans-serif'], // Keep heading font
        pretendard: ['Pretendard-Regular', 'sans-serif'], // Added Pretendard font
        mono: ['Consolas', 'Monaco', 'monospace'], 
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'neon-blue': '0 0 10px theme("colors.accent.blue"), 0 0 5px theme("colors.accent.blue")', // Adjusted base shadow slightly
        'neon-magenta': '0 0 10px theme("colors.accent.magenta"), 0 0 5px theme("colors.accent.magenta")', // Adjusted base shadow slightly
        'neon-blue-hover': '0 0 20px theme("colors.accent.blue"), 0 0 10px theme("colors.accent.blue")', // Added hover shadow
        'neon-magenta-hover': '0 0 20px theme("colors.accent.magenta"), 0 0 10px theme("colors.accent.magenta")', // Added hover shadow
      },
      textShadow: {
        'neon-blue': '0 0 5px theme("colors.accent.blue"), 0 0 10px theme("colors.accent.blue")',
        'neon-magenta': '0 0 5px theme("colors.accent.magenta"), 0 0 10px theme("colors.accent.magenta")',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) { // Add theme access
      const newUtilities = {
        '.text-shadow-neon-blue': {
          // Added a third layer with wider blur
          textShadow: `0 0 5px ${theme('colors.accent.blue')}, 0 0 10px ${theme('colors.accent.blue')}, 0 0 20px ${theme('colors.accent.blue')}`, 
        },
        '.text-shadow-neon-magenta': {
          // Added a third layer with wider blur
          textShadow: `0 0 5px ${theme('colors.accent.magenta')}, 0 0 10px ${theme('colors.accent.magenta')}, 0 0 20px ${theme('colors.accent.magenta')}`, 
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
