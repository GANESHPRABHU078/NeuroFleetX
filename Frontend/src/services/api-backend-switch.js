// Small helper to select backend base URL based on env
const backendType = process.env.REACT_APP_BACKEND || 'java'; // 'node' or 'java'
const overrideUrl = process.env.REACT_APP_API_URL || '';

let baseUrl = '';
if (overrideUrl) {
  baseUrl = overrideUrl;
} else if (backendType === 'java') {
  baseUrl = 'http://localhost:8080';
} else {
  baseUrl = 'http://localhost:5000';
}

export default baseUrl;
