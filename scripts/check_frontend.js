import axios from 'axios';
(async () => {
  try {
    const url = 'http://localhost:5174/';
    const res = await axios.get(url, { timeout: 5000 });
    console.log('HTTP', res.status);
    const html = res.data || '';
    if (html.includes('Welcome to Student Portal Login')) console.log('FOUND LOGIN PAGE');
    else console.log('PAGE LOADED, content length:', html.length);
  } catch (e) {
    console.error('ERROR', e.message);
    process.exit(1);
  }
})();
