const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth/login';

const testLogin = async () => {
    try {
        // 1. Valid Student Login (from verify_parent_login or diagnose)
        // We need a known username. I'll guess one or fetch from DB?
        // I'll fetch from DB using mongoose first to get a valid user only for testing.

        // Actually, I can't easily mix mongoose and axios in one script if I want to be fast and not rely on local deps too much if they adhere to different contexts?
        // But I'm in backend folder.

        const mongoose = require('mongoose');
        const User = require('./models/User');
        const dotenv = require('dotenv');
        const path = require('path');
        dotenv.config({ path: path.join(__dirname, '.env') });

        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ role: 'student' });

        if (!user) {
            console.log('No student user found in DB to test.');
            await mongoose.disconnect();
            return;
        }

        console.log(`Testing Login for User: ${user.username} (Role: ${user.role})`);

        // We don't know the plain password!
        // But wait, the student password is 'name without spaces + 123'.
        // Or I can reset it?
        // Or I can try to login with a known FAIL.

        // If I send WRONG password, I should get 401.
        // If I get 500 or Network Error, then API is broken.
        // If I get 401, then API IS WORKING.

        try {
            const res = await axios.post(API_URL, {
                username: user.username,
                password: 'WRONG_PASSWORD_TEST',
                role: user.role
            });
            console.log('Response:', res.status, res.data);
        } catch (e) {
            if (e.response) {
                console.log('✅ API Responded with Error (Expected):', e.response.status, e.response.data);
            } else {
                console.error('❌ API Network Error/No Response:', e.message);
            }
        }

        await mongoose.disconnect();

    } catch (err) {
        console.error('Script Error:', err);
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    }
};

testLogin();
