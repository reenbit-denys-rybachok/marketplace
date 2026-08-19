import axios from 'axios';

type RequestListener = (activeRequests: number) => void;

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const listeners = new Set<RequestListener>();
let activeRequests = 0;

export const apiClient = axios.create({
  baseURL: apiUrl,
});

function notifyListeners() {
  listeners.forEach((listener) => listener(activeRequests));
}

function incrementActiveRequests() {
  activeRequests += 1;
  notifyListeners();
}

function decrementActiveRequests() {
  activeRequests = Math.max(0, activeRequests - 1);
  notifyListeners();
}

export function subscribeToRequests(listener: RequestListener) {
  listeners.add(listener);
  listener(activeRequests);

  return () => {
    listeners.delete(listener);
  };
}

apiClient.interceptors.request.use((config) => {
  incrementActiveRequests();
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    decrementActiveRequests();
    return response;
  },
  (error) => {
    decrementActiveRequests();
    return Promise.reject(error);
  },
);
