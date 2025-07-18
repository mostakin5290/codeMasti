import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/send-otp', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ emailId, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/verify-otp', { emailId, otp });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid credentials');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check', {
        withCredentials: true
      });
      return data.user;
    } catch (error) {
      return rejectWithValue();
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check', { // Reuse the check endpoint
        withCredentials: true
      });
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);



export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (err) {
      return rejectWithValue('Logout failed. Please try again.');
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  'auth/googleLogin',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/user/google?code=${code}`);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google Sign-In failed.');
    }
  }
);

export const githubLoginUser = createAsyncThunk(
  'auth/githubLogin',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/user/github/callback', {
        params: { code }
      });
      return response.data.user;
    } catch (error) {
      console.error('GitHub login error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'GitHub authentication failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    otpSent: false,
    otpLoading: false,
    emailForOTP: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // NEW: Reducer to specifically update dailyChallenges
    updateUserDailyChallenges: (state, action) => {
      if (state.user) {
        state.user.dailyChallenges = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOTPState: (state) => {
      state.otpSent = false;
      state.otpLoading = false;
      state.emailForOTP = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(sendOTP.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.emailForOTP = action.meta.arg.emailId;
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpSent = false;
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        state.otpSent = false;
        state.emailForOTP = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addMatcher(
        isAnyOf(verifyOTP.fulfilled, registerUser.fulfilled, loginUser.fulfilled, checkAuth.fulfilled, googleLoginUser.fulfilled, githubLoginUser.fulfilled, fetchUser.fulfilled),
        (state, action) => {
          state.isAuthenticated = !!action.payload;
          state.user = action.payload;
          state.error = null;
        }
      )

      .addMatcher(
        isAnyOf(verifyOTP.pending, registerUser.pending, loginUser.pending, logoutUser.pending, googleLoginUser.pending, githubLoginUser.pending, fetchUser.pending),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addMatcher(
        isAnyOf(verifyOTP.rejected, registerUser.rejected, loginUser.rejected, logoutUser.rejected, checkAuth.rejected, fetchUser.rejected, googleLoginUser.rejected, githubLoginUser.rejected),
        (state, action) => {
          state.loading = false;
          if (isAnyOf(checkAuth.rejected, fetchUser.rejected)(action)) {
            state.isAuthenticated = false;
            state.user = null;
          } 
          state.error = action.payload || 'An authentication error occurred.';
        }
      )

      .addMatcher(
        isAnyOf(
          registerUser.fulfilled, loginUser.fulfilled, checkAuth.fulfilled, logoutUser.fulfilled, githubLoginUser.fulfilled, googleLoginUser.fulfilled, verifyOTP.fulfilled,fetchUser.fulfilled,
          registerUser.rejected, loginUser.rejected, checkAuth.rejected, logoutUser.rejected, githubLoginUser.rejected, googleLoginUser.rejected, verifyOTP.rejected,fetchUser.rejected,
        ),
        (state) => {
          state.loading = false;
        }
      )
  }
});

export const { setUser, clearError, resetOTPState, updateUserDailyChallenges } = authSlice.actions;

export default authSlice.reducer;