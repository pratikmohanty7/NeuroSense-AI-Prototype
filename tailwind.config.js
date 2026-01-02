/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./Components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['"Share Tech Mono"', 'monospace'],
                sans: ['"Inter"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
