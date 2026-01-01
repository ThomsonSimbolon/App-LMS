import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, handleUnauthorized, ApiError } from "../api";

interface PaymentIntent {
  paymentIntentId: number;
  clientSecret: string;
  amount: number;
  currency: string;
}

interface PaymentState {
  paymentIntent: PaymentIntent | null;
  loading: boolean;
  error: string | null;
  verifying: boolean;
}

const initialState: PaymentState = {
  paymentIntent: null,
  loading: false,
  error: null,
  verifying: false,
};

// Create payment intent
export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await apiPost<PaymentIntent>("payments/intent", { courseId });
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to create payment intent");
    }
  }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async (paymentIntentId: number, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ paymentIntent: any; enrollment: any }>(
        `payments/verify?paymentIntentId=${paymentIntentId}`
      );
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to verify payment");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.paymentIntent = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Payment Intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload;
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.verifying = false;
        state.paymentIntent = null; // Clear after successful verification
        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifying = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPayment, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;

