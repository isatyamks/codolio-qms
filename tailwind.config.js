/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0f0f0f',
                    800: '#1a1a1a',
                    700: '#252525',
                    600: '#333333',
                    500: '#444444',
                },
                accent: {
                    primary: '#6366f1',
                    success: '#22c55e',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
