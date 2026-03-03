/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-dark': '#0f1115',
                'bg-card': '#161b22',
                'bg-sidebar': '#0d0f12',
                'accent-primary': '#f43f5e',
                'text-main': '#f3f4f6',
                'text-muted': '#9ca3af',
                'border-color': '#30363d',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
