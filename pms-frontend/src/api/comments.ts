import axiosInstance from './axios';

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorEmail: string;
  taskId: number;
  createdAt: string;
  updatedAt: string;
}

export const getTaskCommentsApi = async (taskId: number): Promise<Comment[]> => {
  try {
    const res = await axiosInstance.get(`/api/tasks/${taskId}/comments`);
    return res.data.data || [];
  } catch {
    return [];
  }
};

export const addCommentApi = async (taskId: number, content: string): Promise<Comment> => {
  const res = await axiosInstance.post(`/api/tasks/${taskId}/comments`, { content });
  return res.data.data;
};

export const deleteCommentApi = async (commentId: number): Promise<void> => {
  await axiosInstance.delete(`/api/comments/${commentId}`);
};