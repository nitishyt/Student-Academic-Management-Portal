import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';
import { studentData } from '../utils/studentData';

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [student, setStudent] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // QR scan states
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [loginCred, setLoginCred] = useState({ username: '', password: '' });

  const navigate = useNavigate();
  const currentStudentId = auth.getCurrentStudentId();

  // Load student data on component mount
  useEffect(() => {
    if (currentStudentId) {
      loadStudentData();
    }
  }, [currentStudentId]);

  // Load all student data
  const loadStudentData = async () => {
    try {
      setLoading(true);
      const studentInfo = await studentData.getStudentById(currentStudentId);
      setStudent(studentInfo);

      if (studentInfo) {
        await calculateAttendanceStats();
        await loadResults();
      }
    } catch (error) {
      alert('Error loading student data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = async () => {
    try {
      const attendance = await studentData.getAttendance(currentStudentId);
      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const total = attendance.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      setAttendanceStats({ present, absent, total, percentage });
    } catch (error) {
      console.error('Error calculating attendance:', error);
      setAttendanceStats({ present: 0, absent: 0, total: 0, percentage: 0 });
    }
  };

  // Load student results
  const loadResults = async () => {
    try {
      const studentResults = await studentData.getResults(currentStudentId);
      setResults(studentResults || []);
    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]);
    }
  };

  // Handle logout
  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  // Handle section change
  const showSection = (section) => {
    setActiveSection(section);
    loadStudentData();
  };

  // QR scanner setup and cleanup
  useEffect(() => {
    if (showScanner) {
      const { Html5QrcodeScanner } = require('html5-qrcode');
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
      scanner.render(
        (decodedText) => {
          setScanResult(decodedText);
          setShowScanner(false);
          scanner.clear().catch(() => {});
        },
        (error) => {
          console.warn('QR scan error', error);
        }
      );
      return () => scanner.clear().catch(() => {});
    }
  }, [showScanner]);

  const submitScan = async () => {
    if (!scanResult) return alert('No QR code entered');
    if (!loginCred.username || !loginCred.password) return alert('Enter username/password');
    try {
      const resp = await studentData.scanQRCode({ code: scanResult, username: loginCred.username, password: loginCred.password });
      alert(resp.message || 'Attendance marked');
      setScanResult('');
      setLoginCred({ username: '', password: '' });
      await calculateAttendanceStats();
    } catch (err) {
      alert('Scan failed: ' + (err.response?.data?.error || err.message));
    }
  };
  // Get grade class for result
  const getGradeClass = (marks) => {
    if (marks >= 90) return 'excellent';
    if (marks >= 75) return 'good';
    if (marks >= 60) return 'average';
    return 'poor';
  };

  if (loading || !student) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="header" style={{ background: '#667eea' }}>
        <h1>Student Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{ padding: '10px 20px', background: 'white', color: '#667eea', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      <div className="nav">
        <button
          onClick={() => showSection('profile')}
          className={activeSection === 'profile' ? 'active' : ''}
          style={{ background: '#667eea' }}
        >
          Profile
        </button>
        <button
          onClick={() => showSection('attendance')}
          className={activeSection === 'attendance' ? 'active' : ''}
          style={{ background: '#667eea' }}
        >
          Attendance
        </button>
        <button
          onClick={() => showSection('results')}
          className={activeSection === 'results' ? 'active' : ''}
          style={{ background: '#667eea' }}
        >
          Results
        </button>
      </div>

      <div className="content">
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div>
            <h2>My Profile</h2>
            <div className="info-card">
              <h3>{student.name}</h3>
              <p><strong>Roll Number:</strong> {student.rollNo}</p>
              <p><strong>Branch:</strong> {student.branch}</p>
              <p><strong>Standard:</strong> {student.standard}</p>
              <p><strong>Phone:</strong> {student.phone}</p>
            </div>
          </div>
        )}

        {/* Attendance Section */}
        {activeSection === 'attendance' && (
          <div>
            <h2>My Attendance</h2>
            <div className="attendance-summary">
              <div className="stat-card">
                <h3>{attendanceStats.percentage}%</h3>
                <p>Attendance Rate</p>
              </div>
              <div className="stat-card">
                <h3>{attendanceStats.present}</h3>
                <p>Present Days</p>
              </div>
              <div className="stat-card">
                <h3>{attendanceStats.absent}</h3>
                <p>Absent Days</p>
              </div>
              <div className="stat-card">
                <h3>{attendanceStats.total}</h3>
                <p>Total Days</p>
              </div>
            </div>

            {/* QR Section */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <h3>Mark Attendance via QR Code</h3>
              {!scanResult && (
                <>
                  <button
                    onClick={() => setShowScanner(true)}
                    style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Scan with Camera
                  </button>
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.85em', color: '#555' }}>Or paste the code below:</p>
                    <input
                      type="text"
                      value={scanResult}
                      onChange={(e) => setScanResult(e.target.value)}
                      placeholder="Paste QR token here"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </>
              )}
              {showScanner && (
                <div id="qr-reader" style={{ width: '300px', margin: '20px auto' }}></div>
              )}
              {scanResult && (
                <div style={{ marginTop: '20px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                  <p><strong>Scanned token:</strong> {scanResult}</p>
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginCred.username}
                    onChange={(e) => setLoginCred({ ...loginCred, username: e.target.value })}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginCred.password}
                    onChange={(e) => setLoginCred({ ...loginCred, password: e.target.value })}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button
                    onClick={submitScan}
                    style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
                  >
                    Submit Attendance
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {activeSection === 'results' && (
          <div>
            <h2>My Results</h2>
            {results.length === 0 ? (
              <div className="info-card">
                <p>No results available yet.</p>
              </div>
            ) : (
              <div>
                <div className="info-card">
                  <h3>Overall Performance</h3>
                  <p><strong>Average Score:</strong> {Math.round(results.reduce((sum, r) => sum + r.marks, 0) / results.length)}/100</p>
                  <p><strong>Total Subjects:</strong> {results.length}</p>
                </div>

                {results.map((result, index) => (
                  <div key={result._id || result.id || index} className="result-item">
                    <div>
                      <h4>{result.subject}</h4>
                      <small>Date: {new Date(result.createdAt).toLocaleDateString()}</small>
                      {(result.pdfFilename || result.fileName) && (
                        <div>
                          <a href={result.pdfFile || result.fileData} download={result.pdfFilename || result.fileName} style={{ color: '#667eea', textDecoration: 'none' }}>📄 {result.pdfFilename || result.fileName}</a>
                        </div>
                      )}
                    </div>
                    <div className={`grade ${getGradeClass(result.marks)}`}>
                      {result.marks}/100
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;