/**
 * TALES & TONE — Interactive Application Logic
 * Dharsi Chauhan — Freelance Writer & Brand Voice Studio
 */

const app = {
  // Case Study Data Repository with simple, friendly copy excerpts
  projects: {
    nexgen: {
      category: "Real Estate Content",
      client: "NexGen Realtors · Vadodara",
      title: "NexGen Realtors: Clear & Friendly Home Descriptions",
      challenge: "Property ads often use boring numbers or confusing words that do not help families picture their future home.",
      deliverables: "Property brochures, social media posts, and neighborhood guides.",
      role: "I wrote friendly, simple descriptions that show buyers what it really feels like to live in the home.",
      excerpt: `<p><em>“A home is more than just square feet. It is enjoying quiet morning tea on your balcony. It is having enough space for family dinners and children playing. At NexGen, we build homes made for real life.”</em></p>
      <p style="font-size:0.95rem; color:#666; margin-top:0.75rem;"><strong>Simple Headlines Used:</strong><br>
      • “Homes Built for the Way Families in Vadodara Live.”<br>
      • “More Space. More Peace of Mind. Welcome to Your New Home.”</p>`
    },
    certified: {
      category: "Concept Project · Consulting & Strategy",
      client: "Certified Insane Consulting & Analytics (Concept Project · No Live Website)",
      title: "Certified Insane: Explaining Business Services in Simple Words",
      challenge: "Data and consulting companies often use heavy words and technical terms that normal business owners cannot easily understand.",
      deliverables: "Brand narrative, business concept decks, service explanations, and simple guides (No live website).",
      role: "I explained their business tools and data services using simple, everyday words so clients know exactly how it helps them.",
      excerpt: `<p><em>“Numbers and data are helpful, but only if they make sense. We help business owners find what is working, fix what is slow, and grow with confidence—without any confusing tech talk.”</em></p>
      <p style="font-size:0.95rem; color:#666; margin-top:0.75rem;"><strong>Main Tagline:</strong><br>
      • “Clear Advice. Real Facts. Business Help Without the Hard Words.”</p>
      <p style="font-size:0.85rem; color:#888; margin-top:0.6rem; font-style:italic;">*Note: This is an internal concept project & brand narrative exercise. This firm does not have an active public website.</p>`
    },
    ecommerce: {
      category: "E-Commerce & Retail",
      client: "Online Clothing & Lifestyle Stores",
      title: "E-Commerce: Product Descriptions That Help Shoppers Buy",
      challenge: "Shoppers often leave shopping websites when product descriptions are too dry or do not explain how the item looks and feels.",
      deliverables: "Clear product descriptions, simple buying guides, and category pages.",
      role: "I wrote helpful descriptions that explain the cloth, fit, and style so customers feel happy and confident ordering.",
      excerpt: `<p><em>“Made from soft, breathable pure cotton that gets softer every time you wash it. This comfortable shirt looks great for school, college, work, or casual weekend outings with friends.”</em></p>
      <p style="font-size:0.95rem; color:#666; margin-top:0.75rem;"><strong>Banner Text:</strong><br>
      • “Clothes made to look great, feel soft, and last a long time.”</p>`
    },
    lifestyle: {
      category: "Blogs & Articles",
      client: "Travel Blogs & Hotel Guides",
      title: "Lifestyle & Travel: Fun Articles That Readers Love",
      challenge: "Many travel blogs sound like copied lists. Readers want honest stories and helpful tips they can actually use on their trips.",
      deliverables: "City travel guides, hotel reviews, food stories, and weekend trip ideas.",
      role: "I researched local food, places to visit, and cultural spots to write fun, easy-to-read articles.",
      excerpt: `<p><em>“Vadodara is a city of beautiful royal palaces, big green parks, and warm people. Take a morning walk near the palace gardens, enjoy a warm cup of masala chai, and explore the lively street markets in the evening.”</em></p>`
    },
    marketing: {
      category: "Marketing & Campaigns",
      client: "Modern Brands & New Launches",
      title: "Landing Pages: Simple Words That Encourage Action",
      challenge: "Sales pages often sound too pushy or loud, which makes visitors close the tab.",
      deliverables: "Product launch pages, clear email messages, and ad headlines.",
      role: "I wrote clear, honest text that explains why the product is great and makes it easy for visitors to sign up.",
      excerpt: `<p><em>“You worked hard on your product. Let us help you tell people about it in simple, friendly words that make them want to try it today.”</em></p>
      <p style="font-size:0.95rem; color:#666; margin-top:0.75rem;"><strong>Simple Promise:</strong><br>
      • “No pushy sales talk. Just an honest, 20-minute chat about your brand words.”</p>`
    }
  },

  currentProject: null,
  supabaseUrl: 'https://tyesjcqfhtidkvpyyktc.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZXNqY3FmaHRpZGt2cHl5a3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODQyMTgsImV4cCI6MjEwNTQ2MDIxOH0.nuk3lHEZP69CQ9mK2k8busCAOQK16k2cs95LULfBAsY',
  supabaseClient: null,

  init() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      this.supabaseClient = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
    }
    this.bindNavigation();
    this.bindDrawer();
    this.bindScrollEffects();
    this.bindPortfolioFilters();
    this.bindKeyListeners();
    this.handleInitialRoute();
  },

  // ==========================================
  // VIEW NAVIGATION SYSTEM
  // ==========================================
  switchView(viewId, pushHistory = true) {
    const validViews = ['home', 'about', 'services', 'portfolio', 'experience', 'contact'];
    const target = validViews.includes(viewId) ? viewId : 'home';

    // Update active view DOM
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active-view');
    });

    const activeView = document.getElementById(target);
    if (activeView) {
      activeView.classList.add('active-view');
    }

    // Update desktop nav links
    document.querySelectorAll('.site-nav .nav-link').forEach(link => {
      if (link.getAttribute('data-nav') === target) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update mobile drawer links
    document.querySelectorAll('.drawer-link').forEach(link => {
      if (link.getAttribute('data-nav') === target) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update URL hash without jumping
    if (pushHistory) {
      window.history.pushState(null, '', `#${target}`);
    }

    // Update document title for SEO & navigation clarity
    const pageTitles = {
      home: "Tales & Tone | Stories With Character — Dharsi Chauhan | Content Writing & Brand Voice Studio",
      about: "About Dharsi Chauhan | Tales & Tone — Founder & Editorial Writer",
      services: "Content Writing Services & Deliverables | Tales & Tone — Dharsi Chauhan",
      portfolio: "Selected Work & Writing Case Studies | Tales & Tone — Dharsi Chauhan",
      experience: "Writing Experience & Brand Background | Tales & Tone — Dharsi Chauhan",
      contact: "Connect & Inquire | Tales & Tone — Dharsi Chauhan"
    };
    if (pageTitles[target]) {
      document.title = pageTitles[target];
    }

    // Reset scroll to top cleanly
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Close mobile drawer if open
    this.closeDrawer();
  },

  bindNavigation() {
    // Intercept clicks on links with data-nav attribute
    document.addEventListener('click', (e) => {
      const targetNav = e.target.closest('[data-nav]');
      if (targetNav) {
        e.preventDefault();
        const viewName = targetNav.getAttribute('data-nav');
        this.switchView(viewName);
      }
    });

    // Handle browser forward/back buttons
    window.addEventListener('popstate', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      this.switchView(hash, false);
    });
  },

  handleInitialRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    this.switchView(hash, false);
    // Ensure clean top scroll on direct hash loads
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  },

  // ==========================================
  // MOBILE DRAWER
  // ==========================================
  bindDrawer() {
    const mobileToggle = document.getElementById('mobileToggle');
    const drawerClose = document.getElementById('drawerClose');
    const drawerBackdrop = document.getElementById('drawerBackdrop');

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const drawer = document.getElementById('mobileDrawer');
        if (drawer && drawer.classList.contains('open')) {
          this.closeDrawer();
        } else {
          this.openDrawer();
        }
      });
    }
    if (drawerClose) {
      drawerClose.addEventListener('click', () => this.closeDrawer());
    }
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', () => this.closeDrawer());
    }
  },

  openDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const toggle = document.getElementById('mobileToggle');
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    const drawer = document.getElementById('mobileDrawer');
    const toggle = document.getElementById('mobileToggle');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  },

  // ==========================================
  // HEADER SCROLL SHADOW
  // ==========================================
  bindScrollEffects() {
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  },

  // ==========================================
  // PORTFOLIO FILTERING
  // ==========================================
  bindPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.portfolio-card');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  },

  // ==========================================
  // CASE STUDY MODAL
  // ==========================================
  openProjectModal(projectId) {
    const project = this.projects[projectId];
    if (!project) return;

    this.currentProject = project;

    document.getElementById('modalCategory').textContent = project.category;
    document.getElementById('modalClient').textContent = project.client;
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalChallenge').textContent = project.challenge;
    document.getElementById('modalDeliverables').textContent = project.deliverables;
    document.getElementById('modalRole').textContent = project.role;
    document.getElementById('modalExcerpt').innerHTML = project.excerpt;

    const modal = document.getElementById('projectModal');
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  },

  closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  },

  inquireFromModal() {
    const currentTitle = this.currentProject ? this.currentProject.category : '';
    this.closeProjectModal();
    this.inquireService(currentTitle);
  },

  // ==========================================
  // SERVICES TO CONTACT PRE-SELECTION
  // ==========================================
  inquireService(serviceName) {
    this.switchView('contact');

    // Pre-populate service dropdown
    const select = document.getElementById('userService');
    if (select) {
      let matched = false;
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.toLowerCase().includes(serviceName.toLowerCase()) || 
            serviceName.toLowerCase().includes(select.options[i].value.toLowerCase())) {
          select.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) {
        select.value = 'Other Project';
      }
    }

    // Smooth focus on form
    setTimeout(() => {
      const nameInput = document.getElementById('userName');
      if (nameInput) {
        nameInput.focus();
      }
    }, 400);
  },

  // ==========================================
  // FORM SUBMISSION & WHATSAPP
  // ==========================================
  async handleFormSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('formSuccessToast');
    const submitBtn = document.getElementById('submitBtn');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const service = document.getElementById('userService').value;
    const message = document.getElementById('userMessage').value.trim();

    // Visual feedback while saving
    submitBtn.disabled = true;
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Sending Message...</span>`;

    let saved = false;

    // 1. Attempt to save to Supabase
    try {
      if (!this.supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
        this.supabaseClient = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
      }

      if (this.supabaseClient) {
        const { error } = await this.supabaseClient
          .from('contacts')
          .insert([{ name, email, service, message, status: 'new' }]);
        if (!error) saved = true;
      } else {
        // Direct REST fallback
        const response = await fetch(`${this.supabaseUrl}/rest/v1/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ name, email, service, message, status: 'new' })
        });
        if (response.ok) saved = true;
      }
    } catch (err) {
      console.warn('Supabase submission status:', err);
    }

    // Show confirmation toast
    toast.style.display = 'flex';
    form.reset();

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Message Sent ✓</span>`;
    setTimeout(() => {
      submitBtn.innerHTML = originalBtnContent;
    }, 4000);

    // Auto-hide toast after 8 seconds
    setTimeout(() => {
      toast.style.display = 'none';
    }, 8000);
  },

  sendViaWhatsApp() {
    const name = document.getElementById('userName').value.trim() || 'A brand partner';
    const service = document.getElementById('userService').value || 'Writing & Brand Voice';
    const message = document.getElementById('userMessage').value.trim() || 'I would like to discuss a content writing project.';

    const text = `Hi Dharsi,\n\nI am contacting you through Tales & Tone.\n*Name:* ${name}\n*Service Interested In:* ${service}\n*Project Details:* ${message}`;
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/919313100689?text=${encoded}`;

    window.open(url, '_blank');
  },

  // ==========================================
  // KEYBOARD ACCESSIBILITY
  // ==========================================
  bindKeyListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeProjectModal();
        this.closeDrawer();
      }
    });
  }
};

// Initialize application on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
