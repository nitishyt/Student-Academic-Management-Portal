const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
require('dotenv').config();

const diagnose = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find({});
        console.log(`Found ${students.length} students`);

        for (const s of students) {
            console.log(`\nChecking student: ${s.name} (${s.rollNo})`);
            console.log(`  Student Doc userId: ${s.userId}`);

            if (s.userId) {
                const u = await User.findById(s.userId);
                console.log(`  Linked User found: ${u ? 'YES' : 'NO'}`);
                if (u) console.log(`    User username: ${u.username}, role: ${u.role}`);
            }

            // Check if User exists by username (rollNo)
            const expectedUsername = s.rollNo.toLowerCase();
            const uByName = await User.findOne({ username: expectedUsername });
            console.log(`  User with username '${expectedUsername}': ${uByName ? 'FOUND' : 'MISSING'}`);
            if (uByName) {
                console.log(`    User ID: ${uByName._id}`);
                if (s.userId && s.userId.toString() !== uByName._id.toString()) {
                    console.log(`    MISMATCH! Student userId ${s.userId} != User _id ${uByName._id}`);
                } else if (!s.userId) {
                    console.log(`    Student has no userId, but User exists. needs linking.`);
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

diagnose();
