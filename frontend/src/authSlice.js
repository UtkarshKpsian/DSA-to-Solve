import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient'

// Helper function to extract serializable error data
const extractErrorData = (error) => {
  if (error.response) {
    // Server responded with error status
    const errorData = error.response.data;
    if (errorData && typeof errorData === 'object' && errorData.message) {
      return {
        message: errorData.message,
        status: error.response.status,
        statusText: error.response.statusText
      };
    }
    return {
      message: typeof errorData === 'string' ? errorData : 'Server error',
      status: error.response.status,
      statusText: error.response.statusText
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - unable to connect to server',
      status: 0,
      statusText: 'Network Error'
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      statusText: 'Unknown Error'
    };
  }
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Attempting to register user with data:', userData);
      const response = await axiosClient.post('/user/register', userData);
      console.log('Registration response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(extractErrorData(error));
    }
  }
);

export const loginUser = createAsyncThunk(
    'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting to login user with credentials:', credentials);
      const response = await axiosClient.post('/user/login', credentials);
      console.log('Login response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(extractErrorData(error));
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Checking authentication...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const authPromise = axiosClient.get('/user/check');
      
      const { data } = await Promise.race([authPromise, timeoutPromise]);
      console.log('Check auth response:', data);
      return data.user;
    } catch (error) {
      console.error('Check auth error:', error);
      // Handle 401 (Unauthorized) gracefully - this is normal for non-authenticated users
      if (error.response?.status === 401) {
        console.log('User not authenticated - this is normal');
        return rejectWithValue(null); // Special case for no session - don't show error
      }
      // Handle timeout
      if (error.message === 'Request timeout') {
        console.log('Auth check timeout - treating as not authenticated');
        return rejectWithValue(null);
      }
      // Only show error for other types of errors
      return rejectWithValue(extractErrorData(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      return rejectWithValue(extractErrorData(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        // Only set error if it's not a null case (user not authenticated)
        if (action.payload !== null) {
          state.error = action.payload?.message || 'Something went wrong';
        }
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      });
  }
});

export default authSlice.reducer;