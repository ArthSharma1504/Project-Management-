import api from './axios'
import type { AuthResponse, ApiResponse } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', payload)
  return res.data.data
}

export const registerApi = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', payload)
  return res.data.data
}