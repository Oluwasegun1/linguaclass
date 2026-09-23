"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CourseLevel } from "@workspace/database"

export interface CourseWithCounts {
  id: string
  teacherId: string
  title: string
  language: string
  level: CourseLevel
  description: string | null
  createdAt: string
  updatedAt: string
  _count: {
    enrollments: number
    lessons: number
    resources: number
  }
}

export interface CourseDetails extends CourseWithCounts {
  teacher: {
    user: {
      id: string
      name: string
      email: string
      avatarUrl: string | null
      timezone: string
    }
  }
  lessons: Array<{
    id: string
    courseId: string
    title: string
    scheduledAt: string
    durationMins: number
    timezone: string
    objectives: string | null
    status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
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
    _count: {
      assignments: number
      notes: number
    }
  }>
  resources: Array<{
    id: string
    fileName: string
    fileType: string
    url: string | null
    createdAt: string
  }>
  enrollments: Array<{
    id: string
    student: {
      id: string
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

export function useCourses() {
  return useQuery<{ courses: CourseWithCounts[] }>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses")
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch courses")
      }
      return res.json()
    },
  })
}

export function useCourse(id: string | undefined) {
  return useQuery<{ course: CourseDetails }>({
    queryKey: ["courses", id],
    queryFn: async () => {
      if (!id) throw new Error("Course ID is required")
      const res = await fetch(`/api/courses/${id}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch course")
      }
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newCourse: {
      title: string
      language: string
      level: CourseLevel
      description?: string
    }) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create course")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      title?: string
      language?: string
      level?: CourseLevel
      description?: string
    }) => {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update course")
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      queryClient.invalidateQueries({ queryKey: ["courses", variables.id] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete course")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}
