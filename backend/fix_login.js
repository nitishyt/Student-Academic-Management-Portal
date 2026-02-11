const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Student = require('./models/Student');
const User = require('./models/User');

const migrate = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find({});
        console.log(`Found ${students.length} students to check.`);

        for (const student of students) {
            let needsSave = false;
            const rollNo = student.rollNo;

            // 1. Ensure username/password fields exist in Student doc
            if (!student.username) {
                student.username = rollNo.toLowerCase();
                needsSave = true;
            }
            if (!student.password) {
                // Default password format: name + 123
                student.password = student.name.toLowerCase().replace(/\s+/g, '') + '123';
                needsSave = true;
            }
            if (!student.parentUsername) {
                student.parentUsername = 'parent_' + rollNo.toLowerCase();
                needsSave = true;
            }
            if (!student.parentPassword) {
                student.parentPassword = student.password;
                needsSave = true;
            }

            // Hash password for User account creation
            const passwordHash = await bcrypt.hash(student.password, 10);

            // 2. Link or Create Student User Account
            let studentUser = null;

            // First try to find by existing linkage
            if (student.userId) {
                studentUser = await User.findById(student.userId);
            }

            // If not linked, try to find by username
            if (!studentUser) {
                studentUser = await User.findOne({ username: student.username, role: 'student' });
            }

            // If user still doesn't exist, create it
            if (!studentUser) {
                console.log(`Creating new User account for student: ${rollNo}`);
                studentUser = new User({
                    username: student.username,
                    password: passwordHash,
                    role: 'student'
                });
                await studentUser.save();
            }

            // Update linkage if missing or incorrect
            if (!student.userId || student.userId.toString() !== studentUser._id.toString()) {
                student.userId = studentUser._id;
                needsSave = true;
                console.log(`Linking student ${rollNo} to user ${studentUser._id}`);
            }

            // 3. Create Parent User Account
            let parentUser = await User.findOne({ username: student.parentUsername, role: 'parent' });
            if (!parentUser) {
                console.log(`Creating new Parent account for: ${rollNo}`);
                parentUser = new User({
                    username: student.parentUsername,
                    password: passwordHash,
                    role: 'parent'
                });
                await parentUser.save();
            }

            if (needsSave) {
                await student.save();
                console.log(`Updated Student record for ${rollNo}`);
            } else {
                console.log(`Student ${rollNo} is already up to date.`);
            }
        }
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

migrate();
