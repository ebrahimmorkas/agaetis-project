import { api, type ApiResponse, type PaginatedData } from '@/lib/api'
import type { Employee, EmployeeFilters, EmployeePayload } from './types'

const BASE = '/users'

export const employeesApi = {
  async list(filters: EmployeeFilters) {
    const { data } = await api.get<ApiResponse<PaginatedData<Employee>>>(BASE, { params: filters })
    return data.data
  },

  async create(payload: EmployeePayload) {
    const { data } = await api.post<ApiResponse<Employee>>(BASE, payload)
    return data.data
  },

  async update(id: number, payload: Partial<EmployeePayload>) {
    const { data } = await api.patch<ApiResponse<Employee>>(`${BASE}/${id}`, payload)
    return data.data
  },

  async remove(id: number) {
    await api.delete(`${BASE}/${id}`)
  },
}
