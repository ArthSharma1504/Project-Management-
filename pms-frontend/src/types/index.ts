export interface AuthResponse {
  token: string
  tokenType: string
  userId: number
  name: string
  email: string
  systemRole: 'USER' | 'ADMIN'
  expiresIn: number
}

export interface User {
  userId: number
  name: string
  email: string
  systemRole: 'USER' | 'ADMIN'
}

export interface Project {
  id: number
  name: string
  description: string
  status: string
  sdlcModelId: number
  sdlcModelName: string
  memberCount: number
  taskCount: number
  createdAt: string
}

export interface Task {
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

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}