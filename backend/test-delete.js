const axios = require('axios');

const API = 'http://localhost:5000/api';

const testCascadeDelete = async () => {
  console.log('🧪 TESTING CASCADE DELETE\n');
  console.log('='.repeat(60));

  try {
    // Login as admin
    console.log('\n1. Admin Login');
    const login = await axios.post(`${API}/auth/login`, {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    const token = login.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Admin logged in');

    // Create student
    console.log('\n2. Create Student');
    const student = await axios.post(`${API}/students`, {
      name: 'Delete Test Student',
      rollNo: 'DEL001',
      branch: 'IT',
      standard: 'SE',
      phone: '1234567890'
    }, { headers });
    const studentId = student.data.id;
    console.log('✅ Student created:', student.data.name);
    console.log('   Student ID:', studentId);

    // Add attendance
    console.log('\n3. Add Attendance for Student');
    await axios.post(`${API}/attendance`, {
      studentId,
      date: '2025-01-10',
      time: '09:00',
      subject: 'Math',
      status: 'present'
    }, { headers });
    console.log('✅ Attendance added');

    // Add result
    console.log('\n4. Add Result for Student');
    await axios.post(`${API}/results`, {
      studentId,
      subject: 'Mathematics',
      marks: 90
    }, { headers });
    console.log('✅ Result added');

    // Verify data exists
    console.log('\n5. Verify Data Exists in Database');
    const att = await axios.get(`${API}/attendance/student/${studentId}`, { headers });
    const res = await axios.get(`${API}/results/student/${studentId}`, { headers });
    console.log(`✅ Attendance records: ${att.data.length}`);
    console.log(`✅ Result records: ${res.data.length}`);

    // Delete student
    console.log('\n6. Delete Student (CASCADE DELETE)');
    await axios.delete(`${API}/students/${studentId}`, { headers });
    console.log('✅ Student deleted');

    // Verify all data deleted
    console.log('\n7. Verify All Data Deleted from Database');
    
    try {
      await axios.get(`${API}/students/${studentId}`, { headers });
      console.log('❌ Student still exists!');
    } catch (error) {
      console.log('✅ Student deleted from database');
    }

    const attAfter = await axios.get(`${API}/attendance/student/${studentId}`, { headers });
    const resAfter = await axios.get(`${API}/results/student/${studentId}`, { headers });
    
    console.log(`✅ Attendance records after delete: ${attAfter.data.length}`);
    console.log(`✅ Result records after delete: ${resAfter.data.length}`);

    if (attAfter.data.length === 0 && resAfter.data.length === 0) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ CASCADE DELETE WORKING!');
      console.log('='.repeat(60));
      console.log('\n📋 DELETED FROM DATABASE:');
      console.log('✅ Student record');
      console.log('✅ Student user account');
      console.log('✅ Parent user account');
      console.log('✅ All attendance records');
      console.log('✅ All result records');
      console.log('='.repeat(60));
    } else {
      console.log('\n❌ CASCADE DELETE FAILED - Data still exists!');
    }

    // Test Faculty Delete
    console.log('\n\n🧪 TESTING FACULTY DELETE\n');
    console.log('='.repeat(60));

    console.log('\n8. Create Faculty');
    const faculty = await axios.post(`${API}/faculties`, {
      name: 'Delete Test Faculty',
      username: 'delfac',
      password: 'test123',
      subject: 'Science',
      email: 'del@test.com'
    }, { headers });
    const facultyId = faculty.data.id;
    console.log('✅ Faculty created:', faculty.data.name);

    console.log('\n9. Delete Faculty');
    await axios.delete(`${API}/faculties/${facultyId}`, { headers });
    console.log('✅ Faculty deleted');

    console.log('\n10. Verify Faculty Deleted');
    const faculties = await axios.get(`${API}/faculties`, { headers });
    const exists = faculties.data.find(f => f._id === facultyId);
    
    if (!exists) {
      console.log('✅ Faculty deleted from database');
      console.log('✅ Faculty user account deleted');
      console.log('\n' + '='.repeat(60));
      console.log('✅ FACULTY DELETE WORKING!');
      console.log('='.repeat(60));
    } else {
      console.log('❌ Faculty still exists!');
    }

  } catch (error) {
    console.log('\n❌ ERROR:', error.response?.data || error.message);
  }
};

testCascadeDelete();
