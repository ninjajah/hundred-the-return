/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                gray: {
                    900: '#0F0F0F', // Dark background
                    800: '#1A1A1A', // Slightly lighter elements
                    700: '#2A2A2A', // Borders
                    600: '#3A3A3A', // Hover states
                    500: '#555555',
                    400: '#777777', // Placeholder text
                    300: '#999999',
                    200: '#BBBBBB',
                    100: '#EEEEEE', // Primary text
                },
                yellow: {
                    500: '#F0B90B', // Primary yellow (Bybit brand color)
                    400: '#F8D33A', // Hover state
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
}
