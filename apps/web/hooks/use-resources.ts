"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface ResourceItem {
  id: string
  fileName: string
  fileType: string
  storageKey: string | null
  url: string | null
  courseId: string | null
  lessonId: string | null
  uploadedBy: string
  createdAt: string
}

export function useResources(courseId?: string, lessonId?: string) {
  return useQuery<{ resources: ResourceItem[] }>({
    queryKey: ["resources", { courseId, lessonId }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (courseId) params.append("courseId", courseId)
      if (lessonId) params.append("lessonId", lessonId)

      const res = await fetch(`/api/resources?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch resources")
      }
      return res.json()
    },
  })
}

export function useAttachResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (resource: {
      fileName: string
      fileType: string
      url?: string
      storageKey?: string
      courseId?: string
      lessonId?: string
    }) => {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to attach resource")
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources"] })
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId] })
      }
      if (variables.lessonId) {
        queryClient.invalidateQueries({ queryKey: ["lessons", variables.lessonId] })
      }
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete resource")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      queryClient.invalidateQueries({ queryKey: ["lessons"] })
    },
  })
}
