import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPatch, handleUnauthorized, ApiError } from "../api";
import { getApiUrl } from "@/lib/api";

interface User {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
}

interface Certificate {
  id: number;
  certificateNumber: string;
  status: string;
  courseVersion?: string;
  createdAt: string;
  issuedAt?: string | null;
  user?: User | null;
  course?: Course | null;
}

interface CertificateState {
  certificates: Certificate[];
  myCertificates: Certificate[];
  currentCertificate: Certificate | null;
  loading: boolean;
  error: string | null;
  message: string | null; // For backend messages (e.g., when ASSESSOR has no assigned courses)
}

const initialState: CertificateState = {
  certificates: [],
  myCertificates: [],
  currentCertificate: null,
  loading: false,
  error: null,
  message: null,
};

// Async thunks
export const fetchPendingCertificates = createAsyncThunk(
  "certificate/fetchPendingCertificates",
  async (_, { rejectWithValue }) => {
    try {
      // Use fetch directly to get raw response including message
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const response = await fetch(getApiUrl("certificates/pending/list"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.error || data.message || "An error occurred",
          status: response.status,
          data: data,
        };
        throw error;
      }

      // Handle both array and object response
      const certificates = Array.isArray(data.data)
        ? data.data
        : data.data?.certificates || [];
      const message = data.message || null;

      return { certificates, message };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to fetch pending certificates"
      );
    }
  }
);

export const approveCertificate = createAsyncThunk(
  "certificate/approveCertificate",
  async (
    {
      certificateId,
      status,
      rejectionReason,
    }: {
      certificateId: number;
      status: "APPROVED" | "REJECTED";
      rejectionReason?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await apiPatch(`certificates/${certificateId}/approve`, {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
      });
      return { certificateId, status };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to process certificate"
      );
    }
  }
);

export const fetchMyCertificates = createAsyncThunk(
  "certificate/fetchMyCertificates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<
        Certificate[] | { certificates: Certificate[] }
      >("certificates/me");
      const certificates = Array.isArray(response)
        ? response
        : (response as { certificates: Certificate[] }).certificates || [];
      return certificates;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to fetch certificates"
      );
    }
  }
);

export const verifyCertificate = createAsyncThunk(
  "certificate/verifyCertificate",
  async (certificateNumber: string, { rejectWithValue }) => {
    try {
      return await apiGet<Certificate>(
        `certificates/verify/${certificateNumber}`,
        { includeAuth: false }
      );
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(
        apiError.message || "Failed to verify certificate"
      );
    }
  }
);

const certificateSlice = createSlice({
  name: "certificate",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCertificate: (state) => {
      state.currentCertificate = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Pending Certificates
    builder
      .addCase(fetchPendingCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchPendingCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload.certificates;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(fetchPendingCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      });

    // Approve Certificate
    builder
      .addCase(approveCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = state.certificates.filter(
          (cert) => cert.id !== action.payload.certificateId
        );
        state.error = null;
      })
      .addCase(approveCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch My Certificates
    builder
      .addCase(fetchMyCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.myCertificates = action.payload;
        state.error = null;
      })
      .addCase(fetchMyCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify Certificate
    builder
      .addCase(verifyCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCertificate = action.payload;
        state.error = null;
      })
      .addCase(verifyCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentCertificate, clearMessage } =
  certificateSlice.actions;
export default certificateSlice.reducer;
