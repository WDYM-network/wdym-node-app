/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        font: 'Poppins',
        fontHeading: 'Poppins',
      },
      colors: {
        primary: '#428FEF ',
        secondary: '#FFA6FA',
        color: '#C6C5D0',
        colorOpacity: 'rgba(255,255,255,0.65)',
        heading: '#FFFFFF',
        dark: '#140C00',
        bg: '#000000',
        bgBox: 'rgba(19,19,19,0.8)',
        border: '#242424',
        borderOpacity: 'rgba(89,136,255,0.25)',
      },
      flex: {
        auto: '0 0 auto',
      },
      screens: {
        lg: '991px',
        // => @media (min-width: 991px) { ... }
      },
      backgroundImage: {
        banner: "url('/assets/images/new/circles.png')",
        leftImg: "url('/assets/images/new/bg-gradient-img.png')",
      },
    },
  },
  plugins: [],
};
