const API = import.meta.env.VITE_API_URL ?? "";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN ?? "";

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": ADMIN_TOKEN,
      ...opts?.headers,
    },
    ...opts,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as T;
}

export type PortfolioItem = {
  id: number; title: string; clientName: string | null; type: string;
  description: string | null; coverImageUrl: string | null; featured: boolean;
  sortOrder: number; status: string; tags: string[]; createdAt: string; updatedAt: string;
};

export type BlogPost = {
  id: number; title: string; slug: string; content: string; excerpt: string | null;
  category: string; status: string; coverImageUrl: string | null; tags: string[];
  publishedAt: string | null; createdAt: string; updatedAt: string;
};

export type CrmContact = {
  id: number; name: string; email: string | null; phone: string | null;
  company: string | null; type: string; stage: string; notes: string | null;
  source: string | null; assignedTo: string | null; createdAt: string; updatedAt: string;
};

export const portfolioApi = {
  list: () => apiFetch<PortfolioItem[]>("/api/admin/portfolio"),
  get: (id: number) => apiFetch<PortfolioItem>(`/api/admin/portfolio/${id}`),
  create: (data: Partial<PortfolioItem>) => apiFetch<PortfolioItem>("/api/admin/portfolio", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<PortfolioItem>) => apiFetch<PortfolioItem>(`/api/admin/portfolio/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiFetch<void>(`/api/admin/portfolio/${id}`, { method: "DELETE" }),
};

export const blogApi = {
  list: () => apiFetch<BlogPost[]>("/api/admin/blog"),
  get: (id: number) => apiFetch<BlogPost>(`/api/admin/blog/${id}`),
  create: (data: Partial<BlogPost>) => apiFetch<BlogPost>("/api/admin/blog", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<BlogPost>) => apiFetch<BlogPost>(`/api/admin/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiFetch<void>(`/api/admin/blog/${id}`, { method: "DELETE" }),
};

export const crmApi = {
  list: () => apiFetch<CrmContact[]>("/api/admin/crm"),
  get: (id: number) => apiFetch<CrmContact>(`/api/admin/crm/${id}`),
  create: (data: Partial<CrmContact>) => apiFetch<CrmContact>("/api/admin/crm", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CrmContact>) => apiFetch<CrmContact>(`/api/admin/crm/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => apiFetch<void>(`/api/admin/crm/${id}`, { method: "DELETE" }),
};
