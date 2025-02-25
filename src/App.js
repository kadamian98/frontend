import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Switch } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Dashboard1 from './components/Dashboard1';
import Dashboard2 from './components/Dashboard2';
import Dashboard3 from './components/Dashboard3';
import ThemeContextProvider, { ThemeContext } from './ThemeContext';

const App = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: darkMode ? '#333' : '#1976d2' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              SIS SALONES
            </Typography>
            <Button color="inherit" component={Link} to="/dashboard1" sx={{ marginRight: 2 }}>
              DISTRIBUCIÓN
            </Button>
            <Button color="inherit" component={Link} to="/dashboard2" sx={{ marginRight: 2 }}>
              VISTA FACULTADES
            </Button>
            <Button color="inherit" component={Link} to="/dashboard3">
              INTERCAMBIO
            </Button>
            <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />
          </Toolbar>
        </AppBar>
        <Box sx={{ padding: 2 }}>
          <Routes>
            <Route path="/dashboard1" element={<Dashboard1 />} />
            <Route path="/dashboard2" element={<Dashboard2 />} />
            <Route path="/dashboard3" element={<Dashboard3 />} />
            {/* Agrega rutas para los otros dashboards */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default function AppWrapper() {
  return (
    <ThemeContextProvider>
      <App />
    </ThemeContextProvider>
  );
}