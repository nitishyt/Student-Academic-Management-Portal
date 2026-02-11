const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Student = require('./models/Student');

dotenv.config({ path: path.join(__dirname, '.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const student = await Student.findOne();
        let output = '';
        if (student) {
            output += `Name: ${student.name}\n`;
            output += `RollNo: ${student.rollNo}\n`;
            output += `Username: ${student.username}\n`;
            output += `Password: ${student.password}\n`;
            output += `ParentUsername: ${student.parentUsername}\n`;
        } else {
            output = 'No student found';
        }
        await mongoose.disconnect();
        fs.writeFileSync('verification_result.txt', output);
        console.log('Result written to verification_result.txt');
    } catch (e) {
        fs.writeFileSync('verification_result.txt', 'Error: ' + e.message);
    }
};

verify();
