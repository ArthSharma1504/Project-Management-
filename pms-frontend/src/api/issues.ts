import axiosInstance from './axios';

export interface Issue {
  id: number;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  reportedById: number;
  reportedByName: string;
  assignedToId?: number;
  assignedToName?: string;
  projectId: number;
  taskId?: number;
  createdAt: string;
  updatedAt: string;
}

export const getProjectIssuesApi = async (projectId: number): Promise<Issue[]> => {
  try {
    const res = await axiosInstance.get(`/api/projects/${projectId}/issues`);
    return res.data.data || [];
  } catch {
    return [];
  }
};

export const createIssueApi = async (
  projectId: number,
  data: { title: string; description: string; severity: string; taskId?: number }
): Promise<Issue> => {
  const res = await axiosInstance.post(`/api/projects/${projectId}/issues`, data);
  return res.data.data;
};

export const updateIssueStatusApi = async (issueId: number, status: string): Promise<Issue> => {
  const res = await axiosInstance.patch(`/api/issues/${issueId}/status`, { status });
  return res.data.data;
};

export const deleteIssueApi = async (issueId: number): Promise<void> => {
  await axiosInstance.delete(`/api/issues/${issueId}`);
};