import axios from 'axios';

const BASE_URL = 'http://localhost:5082/api/study';

export const solveText = async (question) => {
  const res = await axios.post(`${BASE_URL}/solve`, { question });
  return res.data;
};

export const solveImage = async (imageBase64, mimeType = 'image/jpeg') => {
  const res = await axios.post(`${BASE_URL}/solve/image`, { imageBase64, mimeType });
  return res.data;
};

export const generateFlashcards = async (notes) => {
  const res = await axios.post(`${BASE_URL}/flashcards`, { notes });
  return res.data;
};

export const generateQuiz = async (topic) => {
  const res = await axios.post(`${BASE_URL}/quiz`, { topic });
  return res.data;
};

export const saveP = async (problem) => {
  const res = await axios.post(`${BASE_URL}/problems`, problem);
  return res.data;
};

export const getProblems = async () => {
  const res = await axios.get(`${BASE_URL}/problems`);
  return res.data;
};

export const deleteProblem = async (id) => {
  const res = await axios.delete(`${BASE_URL}/problems/${id}`);
  return res.data;
};