import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('alumiodtu_theme') || 'dark';

const initialState = {
  theme: savedTheme,
  sidebarOpen: true,
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('alumiodtu_theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('alumiodtu_theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, toggleSidebarCollapse, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;

export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
