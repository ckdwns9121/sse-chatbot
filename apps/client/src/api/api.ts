import { Message } from "@/entitis/types/message";
import { axiosInstance } from "@/entitis/api/axios-instance";

export const getChat = async () => {
  const response = await axiosInstance.get("/v1/chat");
  return response.data;
};

export const postChat = async (message: Message) => {
  const response = await axiosInstance.post("/v1/chat", message);
  return response.data;
};
