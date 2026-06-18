import axios from 'axios';

// Set this to true to enable fully interactive local mock mode without backend connection
export const USE_MOCK = true;

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── MOCK DATABASE ENGINE ──

const getList = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const saveList = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const seedDatabase = () => {
  if (!localStorage.getItem('cm_users')) {
    const defaultUsers = [
      { _id: 'u1', name: 'Rekha Gupta', email: 'cm@delhi.gov.in', role: 'cm', designation: 'Chief Minister', department: null, active: true },
      { _id: 'u2', name: 'Alok Sharma', email: 'admin@delhi.gov.in', role: 'super_admin', designation: 'Director of Grievances', department: null, active: true },
      { _id: 'u3', name: 'Rajesh Kumar', email: 'dh.roads@delhi.gov.in', role: 'department_head', designation: 'Chief Engineer', department: { _id: 'd1', name: 'Roads & Highways' }, active: true },
      { _id: 'u4', name: 'Sunil Dutt', email: 'officer1@delhi.gov.in', role: 'employee', designation: 'Assistant Engineer', department: { _id: 'd1', name: 'Roads & Highways' }, bandwidth: 10, activeComplaints: 3, stats: { totalAssigned: 15, totalResolved: 12, avgResolutionHours: 28, falseClosures: 0, avgSatisfactionScore: 4.5 }, active: true },
      { _id: 'u5', name: 'Priya Narang', email: 'officer2@delhi.gov.in', role: 'employee', designation: 'Field Inspector', department: { _id: 'd2', name: 'Water & Sewage' }, bandwidth: 15, activeComplaints: 2, stats: { totalAssigned: 20, totalResolved: 18, avgResolutionHours: 18, falseClosures: 1, avgSatisfactionScore: 4.2 }, active: true },
      { _id: 'u6', name: 'Amit Verma', email: 'dh.water@delhi.gov.in', role: 'department_head', designation: 'Superintending Engineer', department: { _id: 'd2', name: 'Water & Sewage' }, active: true },
      { _id: 'u7', name: 'Rakesh Citizen', email: 'citizen1@example.com', role: 'citizen', phone: '+91 9999911111', ward: 'Dwarka Sec 12', district: 'South West Delhi', active: true }
    ];
    saveList('cm_users', defaultUsers);
  }

  if (!localStorage.getItem('cm_departments')) {
    const defaultDepts = [
      { _id: 'd1', name: 'Roads & Highways', head: 'Rajesh Kumar', active: true },
      { _id: 'd2', name: 'Water & Sewage', head: 'Amit Verma', active: true },
      { _id: 'd3', name: 'Power & Electricity', head: 'Unassigned', active: true },
      { _id: 'd4', name: 'Sanitation', head: 'Unassigned', active: true }
    ];
    saveList('cm_departments', defaultDepts);
  }

  if (!localStorage.getItem('cm_complaints')) {
    const defaultComplaints = [
      {
        _id: 'c1',
        ticketId: 'CMG-2026-0001',
        title: 'Massive pothole on Outer Ring Road near IIT Flyover',
        description: 'A deep pothole has formed right under the IIT flyover on the Outer Ring Road. It causes severe traffic congestion and has already caused two minor motorcycle accidents in the past 24 hours.',
        category: 'roads',
        priority: 'critical',
        status: 'assigned',
        address: 'Outer Ring Road, under IIT Flyover, New Delhi',
        latitude: 28.5457,
        longitude: 77.1928,
        image: null,
        citizen: { _id: 'u7', name: 'Rakesh Citizen' },
        assignedTo: { _id: 'u4', name: 'Sunil Dutt' },
        department: { _id: 'd1', name: 'Roads & Highways' },
        upvotes: 42,
        upvotedBy: [],
        dueDate: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        criticalReason: 'High Traffic Area & Accident History',
        updates: []
      },
      {
        _id: 'c2',
        ticketId: 'CMG-2026-0002',
        title: 'Contaminated water supply in Dwarka Sector 12',
        description: 'For the last 3 days, the tap water supplied to block C has been brownish and smelling like sewage. We suspect a leakage in the water pipeline mixed with sewage line.',
        category: 'water',
        priority: 'high',
        status: 'in_progress',
        address: 'Sector 12, Dwarka, New Delhi',
        latitude: 28.5921,
        longitude: 77.0460,
        image: null,
        citizen: { _id: 'u7', name: 'Rakesh Citizen' },
        assignedTo: { _id: 'u5', name: 'Priya Narang' },
        department: { _id: 'd2', name: 'Water & Sewage' },
        upvotes: 18,
        upvotedBy: [],
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updates: []
      },
      {
        _id: 'c3',
        ticketId: 'CMG-2026-0003',
        title: 'Streetlights not working in Lajpat Nagar II market',
        description: 'Entire row of streetlights along the main market road is defunct. It makes the market unsafe for women and shoppers after dark.',
        category: 'power',
        priority: 'medium',
        status: 'submitted',
        address: 'Central Market, Lajpat Nagar II, New Delhi',
        latitude: 28.5682,
        longitude: 77.2435,
        image: null,
        citizen: { _id: 'u7', name: 'Rakesh Citizen' },
        assignedTo: null,
        department: null,
        upvotes: 27,
        upvotedBy: [],
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updates: []
      },
      {
        _id: 'c4',
        ticketId: 'CMG-2026-0004',
        title: 'Garbage dump pile-up near Connaught Place Block H',
        description: 'Municipal waste hasn\'t been cleared for a week. Huge pile is blocking the pedestrian footpath and attracting stray animals.',
        category: 'sanitation',
        priority: 'low',
        status: 'resolved',
        address: 'H-Block, Connaught Place, New Delhi',
        latitude: 28.6299,
        longitude: 77.2205,
        image: null,
        citizen: { _id: 'u7', name: 'Rakesh Citizen' },
        assignedTo: { _id: 'u5', name: 'Priya Narang' },
        department: { _id: 'd2', name: 'Water & Sewage' },
        upvotes: 5,
        upvotedBy: [],
        resolvedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        feedbackRating: 5,
        feedbackText: 'Cleaned up completely. Thanks!',
        updates: []
      }
    ];
    saveList('cm_complaints', defaultComplaints);
  }

  if (!localStorage.getItem('cm_comments')) {
    const defaultComments = [
      {
        _id: 'co1',
        complaint: 'c1',
        user: { _id: 'u4', name: 'Sunil Dutt', role: 'employee' },
        text: 'Inspected the site. The potholes are indeed deep. Arranged a road repair crew to patch this up tonight.',
        isInternal: false,
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: 'co2',
        complaint: 'c1',
        user: { _id: 'u3', name: 'Rajesh Kumar', role: 'department_head' },
        text: 'Note: Use high-strength concrete because this is a heavy traffic corridor.',
        isInternal: true,
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      }
    ];
    saveList('cm_comments', defaultComments);
  }

  if (!localStorage.getItem('cm_notifications')) {
    const defaultNotifications = [
      {
        _id: 'n1',
        type: 'critical_complaint',
        title: 'New Critical Complaint',
        message: 'Massive pothole on Outer Ring Road near IIT Flyover has been flagged critical by AI.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 3600).toISOString(),
        complaint: { _id: 'c1' }
      },
      {
        _id: 'n2',
        type: 'new_assignment',
        title: 'Task Assigned',
        message: 'Contaminated water supply in Dwarka Sector 12 has been assigned to you.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 7200).toISOString(),
        complaint: { _id: 'c2' }
      }
    ];
    saveList('cm_notifications', defaultNotifications);
  }

  if (!localStorage.getItem('cm_visits')) {
    const defaultVisits = [
      {
        _id: 'v1',
        complaint: { _id: 'c1', title: 'Massive pothole on Outer Ring Road near IIT Flyover', ticketId: 'CMG-2026-0001' },
        officer: { _id: 'u4', name: 'Sunil Dutt' },
        status: 'scheduled',
        scheduledDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        logs: [
          { text: 'Visit scheduled by Department Head', time: new Date(Date.now() - 12 * 3600 * 1000).toISOString() }
        ]
      }
    ];
    saveList('cm_visits', defaultVisits);
  }

  if (!localStorage.getItem('cm_audit_logs')) {
    const defaultAudit = [
      {
        _id: 'a1',
        action: 'complaint_created',
        performedBy: { name: 'Rakesh Citizen', role: 'citizen' },
        details: { ticketId: 'CMG-2026-0001' },
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      },
      {
        _id: 'a2',
        action: 'status_updated',
        performedBy: { name: 'Sunil Dutt', role: 'employee' },
        details: { ticketId: 'CMG-2026-0001', oldStatus: 'submitted', newStatus: 'assigned' },
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
      }
    ];
    saveList('cm_audit_logs', defaultAudit);
  }
};

