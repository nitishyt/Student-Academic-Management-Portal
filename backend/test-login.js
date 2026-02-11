const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else if (error.request) {
      console.log('❌ Backend not responding. Is it running?');
      console.log('Run: cd backend && npm run dev');
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLogin();
