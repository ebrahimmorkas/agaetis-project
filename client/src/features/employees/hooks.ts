import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeesApi } from './api'
import type { EmployeeFilters, EmployeePayload } from './types'

const employeeKeys = {
  all: ['employees'] as const,
  list: (filters: EmployeeFilters) => [...employeeKeys.all, 'list', filters] as const,
}

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeesApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

function useInvalidateEmployees() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: employeeKeys.all })
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees()
  return useMutation({
    mutationFn: (payload: EmployeePayload) => employeesApi.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateEmployees()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EmployeePayload> }) =>
      employeesApi.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteEmployee() {
  const invalidate = useInvalidateEmployees()
  return useMutation({
    mutationFn: (id: number) => employeesApi.remove(id),
    onSuccess: invalidate,
  })
}
