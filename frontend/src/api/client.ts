import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8001',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = async (name: string, email: string, password: string, phone: string) => {
  const res = await API.post('/register', { name, email, password, phone })
  return res.data
}

export const loginUser = async (email: string, password: string) => {
  const res = await API.post('/login', { email, password })
  return res.data
}

export const analyzeMessage = async (text: string) => {
  const res = await API.post('/analyze', { text })
  return res.data
}

export const getMyTickets = async () => {
  const res = await API.get('/tickets/me')
  return res.data
}

export const getAllTickets = async () => {
  const res = await API.get('/tickets/all')
  return res.data
}

export const updateTicketStatus = async (ticketId: string, status: string) => {
  const res = await API.put(`/tickets/${ticketId}/status`, { status })
  return res.data
}