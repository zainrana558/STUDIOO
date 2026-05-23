import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                'space-grotesk':   ['var(--font-space-grotesk)',   'sans-serif'],
                'fredoka-one':     ['var(--font-fredoka-one)',     'sans-serif'],
                'creepster':       ['var(--font-creepster)',       'serif'],
                'orbitron':        ['var(--font-orbitron)',        'sans-serif'],
                'playfair-display':['var(--font-playfair-display)','serif'],
            },
            lineClamp: { 3: '3', 4: '4', 5: '5' },
        },
    },
    plugins: [
        // scrollbar-hide utility
        plugin(({ addUtilities }) => {
            addUtilities({
                '.scrollbar-hide': {
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                },
            });
        }),
    ],
};
export default config;
