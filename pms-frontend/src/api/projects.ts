import api from './axios'
import { type ApiResponse } from '../types/index'

export interface ProjectResponse {
  id: number
  name: string
  description: string
  status: string
  sdlcModelId: number
  sdlcModelName: string
  createdById: number
  createdByName: string
  memberCount: number
  createdAt: string
}

export interface ProjectMember {
  userId: number
  name: string
  email: string
  role: 'TEAM_LEAD' | 'DEVELOPER' | 'QA' | 'VIEWER'
  joinedAt: string
}

export interface CreateProjectPayload {
  name: string
  description: string
  sdlcModelId: number
}

export interface SdlcModel {
  id: number
  name: string
  type: string
  description: string
  phases: { id: number; name: string; displayOrder: number; isTerminal: boolean }[]
}

export const getMyProjectsApi = async (): Promise<ProjectResponse[]> => {
  const res = await api.get<ApiResponse<ProjectResponse[]>>('/api/projects')
  return res.data.data
}

export const getProjectApi = async (projectId: number): Promise<ProjectResponse> => {
  const res = await api.get<ApiResponse<ProjectResponse>>(`/api/projects/${projectId}`)
  return res.data.data
}

export const createProjectApi = async (payload: CreateProjectPayload): Promise<ProjectResponse> => {
  const res = await api.post<ApiResponse<ProjectResponse>>('/api/projects', payload)
  return res.data.data
}

export const getMembersApi = async (projectId: number): Promise<ProjectMember[]> => {
  const res = await api.get<ApiResponse<ProjectMember[]>>(`/api/projects/${projectId}/members`)
  return res.data.data
}

// CORRECT:
export const addMemberApi = async (projectId: number, data: { userId: number; role: string }) => {
  const res = await api.post(`/api/projects/${projectId}/members`, data);
  return res.data.data;
};

export const removeMemberApi = async (projectId: number, targetUserId: number) => {
  await api.delete(`/api/projects/${projectId}/members/${targetUserId}`)
}

export const deleteProjectApi = async (projectId: number) => {
  await api.delete(`/api/projects/${projectId}`)
}

export const getSdlcModelsApi = async (): Promise<SdlcModel[]> => {
  const res = await api.get<ApiResponse<SdlcModel[]>>('/api/sdlc/defaults')
  return res.data.data
}