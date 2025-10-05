import './src/style.css';
import './src/ca.js';
import './src/app.js';

// Import logo so webpack emits it and updates references in HTML via html-loader
import logo from './logo.png';

// The original HTML uses <span id="account"> to show account; keep App on window
if (typeof window !== 'undefined') {
  window.App = window.App || {};
}

// export for potential tests
export { logo };
