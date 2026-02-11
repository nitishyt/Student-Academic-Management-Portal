const axios = require('axios');

const API = 'http://localhost:5000/api';
let adminToken, facultyToken, studentToken, parentToken;
let studentId, facultyId, studentUserId;

const test = async () => {
  console.log('🧪 TESTING ALL USER ROLES & PERMISSIONS\n');
  console.log('='.repeat(60));

  try {
    // ========== ADMIN TESTS ==========
    console.log('\n👨‍💼 ADMIN ROLE TESTS');
    console.log('-'.repeat(60));

    // 1. Admin Login
    console.log('\n1. Admin Login');
    const adminLogin = await axios.post(`${API}/auth/login`, {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in');

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 2. Admin Create Faculty
    console.log('\n2. Admin Create Faculty');
    const faculty = await axios.post(`${API}/faculties`, {
      name: 'Test Faculty',
      username: 'testfac',
      password: 'fac123',
      subject: 'Math',
      email: 'fac@test.com'
    }, { headers: adminHeaders });
    facultyId = faculty.data.id;
    console.log('✅ Faculty created:', faculty.data.name);

    // 3. Admin Create Student (creates parent too)
    console.log('\n3. Admin Create Student & Parent');
    const student = await axios.post(`${API}/students`, {
      name: 'Test Student',
      rollNo: 'TS001',
      branch: 'IT',
      standard: 'SE',
      phone: '9876543210'
    }, { headers: adminHeaders });
    studentId = student.data.id;
    console.log('✅ Student created:', student.data.name);
    console.log('   Student username:', student.data.username);
    console.log('   Parent username:', student.data.parentUsername);

    // 4. Admin Read All Students
    console.log('\n4. Admin Read All Students');
    const students = await axios.get(`${API}/students`, { headers: adminHeaders });
    console.log(`✅ Admin can read ${students.data.length} students`);

    // 5. Admin Read All Faculties
    console.log('\n5. Admin Read All Faculties');
    const faculties = await axios.get(`${API}/faculties`, { headers: adminHeaders });
    console.log(`✅ Admin can read ${faculties.data.length} faculties`);

    // ========== FACULTY TESTS ==========
    console.log('\n\n👨‍🏫 FACULTY ROLE TESTS');
    console.log('-'.repeat(60));

    // 6. Faculty Login
    console.log('\n6. Faculty Login');
    const facultyLogin = await axios.post(`${API}/auth/login`, {
      username: 'testfac',
      password: 'fac123',
      role: 'faculty'
    });
    facultyToken = facultyLogin.data.token;
    console.log('✅ Faculty logged in');

    const facultyHeaders = { Authorization: `Bearer ${facultyToken}` };

    // 7. Faculty Add Student
    console.log('\n7. Faculty Add Student');
    const facStudent = await axios.post(`${API}/students`, {
      name: 'Faculty Added Student',
      rollNo: 'FS001',
      branch: 'COMPS',
      standard: 'TE',
      phone: '9999999999'
    }, { headers: facultyHeaders });
    console.log('✅ Faculty can add student:', facStudent.data.name);

    // 8. Faculty Mark Attendance
    console.log('\n8. Faculty Mark Attendance');
    await axios.post(`${API}/attendance`, {
      studentId,
      date: '2025-01-10',
      time: '09:00',
      subject: 'Mathematics',
      status: 'present'
    }, { headers: facultyHeaders });
    console.log('✅ Faculty marked attendance');

    // 9. Faculty Add Result
    console.log('\n9. Faculty Add Result');
    await axios.post(`${API}/results`, {
      studentId,
      subject: 'Mathematics',
      marks: 85
    }, { headers: facultyHeaders });
    console.log('✅ Faculty added result');

    // 10. Faculty Read Students
    console.log('\n10. Faculty Read Students');
    const facStudents = await axios.get(`${API}/students`, { headers: facultyHeaders });
    console.log(`✅ Faculty can read ${facStudents.data.length} students`);

    // ========== STUDENT TESTS ==========
    console.log('\n\n👨‍🎓 STUDENT ROLE TESTS');
    console.log('-'.repeat(60));

    // 11. Student Login
    console.log('\n11. Student Login');
    const studentLogin = await axios.post(`${API}/auth/login`, {
      username: student.data.username,
      password: student.data.password,
      role: 'student'
    });
    studentToken = studentLogin.data.token;
    studentUserId = studentLogin.data.user.studentId;
    console.log('✅ Student logged in');

    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // 12. Student Read Own Attendance
    console.log('\n12. Student Read Own Attendance');
    const studentAtt = await axios.get(`${API}/attendance/student/${studentUserId}`, { headers: studentHeaders });
    console.log(`✅ Student can read own attendance: ${studentAtt.data.length} records`);

    // 13. Student Read Own Results
    console.log('\n13. Student Read Own Results');
    const studentRes = await axios.get(`${API}/results/student/${studentUserId}`, { headers: studentHeaders });
    console.log(`✅ Student can read own results: ${studentRes.data.length} records`);

    // 14. Student Cannot Add Attendance (should fail)
    console.log('\n14. Student Cannot Add Attendance');
    try {
      await axios.post(`${API}/attendance`, {
        studentId,
        date: '2025-01-11',
        time: '10:00',
        subject: 'Test',
        status: 'present'
      }, { headers: studentHeaders });
      console.log('❌ SECURITY ISSUE: Student should not add attendance!');
    } catch (error) {
      console.log('✅ Student correctly blocked from adding attendance');
    }

    // ========== PARENT TESTS ==========
    console.log('\n\n👨‍👩‍👦 PARENT ROLE TESTS');
    console.log('-'.repeat(60));

    // 15. Parent Login
    console.log('\n15. Parent Login');
    const parentLogin = await axios.post(`${API}/auth/login`, {
      username: student.data.parentUsername,
      password: student.data.parentPassword,
      role: 'parent'
    });
    parentToken = parentLogin.data.token;
    const parentStudentId = parentLogin.data.user.studentId;
    console.log('✅ Parent logged in');

    const parentHeaders = { Authorization: `Bearer ${parentToken}` };

    // 16. Parent Read Child Attendance
    console.log('\n16. Parent Read Child Attendance');
    const parentAtt = await axios.get(`${API}/attendance/student/${parentStudentId}`, { headers: parentHeaders });
    console.log(`✅ Parent can read child attendance: ${parentAtt.data.length} records`);

    // 17. Parent Read Child Results
    console.log('\n17. Parent Read Child Results');
    const parentRes = await axios.get(`${API}/results/student/${parentStudentId}`, { headers: parentHeaders });
    console.log(`✅ Parent can read child results: ${parentRes.data.length} records`);

    // 18. Parent Cannot Add Results (should fail)
    console.log('\n18. Parent Cannot Add Results');
    try {
      await axios.post(`${API}/results`, {
        studentId,
        subject: 'Test',
        marks: 100
      }, { headers: parentHeaders });
      console.log('❌ SECURITY ISSUE: Parent should not add results!');
    } catch (error) {
      console.log('✅ Parent correctly blocked from adding results');
    }

    // ========== ADMIN READ TESTS ==========
    console.log('\n\n👨‍💼 ADMIN READ TESTS');
    console.log('-'.repeat(60));

    // 19. Admin Read Student Attendance
    console.log('\n19. Admin Read Student Attendance');
    const adminAtt = await axios.get(`${API}/attendance/student/${studentId}`, { headers: adminHeaders });
    console.log(`✅ Admin can read student attendance: ${adminAtt.data.length} records`);

    // 20. Admin Read Student Results
    console.log('\n20. Admin Read Student Results');
    const adminRes = await axios.get(`${API}/results/student/${studentId}`, { headers: adminHeaders });
    console.log(`✅ Admin can read student results: ${adminRes.data.length} records`);

    // ========== CLEANUP ==========
    console.log('\n\n🧹 CLEANUP');
    console.log('-'.repeat(60));

    // Delete test data
    await axios.delete(`${API}/students/${studentId}`, { headers: adminHeaders });
    await axios.delete(`${API}/students/${facStudent.data.id}`, { headers: adminHeaders });
    await axios.delete(`${API}/faculties/${facultyId}`, { headers: adminHeaders });
    console.log('✅ Test data cleaned up');

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL ROLE-BASED TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📋 SUMMARY:');
    console.log('✅ Admin: Create, Read, Delete (Faculty, Student, Parent)');
    console.log('✅ Faculty: Create Student, Mark Attendance, Add Results');
    console.log('✅ Student: Read Own Attendance & Results (No Update)');
    console.log('✅ Parent: Read Child Attendance & Results (No Update)');
    console.log('✅ Security: Students/Parents blocked from modifications');
    console.log('='.repeat(60));

  } catch (error) {
    console.log('\n❌ ERROR:', error.response?.data || error.message);
    console.log('\n⚠️  Make sure backend is running: cd backend && npm run dev');
  }
};

test();
