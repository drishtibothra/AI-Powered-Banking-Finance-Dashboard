import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { sendChatMessage } from "./aiChatApi";
import type { RootState } from "../../app/store";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  conversationId: number | null;
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversationId: null,
  messages: [],
  isSending: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  "aiChat/sendMessage",
  async (message: string, { getState }) => {
    const state = getState() as RootState;
    const { data } = await sendChatMessage({
      message,
      conversation_id: state.aiChat.conversationId,
    });
    return data;
  }
);

const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({ role: "user", content: action.payload });
    },
    resetConversation: (state) => {
      state.conversationId = null;
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.conversationId = action.payload.conversation_id;
        state.messages.push({ role: "assistant", content: action.payload.response });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.error.message || "Something went wrong. Please try again.";
      });
  },
});

export const { addUserMessage, resetConversation } = aiChatSlice.actions;
export default aiChatSlice.reducer;