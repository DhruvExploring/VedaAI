import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
});

export async function createAssignment(formData: FormData) {
  const response = await api.post('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getAssignments() {
  const response = await api.get('/assignments');
  return response.data;
}

export async function getAssignment(id: string) {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
}

export async function getGeneratedPaper(assignmentId: string) {
  const response = await api.get(`/assignments/${assignmentId}/paper`);
  return response.data;
}

export async function regeneratePaper(assignmentId: string) {
  const response = await api.post(`/assignments/${assignmentId}/regenerate`);
  return response.data;
}

export async function deleteAssignment(id: string) {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
}
