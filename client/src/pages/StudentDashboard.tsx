import React, { useState } from 'react';
import { BookOpen, Clock, Trophy, User, Settings, LogOut, Eye, Shield } from 'lucide-react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('exams');

  // Mock student data
  const studentData = {
    name: "John Doe",
    email: "john.doe@student.edu",
    studentId: "STU2024001",
    program: "Computer Science",
    year: "3rd Year"
  };

  // Mock exams data
  const exams = [
    {
      id: 1,
      title: "Mathematics Final Exam",
      course: "MATH 101",
      duration: 90,
      questions: 20,
      maxScore: 100,
      status: "active",
      deadline: "2024-01-15"
    },
    {
      id: 2,
      title: "Physics Midterm",
      course: "PHYS 201",
      duration: 60,
      questions: 15,
      maxScore: 75,
      status: "upcoming",
      deadline: "2024-01-20"
    },
    {
      id: 3,
      title: "Chemistry Quiz",
      course: "CHEM 150",
      duration: 45,
      questions: 10,
      maxScore: 50,
      status: "completed",
      deadline: "2024-01-10",
      score: 42
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Completed Mathematics Exam",
      score: "85%",
      time: "2 hours ago"
    },
    {
      id: 2,
      action: "Started Physics Practice Test",
      score: "In Progress",
      time: "1 day ago"
    },
    {
      id: 3,
      action: "Viewed Exam Schedule",
      score: "",
      time: "2 days ago"
    }
  ];

  const stats = {
    totalExams: 12,
    completedExams: 8,
    averageScore: 87,
    upcomingExams: 3
  };

  const renderExamsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold">{stats.totalExams}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats.completedExams}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold">{stats.upcomingExams}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Available Exams</h2>
        </div>
        <div className="divide-y">
          {exams.map((exam) => (
            <div key={exam.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{exam.title}</h3>
                  <p className="text-gray-600">{exam.course}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{exam.duration} minutes</span>
                    <span className="mx-2">•</span>
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{exam.questions} questions</span>
                    <span className="mx-2">•</span>
                    <Trophy className="h-4 w-4 mr-1" />
                    <span>Max: {exam.maxScore} points</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    exam.status === 'active' ? 'bg-green-100 text-green-800' :
                    exam.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </span>
                  {exam.score && (
                    <div className="mt-2 text-sm font-medium text-gray-900">
                      Score: {exam.score}/{exam.maxScore}
                    </div>
                  )}
                </div>
              </div>
              
              {exam.status === 'active' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => window.location.href = `/student/exam-camera`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Start Exam with Camera
                  </button>
                  <button
                    onClick={() => window.location.href = `/student/exam`}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium transition-all flex items-center justify-center"
                  >
                    Practice Mode
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center mb-6">
          <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mr-4">
            <User className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{studentData.name}</h2>
            <p className="text-gray-600">{studentData.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student ID</label>
              <p className="mt-1 text-gray-900">{studentData.studentId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Program</label>
              <p className="mt-1 text-gray-900">{studentData.program}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <p className="mt-1 text-gray-900">{studentData.year}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-gray-900">September 2021</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  {activity.score && (
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.score.includes('%') ? (
                        <span className="text-green-600 font-medium">{activity.score}</span>
                      ) : activity.score}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">Student Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{studentData.name}</p>
                <p className="text-xs text-gray-500">{studentData.program}</p>
              </div>
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'exams', label: 'Exams', icon: BookOpen },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'activity', label: 'Activity', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'exams' && renderExamsTab()}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'activity' && renderActivityTab()}
      </main>
    </div>
  );
};

export default StudentDashboard;