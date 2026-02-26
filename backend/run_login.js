const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { username:'admin', password:'admin123', role:'admin' }, { headers: {'Content-Type':'application/json'} });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    if (e.response) console.error('ERROR', e.response.status, JSON.stringify(e.response.data));
    else console.error(e.message);
    process.exit(1);
  }
})();
