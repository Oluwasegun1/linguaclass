"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface LessonWithDetails {
  id: string
  courseId: string
  title: string
  scheduledAt: string
  durationMins: number
  timezone: string
  objectives: string | null
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
  createdAt?: string
  updatedAt?: string
  course: {
    id: string
    title: string
    language: string
    level: string
    enrollments: Array<{
      student: {
        user: {
          id: string
          name: string
          email: string
          avatarUrl: string | null
          timezone: string
        }
      }
    }>
  }
  session: {
    id: string
    status: string
    videoRoomId: string | null
  } | null
  resources: Array<{
    id: string
    fileName: string
    fileType: string
    url: string | null
  }>
  _count?: {
    assignments: number
    notes: number
  }
}

export function useLessons(courseId?: string, status?: string) {
  return useQuery<{ lessons: LessonWithDetails[] }>({
    queryKey: ["lessons", { courseId, status }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (courseId) params.append("courseId", courseId)
      if (status) params.append("status", status)

      const res = await fetch(`/api/lessons?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch lessons")
      }
      return res.json()
    },
  })
}

export function useLesson(id: string | undefined) {
  return useQuery<{ lesson: LessonWithDetails }>({
    queryKey: ["lessons", id],
    queryFn: async () => {
      if (!id) throw new Error("Lesson ID is required")
      const res = await fetch(`/api/lessons/${id}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch lesson")
      }
      return res.json()
    },
    enabled: !!id,
  })
}

export function useScheduleLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newLesson: {
      courseId: string
      title: string
      scheduledAt: string // UTC ISO string
      durationMins: number
      timezone: string
      objectives?: string
    }) => {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLesson),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to schedule lesson")
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
      queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

export function useRescheduleLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      scheduledAt?: string // UTC ISO string
      durationMins?: number
      timezone?: string
      title?: string
      objectives?: string
      status?: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
    }) => {
      const res = await fetch(`/api/lessons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update lesson")
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
      queryClient.invalidateQueries({ queryKey: ["lessons", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

export function useCancelLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/lessons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to cancel lesson")
      }
      return res.json()
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
      queryClient.invalidateQueries({ queryKey: ["lessons", id] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/lessons/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete lesson")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}
