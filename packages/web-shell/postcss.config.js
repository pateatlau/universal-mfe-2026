import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    '@tailwindcss/postcss': {
      base: path.resolve(__dirname, './src/styles.css'),
      // Specify content paths for Tailwind v4 to scan for classes
      content: [
        path.resolve(__dirname, './src/**/*.{js,jsx,ts,tsx}'),
        path.resolve(__dirname, '../shared-hello-ui/src/**/*.{js,jsx,ts,tsx}'),
        path.resolve(__dirname, './public/index.html'),
      ],
    },
    autoprefixer: {},
  },
};

