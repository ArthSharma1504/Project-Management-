import api from './axios'
import type { ApiResponse } from '../types/index'

export interface TaskResponse {
  id: number
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  projectId: number
  projectName: string
  currentPhaseId: number
  currentPhaseName: string
  isTerminalPhase: boolean
  assignedToId: number | null
  assignedToName: string | null
  dueDate: string | null
  storyPoints: number | null
  createdAt: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  priority?: string
  assignedToId?: number | null
  dueDate?: string | null
  storyPoints?: number | null
}

export interface AvailableTransition {
  phaseId: number
  phaseName: string
  requiresApproval: boolean
}

export const getProjectTasksApi = async (projectId: number): Promise<TaskResponse[]> => {
  const res = await api.get<ApiResponse<{ content: TaskResponse[] }>>(
    `/api/projects/${projectId}/tasks?size=50`
  )
  return res.data.data.content
}

export const createTaskApi = async (
  projectId: number,
  payload: CreateTaskPayload
): Promise<TaskResponse> => {
  const res = await api.post<ApiResponse<TaskResponse>>(
    `/api/projects/${projectId}/tasks`,
    payload
  )
  return res.data.data
}

export const moveTaskApi = async (
  taskId: number,
  targetPhaseId: number
): Promise<TaskResponse> => {
  const res = await api.patch<ApiResponse<TaskResponse>>(
    `/api/tasks/${taskId}/move`,
    { targetPhaseId }
  )
  return res.data.data
}

export const getAvailableTransitionsApi = async (
  taskId: number
): Promise<AvailableTransition[]> => {
  const res = await api.get<ApiResponse<AvailableTransition[]>>(
    `/api/tasks/${taskId}/next-phases`
  )
  return res.data.data
}

export const getTaskApi = async (taskId: number): Promise<TaskResponse> => {
  const res = await api.get<ApiResponse<TaskResponse>>(`/api/tasks/${taskId}`)
  return res.data.data
}

export const deleteTaskApi = async (taskId: number) => {
  await api.delete(`/api/tasks/${taskId}`)
}