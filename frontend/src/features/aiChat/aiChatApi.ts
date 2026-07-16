import apiClient from "../../api/client";

export interface ChatRequestPayload {
  message: string;
  conversation_id?: number | null;
}

export interface ChatResponsePayload {
  conversation_id: number;
  response: string;
}

export const sendChatMessage = (payload: ChatRequestPayload) =>
  apiClient.post<ChatResponsePayload>("/ai/chat", payload);