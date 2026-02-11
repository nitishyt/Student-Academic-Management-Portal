const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('./models/User');
const Student = require('./models/Student');

dotenv.config({ path: path.join(__dirname, '.env') });

const diagnose = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get a student
        const student = await Student.findOne();
        if (!student) {
            console.log('No students found.');
            return;
        }

        console.log(`Checking Student: ${student.name} (${student.rollNo})`);
        console.log(`Student.username: ${student.username}`);
        console.log(`Student.password (plain): ${student.password}`);

        // 2. Find User
        const user = await User.findOne({ username: student.username, role: 'student' });
        if (!user) {
            console.error('❌ User NOT found for this student!');
            return;
        }
        console.log(`User found. ID: ${user._id}`);
        console.log(`User.password (hash): ${user.password}`);

        // 3. Compare
        const isMatch = await bcrypt.compare(student.password, user.password);
        console.log(`bcrypt.compare result: ${isMatch}`);

        if (isMatch) {
            console.log('✅ Credential check PASSED.');
        } else {
            console.error('❌ Credential check FAILED.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

diagnose();
