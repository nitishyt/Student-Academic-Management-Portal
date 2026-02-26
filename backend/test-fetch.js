require('dotenv').config();
const axios = require('axios');

async function test() {
  try {
    console.log('1️⃣  Logging in as admin...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Got token:', token.substring(0, 20) + '...');
    
    console.log('\n2️⃣  Fetching students...');
    const studentsRes = await axios.get('http://localhost:5000/api/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Students fetched:', studentsRes.data.length, 'found\n');
    studentsRes.data.forEach((s, i) => {
      console.log(`${i+1}. ${s.name} (Roll: ${s.rollNo}, Branch: ${s.branch})`);
    });
  } catch (e) {
    console.error('❌ Error:', e.response?.data || e.message);
  }
  process.exit(0);
}

test();
