/**
 * TALES & TONE — Admin Panel Interactive Logic
 * Dharsi Chauhan — Freelance Writer & Brand Voice Studio
 * Supabase CRM for Contact Inquiries
 */

const adminApp = {
  supabaseUrl: 'https://tyesjcqfhtidkvpyyktc.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZXNqY3FmaHRpZGt2cHl5a3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODQyMTgsImV4cCI6MjEwNTQ2MDIxOH0.nuk3lHEZP69CQ9mK2k8busCAOQK16k2cs95LULfBAsY',
  supabase: null,

  inquiries: [],
  filteredInquiries: [],
  currentStatusFilter: 'all',
  currentServiceFilter: 'all',
  searchQuery: '',
  deleteTargetId: null,

  init() {
    // Initialize Supabase client
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
    }

    // Check existing authentication
    const isAuthed = localStorage.getItem('tt_admin_authenticated');
    if (isAuthed === 'true') {
      this.showDashboard();
      this.fetchInquiries();
      this.setupRealtime();
    } else {
      this.showLogin();
    }
  },

  setupRealtime() {
    if (this.supabase && typeof this.supabase.channel === 'function') {
      try {
        this.supabase
          .channel('public:contacts:realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
            console.log('Realtime change detected in contacts table. Refreshing...');
            this.fetchInquiries(true);
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription notice:', err);
      }
    }

    // Background auto-refresh every 15 seconds to ensure no leads are ever missed!
    if (!this.refreshInterval) {
      this.refreshInterval = setInterval(() => {
        const isAuthed = localStorage.getItem('tt_admin_authenticated');
        if (isAuthed === 'true') {
          this.fetchInquiries(true);
        }
      }, 15000);
    }
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async handlePasscodeLogin(e) {
    e.preventDefault();
    const passcode = document.getElementById('adminPasscode').value.trim();
    const errBox = document.getElementById('loginError');

    // Secure SHA-256 hash comparison - never exposes plain-text password in DevTools or Inspect!
    const inputHash = await this.hashString(passcode);
    const validHash = '9a3fdfc6a046543fd2a65760ffd835d896b6c4933dac58d33a88e7550a793984';

    if (inputHash === validHash) {
      localStorage.setItem('tt_admin_authenticated', 'true');
      localStorage.setItem('tt_admin_type', 'passcode');
      errBox.style.display = 'none';
      document.getElementById('adminPasscode').value = '';
      this.showDashboard();
      this.fetchInquiries();
    } else {
      errBox.innerText = 'Incorrect admin passcode. Access denied.';
      errBox.style.display = 'block';
    }
  },

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  },

  logout() {
    localStorage.removeItem('tt_admin_authenticated');
    localStorage.removeItem('tt_admin_type');
    if (this.supabase) {
      this.supabase.auth.signOut().catch(() => {});
    }
    this.showLogin();
  },

  showLogin() {
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('adminAppContainer').style.display = 'none';
  },

  showDashboard() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('adminAppContainer').style.display = 'flex';
  },

  // ==========================================
  // DATA FETCHING & SYNC
  // ==========================================
  async fetchInquiries(silent = false) {
    const loading = document.getElementById('loadingState');
    const empty = document.getElementById('emptyState');
    const list = document.getElementById('inquiriesList');
    const dbAlert = document.getElementById('dbAlertBanner');

    if (!silent) {
      loading.style.display = 'block';
      empty.style.display = 'none';
      list.innerHTML = '';
    }

    try {
      let data = [];
      let fetchError = null;

      if (this.supabase) {
        const res = await this.supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });
        data = res.data || [];
        fetchError = res.error;
      } else {
        // Direct REST fallback
        const res = await fetch(`${this.supabaseUrl}/rest/v1/contacts?select=*&order=created_at.desc`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        if (res.ok) {
          data = await res.json();
        } else {
          fetchError = await res.json();
        }
      }

      loading.style.display = 'none';

      if (fetchError) {
        console.warn('Database fetch notice:', fetchError);
        // Table does not exist in schema cache
        if (fetchError.code === 'PGRST205' || (fetchError.message && fetchError.message.includes('not find the table'))) {
          dbAlert.style.display = 'flex';
        }
        // Fallback local storage demo if table isn't created yet
        const localCached = localStorage.getItem('tt_demo_inquiries');
        if (localCached) {
          this.inquiries = JSON.parse(localCached);
        } else {
          this.inquiries = this.getInitialSampleData();
        }
      } else {
        dbAlert.style.display = 'none';
        this.inquiries = data;
      }

      this.updateMetrics();
      this.applyFiltersAndRender();

    } catch (err) {
      console.error('Fetch error:', err);
      loading.style.display = 'none';
      dbAlert.style.display = 'flex';
      this.inquiries = this.getInitialSampleData();
      this.updateMetrics();
      this.applyFiltersAndRender();
    }
  },

  getInitialSampleData() {
    return [
      {
        id: 'sample-1',
        created_at: new Date().toISOString(),
        name: 'Pooja Sharma',
        email: 'pooja@example.com',
        service: 'Website Content',
        message: 'Hello Dharsi! We are revamping our startup website and loved your Tales & Tone portfolio. Looking for 4 core pages (Home, About, Services, Contact).',
        status: 'new',
        notes: 'Initial website lead'
      },
      {
        id: 'sample-2',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        name: 'Rohan Mehta',
        email: 'rohan.mehta@brandstudio.in',
        service: 'Blogs & Articles',
        message: 'Hi Dharsi, looking for 4 high-quality monthly editorial articles for our wellness lifestyle brand. Can we discuss your availability and rates?',
        status: 'in_progress',
        notes: 'Sent initial rate card via email'
      }
    ];
  },

  // ==========================================
  // METRICS & FILTERS
  // ==========================================
  updateMetrics() {
    const total = this.inquiries.length;
    const newCount = this.inquiries.filter(i => i.status === 'new').length;
    const progressCount = this.inquiries.filter(i => i.status === 'in_progress').length;
    const contactedCount = this.inquiries.filter(i => i.status === 'contacted').length;

    document.getElementById('totalCount').innerText = total;
    document.getElementById('newCount').innerText = newCount;
    document.getElementById('progressCount').innerText = progressCount;
    document.getElementById('contactedCount').innerText = contactedCount;
  },

  filterByStatus(status) {
    this.currentStatusFilter = status;
    document.querySelectorAll('.status-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === status);
    });
    this.applyFiltersAndRender();
  },

  handleServiceFilter() {
    this.currentServiceFilter = document.getElementById('serviceFilter').value;
    this.applyFiltersAndRender();
  },

  handleSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    this.searchQuery = input.value.trim().toLowerCase();
    clearBtn.style.display = this.searchQuery ? 'block' : 'none';
    this.applyFiltersAndRender();
  },

  clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearchBtn').style.display = 'none';
    this.searchQuery = '';
    this.applyFiltersAndRender();
  },

  applyFiltersAndRender() {
    this.filteredInquiries = this.inquiries.filter(item => {
      // Status filter
      if (this.currentStatusFilter !== 'all' && item.status !== this.currentStatusFilter) {
        return false;
      }
      // Service filter
      if (this.currentServiceFilter !== 'all' && item.service !== this.currentServiceFilter) {
        return false;
      }
      // Search query
      if (this.searchQuery) {
        const searchStr = `${item.name || ''} ${item.email || ''} ${item.message || ''} ${item.service || ''} ${item.notes || ''}`.toLowerCase();
        if (!searchStr.includes(this.searchQuery)) {
          return false;
        }
      }
      return true;
    });

    this.renderInquiries();
  },

  // ==========================================
  // RENDERING
  // ==========================================
  renderInquiries() {
    const list = document.getElementById('inquiriesList');
    const empty = document.getElementById('emptyState');
    const emptyDesc = document.getElementById('emptyDesc');

    list.innerHTML = '';

    if (this.filteredInquiries.length === 0) {
      empty.style.display = 'block';
      if (this.searchQuery || this.currentStatusFilter !== 'all' || this.currentServiceFilter !== 'all') {
        emptyDesc.innerText = 'No inquiries match your current filters or search term.';
      } else {
        emptyDesc.innerText = 'You have not received any client inquiries yet.';
      }
      return;
    }

    empty.style.display = 'none';

    this.filteredInquiries.forEach(item => {
      const card = document.createElement('article');
      card.className = `inquiry-card ${item.status === 'new' ? 'card-unread' : ''}`;
      card.id = `card-${item.id}`;

      const dateFormatted = this.formatDate(item.created_at);
      const mailtoLink = `mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`Re: Your inquiry on Tales & Tone — Dharsi Chauhan`)}&body=${encodeURIComponent(`Hi ${item.name},\n\nThank you for reaching out through Tales & Tone regarding ${item.service || 'your content project'}.\n\n`)}`;
      const whatsappText = encodeURIComponent(`Hi ${item.name}, thank you for contacting Tales & Tone regarding your project.`);
      const whatsappLink = `https://wa.me/?text=${whatsappText}`;

      card.innerHTML = `
        <div class="inquiry-header-row">
          <div class="inquiry-client-info">
            <h3 class="client-name">${this.escapeHtml(item.name)}</h3>
            <div class="client-meta-line">
              <a href="${mailtoLink}" class="client-email-link" title="Send Email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>${this.escapeHtml(item.email)}</span>
              </a>
              <span class="inquiry-service-tag">${this.escapeHtml(item.service || 'General Inquiry')}</span>
              <span class="inquiry-date-badge">${dateFormatted}</span>
            </div>
          </div>

          <div class="inquiry-status-group">
            <select class="status-badge-select status-${item.status || 'new'}" onchange="adminApp.updateStatus('${item.id}', this.value, this)">
              <option value="new" ${item.status === 'new' ? 'selected' : ''}>● New</option>
              <option value="in_progress" ${item.status === 'in_progress' ? 'selected' : ''}>● In Progress</option>
              <option value="contacted" ${item.status === 'contacted' ? 'selected' : ''}>● Contacted</option>
              <option value="archived" ${item.status === 'archived' ? 'selected' : ''}>● Archived</option>
            </select>
          </div>
        </div>

        <div class="inquiry-message-box">${this.escapeHtml(item.message)}</div>

        <div class="inquiry-footer-bar">
          <div class="notes-input-wrap">
            <input type="text" 
                   class="notes-input" 
                   placeholder="Internal admin note (press Enter to save)..." 
                   value="${this.escapeHtml(item.notes || '')}"
                   onkeydown="if(event.key==='Enter') adminApp.saveNotes('${item.id}', this.value, this)"
                   onblur="adminApp.saveNotes('${item.id}', this.value, this)">
          </div>

          <div class="card-action-btns">
            <a href="${mailtoLink}" class="btn btn-outline-dark btn-sm" title="Reply via email">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h10a5 5 0 0 1 5 5v2"/><polyline points="7 14 3 10 7 6"/></svg>
              <span>Reply Email</span>
            </a>
            <a href="${whatsappLink}" target="_blank" rel="noopener" class="btn btn-outline-dark btn-sm" title="Contact via WhatsApp">
              <span>WhatsApp</span>
            </a>
            <button class="btn btn-danger-soft btn-sm" onclick="adminApp.openDeleteModal('${item.id}', '${this.escapeHtml(item.name)}')" title="Delete inquiry">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;

      list.appendChild(card);
    });
  },

  // ==========================================
  // UPDATING & ACTIONS
  // ==========================================
  async updateStatus(id, newStatus, selectEl) {
    selectEl.className = `status-badge-select status-${newStatus}`;

    // Update local state
    const item = this.inquiries.find(i => i.id === id);
    if (item) {
      item.status = newStatus;
    }
    this.updateMetrics();

    // Persist to Supabase
    if (this.supabase) {
      try {
        await this.supabase
          .from('contacts')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (e) {
        console.warn('Status update notice:', e);
      }
    } else {
      // Fallback REST
      fetch(`${this.supabaseUrl}/rest/v1/contacts?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ status: newStatus })
      }).catch(() => {});
    }
  },

  async saveNotes(id, noteVal, inputEl) {
    const item = this.inquiries.find(i => i.id === id);
    if (item && item.notes === noteVal) return;

    if (item) item.notes = noteVal;

    // Visual save confirmation
    inputEl.style.borderColor = 'var(--accent)';
    setTimeout(() => {
      inputEl.style.borderColor = 'var(--border-subtle)';
    }, 800);

    if (this.supabase) {
      try {
        await this.supabase
          .from('contacts')
          .update({ notes: noteVal })
          .eq('id', id);
      } catch (e) {
        console.warn('Notes update notice:', e);
      }
    } else {
      fetch(`${this.supabaseUrl}/rest/v1/contacts?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ notes: noteVal })
      }).catch(() => {});
    }
  },

  openDeleteModal(id, name) {
    this.deleteTargetId = id;
    document.getElementById('deleteTargetName').innerText = name;
    document.getElementById('deleteModal').style.display = 'flex';
  },

  closeDeleteModal() {
    this.deleteTargetId = null;
    document.getElementById('deleteModal').style.display = 'none';
  },

  async confirmDelete() {
    if (!this.deleteTargetId) return;

    const id = this.deleteTargetId;
    const btn = document.getElementById('confirmDeleteBtn');
    btn.disabled = true;
    btn.innerText = 'Deleting...';

    // Delete from Supabase
    if (this.supabase) {
      try {
        await this.supabase.from('contacts').delete().eq('id', id);
      } catch (e) {
        console.warn('Delete error:', e);
      }
    } else {
      fetch(`${this.supabaseUrl}/rest/v1/contacts?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      }).catch(() => {});
    }

    // Remove locally
    this.inquiries = this.inquiries.filter(i => i.id !== id);
    btn.disabled = false;
    btn.innerText = 'Delete Inquiry';
    this.closeDeleteModal();
    this.updateMetrics();
    this.applyFiltersAndRender();
  },

  async insertSampleInquiry() {
    const sample = {
      name: 'Ananya Desai',
      email: 'ananya.desai@startup.io',
      service: 'Landing Pages',
      message: 'Hi Dharsi, we are launching an organic skincare product line next month and need high-converting landing page words and social launch copies.',
      status: 'new',
      notes: 'Sample lead created from admin'
    };

    if (this.supabase) {
      try {
        const res = await this.supabase.from('contacts').insert([sample]).select();
        if (res.data && res.data[0]) {
          this.inquiries.unshift(res.data[0]);
        } else {
          sample.id = 'sample-' + Date.now();
          sample.created_at = new Date().toISOString();
          this.inquiries.unshift(sample);
        }
      } catch (e) {
        sample.id = 'sample-' + Date.now();
        sample.created_at = new Date().toISOString();
        this.inquiries.unshift(sample);
      }
    } else {
      sample.id = 'sample-' + Date.now();
      sample.created_at = new Date().toISOString();
      this.inquiries.unshift(sample);
    }

    this.updateMetrics();
    this.applyFiltersAndRender();
  },

  // ==========================================
  // EXPORT TO CSV
  // ==========================================
  exportToCSV() {
    if (this.inquiries.length === 0) {
      alert('No inquiries to export.');
      return;
    }

    const headers = ['Date', 'Name', 'Email', 'Service', 'Status', 'Message', 'Notes'];
    const rows = this.inquiries.map(item => [
      item.created_at ? new Date(item.created_at).toLocaleString() : '',
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.service || '').replace(/"/g, '""')}"`,
      `"${(item.status || '').replace(/"/g, '""')}"`,
      `"${(item.message || '').replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TalesAndTone_Inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // ==========================================
  // SQL SETUP MODAL & HELPERS
  // ==========================================
  openSqlModal() {
    document.getElementById('sqlModal').style.display = 'flex';
  },

  closeSqlModal() {
    document.getElementById('sqlModal').style.display = 'none';
  },

  closeSqlModalOnOutside(e) {
    if (e.target === document.getElementById('sqlModal')) {
      this.closeSqlModal();
    }
  },

  copySqlScript() {
    const code = document.getElementById('sqlCodeContent').innerText;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copySqlBtn');
      btn.innerText = 'Copied! ✓';
      setTimeout(() => {
        btn.innerText = 'Copy SQL';
      }, 2500);
    });
  },

  formatDate(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  adminApp.init();
});
