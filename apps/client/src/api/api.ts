import { axiosInstance } from "@/entities/api/axios-instance";
import { ChatMessage } from "@sse-chatbot/shared";

export const getChat = async () => {
  const response = await axiosInstance.get("/v1/chat");
  return response.data;
};

export const postChat = async (message: ChatMessage) => {
  const response = await axiosInstance.post("/v1/chat", message);
  return response.data;
};