// Seed db right away
seedDatabase();

const wait = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// ── Auth mock ──

export const login = async (data) => {
  if (USE_MOCK) {
    await wait();
    const users = getList('cm_users');
    const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user) {
      throw { response: { status: 400, data: { message: 'Invalid credentials. User not found.' } } };
    }
    localStorage.setItem('token', 'mock-token-' + user._id);
    return { data: { token: 'mock-token-' + user._id, user } };
  }
  return API.post('/auth/login', data);
};

export const register = async (data) => {
  if (USE_MOCK) {
    await wait();
    const users = getList('cm_users');
    const newUser = {
      _id: 'u_' + Date.now(),
      name: data.name,
      email: data.email,
      role: 'citizen',
      phone: data.phone || '',
      ward: data.ward || '',
      district: data.district || '',
      active: true
    };
    users.push(newUser);
    saveList('cm_users', users);
    localStorage.setItem('token', 'mock-token-' + newUser._id);
    return { data: { token: 'mock-token-' + newUser._id, user: newUser } };
  }
  return API.post('/auth/register', data);
};

export const getMe = async () => {
  if (USE_MOCK) {
    await wait(200);
    const token = localStorage.getItem('token');
    if (!token || !token.startsWith('mock-token-')) {
      throw { response: { status: 401, data: { message: 'Not authenticated' } } };
    }
    const userId = token.replace('mock-token-', '');
    const users = getList('cm_users');
    const user = users.find(u => u._id === userId);
    if (!user) {
      throw { response: { status: 401, data: { message: 'User not found' } } };
    }
    return { data: { user } };
  }
  return API.get('/auth/me');
};

