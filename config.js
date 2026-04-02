const config = {
  apiUrl: window.location.hostname === 'rakotee.site' 
    ? 'https://api.rakotee.site'
    : 'http://localhost:5000',
};

export default config;