import { Job, Company, CandidateProfile, DashboardMetrics, JobApplication } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('vc_token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

async function request(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    if (!url.includes('/auth/login') && !url.includes('/auth/verify')) {
      localStorage.removeItem('vc_token');
      window.dispatchEvent(new Event('vc_unauthorized'));
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Não autorizado');
  }
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: async (password: string) => {
    return request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  },

  verifyToken: async () => {
    return request(`${API_BASE}/auth/verify`);
  },

  logout: async () => {
    try {
      await request(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {}
    localStorage.removeItem('vc_token');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return request(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  getDashboard: async (): Promise<DashboardMetrics> => {
    return request(`${API_BASE}/dashboard`);
  },

  getJobs: async (params?: { category?: string; modality?: string; regime?: string; search?: string }): Promise<Job[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.modality) query.set('modality', params.modality);
    if (params?.regime) query.set('regime', params.regime);
    if (params?.search) query.set('search', params.search);

    return request(`${API_BASE}/jobs?${query.toString()}`);
  },

  getJobById: async (id: string): Promise<Job> => {
    return request(`${API_BASE}/jobs/${id}`);
  },

  toggleSaveJob: async (id: string): Promise<{ is_saved: number }> => {
    return request(`${API_BASE}/jobs/${id}/save`, { method: 'PATCH' });
  },

  updateJobStatus: async (id: string, status: string, discard_reason?: string) => {
    return request(`${API_BASE}/jobs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, discard_reason })
    });
  },

  triggerSearch: async (): Promise<{ message: string; status: string }> => {
    return request(`${API_BASE}/search/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger_type: 'manual' })
    });
  },

  checkUrl: async (url: string) => {
    return request(`${API_BASE}/search/check-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
  },

  getSearchRuns: async () => {
    return request(`${API_BASE}/search/runs`);
  },

  getCompanies: async (): Promise<Company[]> => {
    return request(`${API_BASE}/companies`);
  },

  addCompany: async (company: Partial<Company>) => {
    return request(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
  },

  deleteCompany: async (id: string) => {
    return request(`${API_BASE}/companies/${id}`, { method: 'DELETE' });
  },

  getProfile: async (): Promise<CandidateProfile> => {
    return request(`${API_BASE}/profile`);
  },

  updateProfile: async (profile: CandidateProfile) => {
    return request(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
  },

  getApplications: async (): Promise<JobApplication[]> => {
    return request(`${API_BASE}/applications`);
  },

  saveApplication: async (appData: Partial<JobApplication>) => {
    return request(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
  },

  getResumes: async () => {
    return request(`${API_BASE}/resumes`);
  },

  getSettings: async () => {
    return request(`${API_BASE}/settings`);
  },

  saveSettings: async (settings: { key: string; value: string }[]) => {
    return request(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  },

  getLogs: async () => {
    return request(`${API_BASE}/logs`);
  },

  generateCustomAnswer: async (question: string, companyName?: string, jobTitle?: string) => {
    return request(`${API_BASE}/application/custom-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, companyName, jobTitle })
    });
  }
};
