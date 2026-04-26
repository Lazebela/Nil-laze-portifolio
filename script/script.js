const API_BASE = 'http://localhost:3000';

const projectData = [
  {
    title: 'Brand Website',
    description: 'Responsive landing page for a creative startup with modern UI and fast loading.',
    tags: ['web'],
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop&crop=center'
  },
  {
    title: 'UX Portfolio',
    description: 'Curated UX case study site with an emphasis on style, readability, and conversion.',
    tags: ['design'],
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop&crop=center'
  },
  {
    title: 'Mobile App UI',
    description: 'Interactive mobile dashboard design with smooth animations and clean layout.',
    tags: ['mobile', 'design'],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop&crop=center'
  },
  {
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce site with product filtering, secure checkout, and custom branding.',
    tags: ['web'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center'
  },
  {
    title: 'Creative Portfolio',
    description: 'Stylish portfolio site showcasing design work with a focus on typography and layout.',
    tags: ['design'],
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop&crop=center'
  },
  {
    title: 'System Dashboard',
    description: 'Comprehensive dashboard for monitoring and managing system performance.',
    tags: ['web'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center'
  }
];

const projectsGrid = document.querySelector('.projects-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const backToTop = document.querySelector('.back-to-top');
const currentYear = document.getElementById('currentYear');
const skillLevels = document.querySelectorAll('.skill-level');
const statNumbers = document.querySelectorAll('.stat-number');
const contactForm = document.getElementById('contactForm');

function fetchProjects() {
  renderProjects();
}

function renderProjects(filter = 'all') {
  if (!projectsGrid || !projectData.length) return;
  const filtered = filter === 'all'
    ? projectData
    : projectData.filter(project => project.tags.includes(filter));

  projectsGrid.innerHTML = filtered.map(project => `
    <article class="project-card">
      <div class="project-img" style="background-image: url('${project.image}');"></div>
      <div class="project-content">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-tags">
          ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

async function fetchSubmissions() {
  const submissionsBody = document.getElementById('submissionsBody');
  const submissionCount = document.getElementById('submissionCount');

  if (!submissionsBody || !submissionCount) return;

  try {
    const response = await fetch(`${API_BASE}/api/users/All`);
    if (!response.ok) throw new Error('Unable to fetch submissions');
    const users = await response.json();

    if (!Array.isArray(users) || users.length === 0) {
      submissionsBody.innerHTML = '<tr><td colspan="6" class="empty-state">No submissions found.</td></tr>';
      submissionCount.textContent = 'No submissions found.';
      return;
    }

    const rows = users.map((user, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${user.firstname} ${user.lastname}</td>
        <td>${user.email}</td>
        <td>${user.subject}</td>
        <td>${user.message}</td>
        <td>${new Date(user.created_at).toLocaleString()}</td>
      </tr>
    `).join('');

    submissionsBody.innerHTML = rows;
    submissionCount.textContent = `${users.length} submission${users.length === 1 ? '' : 's'} loaded.`;
  } catch (error) {
    console.error('Submission fetch error:', error);
    submissionsBody.innerHTML = '<tr><td colspan="6" class="empty-state">Unable to load submissions.</td></tr>';
    submissionCount.textContent = 'Failed to load submissions.';
  }
}

function setActiveFilter(target) {
  filterButtons.forEach(button => button.classList.toggle('active', button === target));
}

function updateNav() {
  if (!navLinks) return;
  navLinks.classList.toggle('open');
}

function updateBackToTop() {
  if (!backToTop) return;
  if (window.scrollY > 400) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}

function animateSkillBars() {
  skillLevels.forEach(level => {
    const value = parseInt(level.dataset.level, 10) || 0;
    level.style.width = `${value}%`;
  });
}

function animateStats() {
  statNumbers.forEach((stat) => {
    const end = parseInt(stat.dataset.count, 10) || 0;
    let current = 0;
    const step = Math.max(1, Math.round(end / 60));

    const interval = setInterval(() => {
      current += step;
      if (current >= end) {
        stat.textContent = `${end}`;
        clearInterval(interval);
      } else {
        stat.textContent = `${current}`;
      }
    }, 20);
  });
}

// Handle contact form submission
async function handleContactForm(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  // Get form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const response = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      // Success
      alert('Message sent successfully! Thank you for contacting me.');
      form.reset();
    } else {
      // Error
      alert(result.message || 'Failed to send message. Please try again.');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    alert('Network error. Please check your connection and try again.');
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function init() {
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  fetchProjects();
  animateSkillBars();
  animateStats();
  updateBackToTop();

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      setActiveFilter(button);
      renderProjects(filter);
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener('click', updateNav);
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const loadSubmissionsBtn = document.getElementById('loadSubmissionsBtn');
  if (loadSubmissionsBtn) {
    loadSubmissionsBtn.addEventListener('click', fetchSubmissions);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }

  window.addEventListener('scroll', updateBackToTop);
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navLinks?.classList.remove('open');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