export const updateProfile = async (data) => {
  if (USE_MOCK) {
    await wait();
    const token = localStorage.getItem('token');
    const userId = token.replace('mock-token-', '');
    const users = getList('cm_users');
    const userIndex = users.findIndex(u => u._id === userId);
    if (userIndex === -1) throw { response: { status: 404 } };
    users[userIndex] = { ...users[userIndex], ...data };
    saveList('cm_users', users);
    return { data: { user: users[userIndex] } };
  }
  return API.put('/auth/profile', data);
};

export const changePassword = async (data) => {
  if (USE_MOCK) {
    await wait();
    return { data: { message: 'Password changed successfully' } };
  }
  return API.put('/auth/change-password', data);
};

// ── Complaints mock ──

export const submitComplaint = async (data) => {
  if (USE_MOCK) {
    await wait(800);
    const complaints = getList('cm_complaints');
    const token = localStorage.getItem('token');
    const userId = token ? token.replace('mock-token-', '') : 'u7';
    const users = getList('cm_users');
    const currentUser = users.find(u => u._id === userId) || users[6];

    const ticketId = 'CMG-2026-' + String(complaints.length + 1).padStart(4, '0');
    
    // Auto priority based on keywords for AI Classification feel
    let priority = 'medium';
    let isCritical = false;
    let criticalReason = '';
    const text = (data.title + ' ' + data.description).toLowerCase();
    if (text.includes('accident') || text.includes('injury') || text.includes('danger') || text.includes('overflow') || text.includes('burst')) {
      priority = 'critical';
      isCritical = true;
      criticalReason = 'AI Detected Urgent Hazard';
    } else if (text.includes('urgent') || text.includes('immediate') || text.includes('broken')) {
      priority = 'high';
    } else if (text.includes('low') || text.includes('minor')) {
      priority = 'low';
    }

    const newComplaint = {
      _id: 'c_' + Date.now(),
      ticketId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority,
      isCritical,
      criticalReason,
      status: 'submitted',
      address: data.address,
      latitude: data.latitude || 28.6139 + (Math.random() - 0.5) * 0.1,
      longitude: data.longitude || 77.2090 + (Math.random() - 0.5) * 0.1,
      image: data.image || null,
      citizen: { _id: currentUser._id, name: currentUser.name },
      assignedTo: null,
      department: null,
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString(),
      updates: []
    };

    complaints.unshift(newComplaint);
    saveList('cm_complaints', complaints);

    // Add audit log
    const audit = getList('cm_audit_logs');
    audit.unshift({
      _id: 'a_' + Date.now(),
      action: 'complaint_created',
      performedBy: { name: currentUser.name, role: currentUser.role },
      details: { ticketId },
      createdAt: new Date().toISOString()
    });
    saveList('cm_audit_logs', audit);

    // Add notification for CM/Admin
    const notifications = getList('cm_notifications');
    notifications.unshift({
      _id: 'n_' + Date.now(),
      type: isCritical ? 'critical_complaint' : 'new_assignment',
      title: isCritical ? 'New Critical Complaint' : 'Complaint Submitted',
      message: `${data.title.substring(0, 40)}... has been submitted.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      complaint: { _id: newComplaint._id }
    });
    saveList('cm_notifications', notifications);

    return { data: { complaint: newComplaint } };
  }
  return API.post('/complaints', data);
};

export const getComplaints = async (params = {}) => {
  if (USE_MOCK) {
    await wait(300);
    let complaints = getList('cm_complaints');

    // Filter logic
    if (params.status) {
      const statuses = params.status.split(',');
      complaints = complaints.filter(c => statuses.includes(c.status));
    }
    if (params.priority) {
      complaints = complaints.filter(c => c.priority === params.priority);
    }
    if (params.category) {
      complaints = complaints.filter(c => c.category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      complaints = complaints.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) || 
        c.ticketId.toLowerCase().includes(q)
      );
    }

    return { data: { complaints } };
  }
  return API.get('/complaints', { params });
};

export const getComplaint = async (id) => {
  if (USE_MOCK) {
    await wait(200);
    const complaints = getList('cm_complaints');
    const complaint = complaints.find(c => c._id === id || c.ticketId === id);
    if (!complaint) throw { response: { status: 404, data: { message: 'Complaint not found' } } };
    return { data: { complaint } };
  }
  return API.get(`/complaints/${id}`);
};

export const assignComplaint = async (id, data) => {
  if (USE_MOCK) {
    await wait();
    const complaints = getList('cm_complaints');
    const idx = complaints.findIndex(c => c._id === id);
    if (idx === -1) throw { response: { status: 404 } };

    const officers = getList('cm_users');
    const officer = officers.find(o => o._id === data.assignedTo);
    if (!officer) throw { response: { status: 404, data: { message: 'Officer not found' } } };

    complaints[idx].assignedTo = { _id: officer._id, name: officer.name };
    complaints[idx].status = 'assigned';
    complaints[idx].department = officer.department || { _id: 'd1', name: 'Roads & Highways' };
    
    saveList('cm_complaints', complaints);

    // Audit log
    const audit = getList('cm_audit_logs');
    audit.unshift({
      _id: 'a_' + Date.now(),
      action: 'status_updated',
      performedBy: { name: 'Admin/System', role: 'super_admin' },
      details: { ticketId: complaints[idx].ticketId, oldStatus: 'submitted', newStatus: 'assigned', assignedTo: officer.name },
      createdAt: new Date().toISOString()
    });
    saveList('cm_audit_logs', audit);

    return { data: { complaint: complaints[idx] } };
  }
  return API.post(`/complaints/${id}/assign`, data);
};

export const updateComplaintStatus = async (id, data) => {
  if (USE_MOCK) {
    await wait();
    const complaints = getList('cm_complaints');
    const idx = complaints.findIndex(c => c._id === id);
    if (idx === -1) throw { response: { status: 404 } };

    const oldStatus = complaints[idx].status;
    complaints[idx].status = data.status;
    
    if (data.status === 'resolved') {
      complaints[idx].resolvedAt = new Date().toISOString();
    }
    
    saveList('cm_complaints', complaints);

    // Audit
    const audit = getList('cm_audit_logs');
    audit.unshift({
      _id: 'a_' + Date.now(),
      action: 'status_updated',
      performedBy: { name: 'Officer', role: 'employee' },
      details: { ticketId: complaints[idx].ticketId, oldStatus, newStatus: data.status },
      createdAt: new Date().toISOString()
    });
    saveList('cm_audit_logs', audit);

    return { data: { complaint: complaints[idx] } };
  }
  return API.put(`/complaints/${id}/status`, data);
};

export const citizenVerify = async (id, data) => {
  if (USE_MOCK) {
    await wait();
    const complaints = getList('cm_complaints');
    const idx = complaints.findIndex(c => c._id === id);
    if (idx === -1) throw { response: { status: 404 } };

    complaints[idx].feedbackRating = data.rating;
    complaints[idx].feedbackText = data.feedback;
    complaints[idx].status = data.satisfied ? 'resolved' : 'reopened';
    if (!data.satisfied) {
      complaints[idx].priority = 'high'; // Escalate on reopen
    }

    saveList('cm_complaints', complaints);

    return { data: { complaint: complaints[idx] } };
  }
  return API.post(`/complaints/${id}/verify`, data);
};

export const upvoteComplaint = async (id) => {
  if (USE_MOCK) {
    await wait(100);
    const complaints = getList('cm_complaints');
    const idx = complaints.findIndex(c => c._id === id);
    if (idx === -1) throw { response: { status: 404 } };

    complaints[idx].upvotes = (complaints[idx].upvotes || 0) + 1;
    saveList('cm_complaints', complaints);

    return { data: { complaint: complaints[idx] } };
  }
  return API.post(`/complaints/${id}/upvote`);
};

export const getNearbyComplaints = async (params = {}) => {
  if (USE_MOCK) {
    await wait(200);
    const complaints = getList('cm_complaints');
    return { data: { complaints } };
  }
  return API.get('/complaints/nearby', { params });
};

export const getDashboardStats = async (params = {}) => {
  if (USE_MOCK) {
    await wait(200);
    const complaints = getList('cm_complaints');
    const departments = getList('cm_departments');

    const statusCounts = [
      { _id: 'submitted', count: complaints.filter(c => c.status === 'submitted').length },
      { _id: 'under_review', count: complaints.filter(c => c.status === 'under_review').length },
      { _id: 'assigned', count: complaints.filter(c => c.status === 'assigned').length },
      { _id: 'in_progress', count: complaints.filter(c => c.status === 'in_progress').length },
      { _id: 'resolved', count: complaints.filter(c => c.status === 'resolved').length },
      { _id: 'rejected', count: complaints.filter(c => c.status === 'rejected').length },
      { _id: 'pending_verification', count: complaints.filter(c => c.status === 'pending_verification').length }
    ];

    const categoryCounts = [
      { _id: 'roads', count: complaints.filter(c => c.category === 'roads').length },
      { _id: 'water', count: complaints.filter(c => c.category === 'water').length },
      { _id: 'power', count: complaints.filter(c => c.category === 'power').length },
      { _id: 'sanitation', count: complaints.filter(c => c.category === 'sanitation').length }
    ];

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => !['resolved', 'rejected'].includes(c.status)).length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      critical: complaints.filter(c => c.priority === 'critical').length,
      falseClosures: complaints.filter(c => c.feedbackRating !== undefined && c.feedbackRating <= 2).length,
      overdueCount: complaints.filter(c => c.dueDate && new Date(c.dueDate) < new Date() && !['resolved', 'rejected'].includes(c.status)).length,
      resolutionRate: complaints.length ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100) : 0,
      statusCounts,
      categoryCounts,
      trend: [
        { _id: '2026-06-12', count: 1 },
        { _id: '2026-06-13', count: 3 },
        { _id: '2026-06-14', count: 2 },
        { _id: '2026-06-15', count: 5 },
        { _id: '2026-06-16', count: 4 },
        { _id: '2026-06-17', count: 6 },
        { _id: '2026-06-18', count: complaints.length }
      ],
      topDepts: departments.map(d => {
        const total = complaints.filter(c => c.department?._id === d._id || c.category === d.name.split(' ')[0].toLowerCase()).length;
        const resolved = complaints.filter(c => (c.department?._id === d._id || c.category === d.name.split(' ')[0].toLowerCase()) && c.status === 'resolved').length;
        return {
          dept: [d],
          total,
          resolved
        };
      })
    };

    return { data: { stats } };
  }
  return API.get('/complaints/stats', { params });
};

export const getComments = async (id) => {
  if (USE_MOCK) {
    await wait(100);
    const comments = getList('cm_comments');
    const filtered = comments.filter(c => c.complaint === id);
    return { data: { comments: filtered } };
  }
  return API.get(`/complaints/${id}/comments`);
};

export const addComment = async (id, data) => {
  if (USE_MOCK) {
    await wait(200);
    const comments = getList('cm_comments');
    const token = localStorage.getItem('token');
    const userId = token ? token.replace('mock-token-', '') : 'u7';
    const users = getList('cm_users');
    const user = users.find(u => u._id === userId) || users[6];

    const newComment = {
      _id: 'co_' + Date.now(),
      complaint: id,
      user: { _id: user._id, name: user.name, role: user.role },
      text: data.text,
      isInternal: data.isInternal || false,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    saveList('cm_comments', comments);
    return { data: { comment: newComment } };
  }
  return API.post(`/complaints/${id}/comments`, data);
};

// ── Users / Officers mock ──

export const getOfficers = async (params = {}) => {
  if (USE_MOCK) {
    await wait();
    const users = getList('cm_users');
    const officers = users.filter(u => ['employee', 'department_head'].includes(u.role));
    return { data: { officers } };
  }
  return API.get('/users/officers', { params });
};

export const getOfficerPerformance = async () => {
  if (USE_MOCK) {
    await wait(200);
    const users = getList('cm_users');
    const performance = users
      .filter(u => u.role === 'employee')
      .map(o => ({
        _id: o._id,
        name: o.name,
        designation: o.designation,
        resolvedCount: o.stats?.totalResolved || 0,
        assignedCount: o.stats?.totalAssigned || 0,
        avgResolutionHours: o.stats?.avgResolutionHours || 0,
        satisfactionScore: o.stats?.avgSatisfactionScore || 0,
        activeCount: o.activeComplaints || 0
      }));
    return { data: { performance } };
  }
  return API.get('/users/officer-performance');
};

export const getAllUsers = async (params = {}) => {
  if (USE_MOCK) {
    await wait(200);
    const users = getList('cm_users');
    return { data: { users } };
  }
  return API.get('/users', { params });
};

export const createUser = async (data) => {
  if (USE_MOCK) {
    await wait();
    const users = getList('cm_users');
    const newUser = {
      _id: 'u_' + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      designation: data.designation || '',
      department: data.department ? { _id: data.department, name: 'Assigned Department' } : null,
      active: true
    };
    users.push(newUser);
    saveList('cm_users', users);
    return { data: { user: newUser } };
  }
  return API.post('/users', data);
};

export const updateUser = async (id, data) => {
  if (USE_MOCK) {
    await wait();
    const users = getList('cm_users');
    const idx = users.findIndex(u => u._id === id);
    if (idx === -1) throw { response: { status: 404 } };
    users[idx] = { ...users[idx], ...data };
    saveList('cm_users', users);
    return { data: { user: users[idx] } };
  }
  return API.put(`/users/${id}`, data);
};

export const toggleUserActive = async (id) => {
  if (USE_MOCK) {
    await wait();
    const users = getList('cm_users');
    const idx = users.findIndex(u => u._id === id);
    if (idx === -1) throw { response: { status: 404 } };
    users[idx].active = !users[idx].active;
    saveList('cm_users', users);
    return { data: { user: users[idx] } };
  }
  return API.put(`/users/${id}/toggle-active`);
};

// ── Audit & AI mock ──

export const getAuditLogs = async (params = {}) => {
  if (USE_MOCK) {
    await wait(300);
    const audit = getList('cm_audit_logs');
    return { data: { auditLogs: audit } };
  }
  return API.get('/audit-logs', { params });
};

export const getAiAnomalies = async () => {
  if (USE_MOCK) {
    await wait(400);
    const anomalies = {
      officerAnomalies: [
        {
          officer: { name: 'Sunil Dutt' },
          anomalies: [
            { message: 'Suspicious 100% resolution rate in Dwarka district complaints' },
            { message: 'Fast closure within 10 minutes of assignment (Ticket CMG-2026-0098)' }
          ]
        }
      ],
      departmentBottlenecks: [
        {
          department: 'Roads & Highways',
          severity: 'high',
          overdue: 4,
          avgAgeHours: 96
        },
        {
          department: 'Water Supply',
          severity: 'medium',
          overdue: 2,
          avgAgeHours: 48
        }
      ]
    };
    return { data: anomalies };
  }
  return API.get('/ai/anomalies');
};

// ── Departments mock ──

export const getDepartments = async () => {
  if (USE_MOCK) {
    await wait(100);
    const departments = getList('cm_departments');
    return { data: { departments } };
  }
  return API.get('/departments');
};

export const createDepartment = async (data) => {
  if (USE_MOCK) {
    await wait();
    const departments = getList('cm_departments');
    const newDept = {
      _id: 'd_' + Date.now(),
      name: data.name,
      head: data.head || 'Unassigned',
      active: true
    };
    departments.push(newDept);
    saveList('cm_departments', departments);
    return { data: { department: newDept } };
  }
  return API.post('/departments', data);
};

export const updateDepartment = async (id, data) => {
  if (USE_MOCK) {
    await wait();
    const departments = getList('cm_departments');
    const idx = departments.findIndex(d => d._id === id);
    if (idx === -1) throw { response: { status: 404 } };
    departments[idx] = { ...departments[idx], ...data };
    saveList('cm_departments', departments);
    return { data: { department: departments[idx] } };
  }
  return API.put(`/departments/${id}`, data);
};

// ── Visits mock ──

export const createVisit = async (data) => {
  if (USE_MOCK) {
    await wait();
    const visits = getList('cm_visits');
    const complaints = getList('cm_complaints');
    const comp = complaints.find(c => c._id === data.complaintId);
    
    const newVisit = {
      _id: 'v_' + Date.now(),
      complaint: { _id: data.complaintId, title: comp?.title || 'Complaint', ticketId: comp?.ticketId || 'TKT' },
      officer: { _id: data.officerId, name: 'Field Inspector' },
      status: 'scheduled',
      scheduledDate: data.scheduledDate,
      logs: [{ text: 'Visit Scheduled', time: new Date().toISOString() }]
    };
    visits.unshift(newVisit);
    saveList('cm_visits', visits);
    return { data: { visit: newVisit } };
  }
  return API.post('/visits', data);
};

export const getVisits = async () => {
  if (USE_MOCK) {
    await wait(200);
    const visits = getList('cm_visits');
    return { data: { visits } };
  }
  return API.get('/visits');
};

export const getVisit = async (id) => {
  if (USE_MOCK) {
    await wait(100);
    const visits = getList('cm_visits');
    const visit = visits.find(v => v._id === id);
    if (!visit) throw { response: { status: 404 } };
    return { data: { visit } };
  }
  return API.get(`/visits/${id}`);
};

export const addVisitLog = async (id, data) => {
  if (USE_MOCK) {
    await wait();
    const visits = getList('cm_visits');
    const idx = visits.findIndex(v => v._id === id);
    if (idx === -1) throw { response: { status: 404 } };

    visits[idx].logs.push({ text: data.text, time: new Date().toISOString() });
    saveList('cm_visits', visits);
    return { data: { visit: visits[idx] } };
  }
  return API.post(`/visits/${id}/log`, data);
};

export const completeVisit = async (id, data) => {
  if (USE_MOCK) {
    await wait();
    const visits = getList('cm_visits');
    const idx = visits.findIndex(v => v._id === id);
    if (idx === -1) throw { response: { status: 404 } };

    visits[idx].status = 'completed';
    visits[idx].logs.push({ text: 'Visit Completed. Findings: ' + data.findings, time: new Date().toISOString() });
    
    saveList('cm_visits', visits);
    return { data: { visit: visits[idx] } };
  }
  return API.put(`/visits/${id}/complete`, data);
};

// ── Notifications mock ──

export const getNotifications = async (params = {}) => {
  if (USE_MOCK) {
    await wait(100);
    const notifications = getList('cm_notifications');
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return { data: { notifications, unreadCount } };
  }
  return API.get('/notifications', { params });
};

export const markNotificationRead = async (id) => {
  if (USE_MOCK) {
    const notifications = getList('cm_notifications');
    const idx = notifications.findIndex(n => n._id === id);
    if (idx !== -1) {
      notifications[idx].isRead = true;
      saveList('cm_notifications', notifications);
    }
    return { data: { success: true } };
  }
  return API.put(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  if (USE_MOCK) {
    const notifications = getList('cm_notifications');
    notifications.forEach(n => n.isRead = true);
    saveList('cm_notifications', notifications);
    return { data: { success: true } };
  }
  return API.put('/notifications/read-all');
};

// ── MCD311 mock ──

export const getMCD311Status = async () => {
  if (USE_MOCK) {
    return { data: { status: 'connected', latencyMs: 14 } };
  }
  return API.get('/mcd311/status');
};

// ── Public tracking mock ──

export const trackPublic = async (ticketId) => {
  if (USE_MOCK) {
    await wait(300);
    const complaints = getList('cm_complaints');
    const complaint = complaints.find(c => c.ticketId.toLowerCase() === ticketId.toLowerCase());
    if (!complaint) throw { response: { status: 404, data: { message: 'No complaint found with this Ticket ID.' } } };
    return { data: { complaint } };
  }
  return API.get(`/track/${ticketId}`);
};

export default API;
