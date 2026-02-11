const axios = require('axios');

const API = 'http://localhost:5000/api';
let token = '';
let studentId = '';
let facultyId = '';

const test = async () => {
  console.log('🧪 Testing All CRUD Operations with MongoDB\n');
  console.log('='.repeat(50));

  try {
    // 1. LOGIN (READ)
    console.log('\n1️⃣ Testing LOGIN (READ from users collection)');
    const loginRes = await axios.post(`${API}/auth/login`, {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    token = loginRes.data.token;
    console.log('✅ Login successful - Token received');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. CREATE STUDENT
    console.log('\n2️⃣ Testing CREATE STUDENT (INSERT to students & users)');
    const studentRes = await axios.post(`${API}/students`, {
      name: 'Test Student',
      rollNo: 'TEST001',
      branch: 'IT',
      standard: 'SE',
      phone: '9876543210'
    }, { headers });
    studentId = studentRes.data.id;
    console.log('✅ Student created:', studentRes.data.name);
    console.log('   Username:', studentRes.data.username);
    console.log('   Password:', studentRes.data.password);

    // 3. READ ALL STUDENTS
    console.log('\n3️⃣ Testing READ ALL STUDENTS (SELECT from students)');
    const studentsRes = await axios.get(`${API}/students`, { headers });
    console.log(`✅ Found ${studentsRes.data.length} students in database`);

    // 4. READ ONE STUDENT
    console.log('\n4️⃣ Testing READ ONE STUDENT (SELECT by ID)');
    const oneStudentRes = await axios.get(`${API}/students/${studentId}`, { headers });
    console.log('✅ Student details:', oneStudentRes.data.name);

    // 5. CREATE FACULTY
    console.log('\n5️⃣ Testing CREATE FACULTY (INSERT to faculties & users)');
    const facultyRes = await axios.post(`${API}/faculties`, {
      name: 'Test Faculty',
      username: 'testfaculty',
      password: 'test123',
      subject: 'Mathematics',
      email: 'test@faculty.com'
    }, { headers });
    facultyId = facultyRes.data.id;
    console.log('✅ Faculty created:', facultyRes.data.name);

    // 6. READ ALL FACULTIES
    console.log('\n6️⃣ Testing READ ALL FACULTIES (SELECT from faculties)');
    const facultiesRes = await axios.get(`${API}/faculties`, { headers });
    console.log(`✅ Found ${facultiesRes.data.length} faculties in database`);

    // 7. CREATE ATTENDANCE
    console.log('\n7️⃣ Testing CREATE ATTENDANCE (INSERT to attendances)');
    await axios.post(`${API}/attendance`, {
      studentId,
      date: '2025-01-10',
      time: '09:00',
      subject: 'Math',
      status: 'present'
    }, { headers });
    console.log('✅ Attendance marked');

    // 8. READ ATTENDANCE
    console.log('\n8️⃣ Testing READ ATTENDANCE (SELECT from attendances)');
    const attendanceRes = await axios.get(`${API}/attendance/student/${studentId}`, { headers });
    console.log(`✅ Found ${attendanceRes.data.length} attendance records`);

    // 9. CREATE RESULT
    console.log('\n9️⃣ Testing CREATE RESULT (INSERT to results)');
    await axios.post(`${API}/results`, {
      studentId,
      subject: 'Mathematics',
      marks: 85
    }, { headers });
    console.log('✅ Result added');

    // 10. READ RESULTS
    console.log('\n🔟 Testing READ RESULTS (SELECT from results)');
    const resultsRes = await axios.get(`${API}/results/student/${studentId}`, { headers });
    console.log(`✅ Found ${resultsRes.data.length} results`);

    // 11. DELETE FACULTY
    console.log('\n1️⃣1️⃣ Testing DELETE FACULTY (DELETE from faculties & users)');
    await axios.delete(`${API}/faculties/${facultyId}`, { headers });
    console.log('✅ Faculty deleted from database');

    // 12. DELETE STUDENT
    console.log('\n1️⃣2️⃣ Testing DELETE STUDENT (DELETE from students & users)');
    await axios.delete(`${API}/students/${studentId}`, { headers });
    console.log('✅ Student deleted from database');

    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL CRUD OPERATIONS WORKING WITH MONGODB!');
    console.log('='.repeat(50));

  } catch (error) {
    console.log('\n❌ ERROR:', error.response?.data || error.message);
    console.log('\n⚠️  Make sure backend is running: cd backend && npm run dev');
  }
};

test();
