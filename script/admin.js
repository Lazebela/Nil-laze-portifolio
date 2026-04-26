// ============ Configuration ============
const CONFIG = {
  API_BASE: 'http://localhost:3000',
  ADMIN_TOKEN_KEY: 'adminSessionToken',
  DEFAULT_ADMIN_KEY: 'MYPORTIFOLIO',
};

// ============ DOM Elements ============
const DOM = {
  loginForm: document.getElementById('adminLoginForm'),
  keyInput: document.getElementById('adminKey'),
  status: document.getElementById('adminStatus'),
  content: document.getElementById('adminContent'),
  submissionsBody: document.getElementById('submissionsBody'),
  submissionCount: document.getElementById('submissionCount'),
};

// ============ Token Management ============
const getStoredAdminToken = () => sessionStorage.getItem(CONFIG.ADMIN_TOKEN_KEY);
const storeAdminToken = (token) => sessionStorage.setItem(CONFIG.ADMIN_TOKEN_KEY, token);
const clearAdminToken = () => sessionStorage.removeItem(CONFIG.ADMIN_TOKEN_KEY);

// ============ UI Rendering ============
const renderSubmissions = (users) => {
  if (!users || users.length === 0) {
    DOM.submissionsBody.innerHTML = '<tr><td colspan="7" class="empty-state">No submissions found.</td></tr>';
    DOM.submissionCount.textContent = 'No submissions found.';
    return;
  }

  DOM.submissionsBody.innerHTML = users.map((user, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${user.firstname} ${user.lastname}</td>
      <td>${user.email}</td>
      <td>${user.subject}</td>
      <td>${user.message}</td>
      <td>${new Date(user.created_at).toLocaleString()}</td>
      <td><button class="delete-btn" data-id="${user.user_id}" title="Delete this submission">Delete</button></td>
    </tr>
  `).join('');

  DOM.submissionCount.textContent = `${users.length} submission${users.length === 1 ? '' : 's'} loaded.`;
  
  // Attach delete button listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteSubmission);
  });
};

// ============ API Calls ============
const loginAdmin = async (adminKey) => {
  const response = await fetch(`${CONFIG.API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminKey }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid admin key.');
    }
    throw new Error('Unable to authenticate.');
  }

  return await response.json();
};

const fetchAdminSubmissions = async (token) => {
  if (!token) {
    throw new Error('Session token not found. Please log in.');
  }

  const response = await fetch(`${CONFIG.API_BASE}/api/admin/submissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Unable to fetch submissions.');
  }

  return await response.json();
};

const deleteSubmission = async (submissionId, token) => {
  if (!token) {
    throw new Error('Session token not found. Please log in.');
  }

  const response = await fetch(`${CONFIG.API_BASE}/api/admin/submissions/${submissionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    throw new Error('Unable to delete submission.');
  }

  return await response.json();
};

// ============ Authentication & Loading ============
const authenticateAndLoad = async (adminKey) => {
  const { token } = await loginAdmin(adminKey);
  storeAdminToken(token);
  const users = await fetchAdminSubmissions(token);
  DOM.status.textContent = '';
  DOM.status.classList.remove('admin-status-error');
  DOM.content.classList.remove('hidden');
  renderSubmissions(users);
};

// ============ Event Listeners ============
const handleDeleteSubmission = async (event) => {
  const button = event.target;
  const submissionId = button.getAttribute('data-id');
  
  if (!confirm('Are you sure you want to delete this submission?')) {
    return;
  }

  button.disabled = true;
  button.textContent = 'Deleting...';

  try {
    const token = getStoredAdminToken();
    await deleteSubmission(submissionId, token);
    
    // Refresh submissions after deletion
    const users = await fetchAdminSubmissions(token);
    renderSubmissions(users);
    DOM.status.textContent = 'Submission deleted successfully.';
    DOM.status.classList.remove('admin-status-error');
  } catch (error) {
    DOM.status.textContent = error.message;
    DOM.status.classList.add('admin-status-error');
    button.disabled = false;
    button.textContent = 'Delete';
  }
};

DOM.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const adminKey = DOM.keyInput.value.trim() || CONFIG.DEFAULT_ADMIN_KEY;
  
  if (!adminKey) {
    DOM.status.textContent = 'Enter the admin key to continue.';
    DOM.status.classList.add('admin-status-error');
    return;
  }

  DOM.status.textContent = 'Verifying...';
  DOM.status.classList.remove('admin-status-error');

  try {
    await authenticateAndLoad(adminKey);
  } catch (error) {
    DOM.status.textContent = error.message;
    DOM.status.classList.add('admin-status-error');
    DOM.content.classList.add('hidden');
    DOM.submissionsBody.innerHTML = '<tr><td colspan="7" class="empty-state">Authorization failed or no submissions available.</td></tr>';
    DOM.submissionCount.textContent = 'Unauthorized or error loading submissions.';
    clearAdminToken();
  }
});

// ============ Session Recovery ============
window.addEventListener('DOMContentLoaded', async () => {
  const existingToken = getStoredAdminToken();
  if (!existingToken) {
    return;
  }

  try {
    const users = await fetchAdminSubmissions(existingToken);
    DOM.status.textContent = 'Session loaded. Showing submissions.';
    DOM.status.classList.remove('admin-status-error');
    DOM.content.classList.remove('hidden');
    renderSubmissions(users);
  } catch (error) {
    DOM.status.textContent = 'Session expired. Please log in again.';
    DOM.status.classList.add('admin-status-error');
    DOM.content.classList.add('hidden');
    clearAdminToken();
  }
});