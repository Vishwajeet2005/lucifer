/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050505', blood: '#8B0000', hellfire: '#FF4500',
        ember: '#FF8C00', gold: '#D4AF37', pale: '#F5E6C8',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        'cinzel-deco': ['Cinzel Decorative', 'serif'],
        garamond: ['EB Garamond', 'serif'],
      },
    }
  },
  plugins: []
};
