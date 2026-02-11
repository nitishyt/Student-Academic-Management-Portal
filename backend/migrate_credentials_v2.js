const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('./models/User');
const Student = require('./models/Student');

dotenv.config({ path: path.join(__dirname, '.env') });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const students = await Student.find();
        console.log(`Found ${students.length} students to migrate.`);

        for (const student of students) {
            if (!student.name || !student.rollNo || !student.branch) {
                console.warn(`Skipping student ${student._id}: Missing required fields.`);
                continue;
            }

            const firstName = student.name.split(' ')[0].toLowerCase();
            const rollNoStr = student.rollNo.toString().toLowerCase();
            const branchStr = student.branch.toLowerCase();

            const newUsername = firstName + rollNoStr;
            const newPassword = firstName + branchStr + rollNoStr;
            const newParentUsername = 'p' + newUsername;

            console.log(`Migrating ${student.name} (${student.rollNo}) -> User: ${newUsername}, Pass: ${newPassword}`);

            // 1. Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // 2. Update/Upsert Student User
            // Note: We need to find the OLD user first to update it, or create if missing.
            // Old username might be just rollNo (or customized).
            // We can try to find by `_id` matches `student.userId`.

            if (student.userId) {
                await User.findByIdAndUpdate(student.userId, {
                    username: newUsername,
                    password: hashedPassword,
                    role: 'student'
                });
            } else {
                // If no userId linked, create new User
                const newUser = new User({ username: newUsername, password: hashedPassword, role: 'student' });
                await newUser.save();
                student.userId = newUser._id;
            }

            // 3. Update/Upsert Parent User
            // We look for existing Parent User by `student.parentUsername`.
            if (student.parentUsername) {
                const parentUser = await User.findOne({ username: student.parentUsername, role: 'parent' });
                if (parentUser) {
                    parentUser.username = newParentUsername;
                    parentUser.password = hashedPassword;
                    await parentUser.save();
                } else {
                    // Create new
                    const newParent = new User({ username: newParentUsername, password: hashedPassword, role: 'parent' });
                    await newParent.save();
                }
            } else {
                // Create new
                const newParent = new User({ username: newParentUsername, password: hashedPassword, role: 'parent' });
                await newParent.save();
            }

            // 4. Update Student Document
            student.username = newUsername;
            student.password = newPassword; // Store plain text for reference as per existing pattern
            student.parentUsername = newParentUsername;
            student.parentPassword = newPassword;

            await student.save();
        }

        console.log('Migration completed successfully.');

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

migrate();
