import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar,
  Menu, MenuItem, Divider, IconButton, Tooltip
} from '@mui/material';
import { Dashboard, FolderOpen, Logout, Person, Hexagon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard fontSize="small" /> },
    { label: 'Projects', path: '/projects', icon: <FolderOpen fontSize="small" /> },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/') && path !== '/';

  return (
    <AppBar position="sticky" elevation={0}
      sx={{ bgcolor: '#1e293b', borderBottom: '1px solid #334155' }}>
      <Toolbar>
        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1}
          sx={{ cursor: 'pointer', mr: 3 }}
          onClick={() => navigate('/dashboard')}>
          <Hexagon sx={{ color: '#3b82f6', fontSize: 26 }} />
          <Typography variant="h6" fontWeight={800}
            sx={{ color: '#f1f5f9', letterSpacing: -0.5, fontSize: 18 }}>
            Enterprise PMS
          </Typography>
        </Box>

        {/* Nav Links */}
        <Box display="flex" gap={0.5}>
          {navLinks.map(link => (
            <Button key={link.path}
              startIcon={link.icon}
              onClick={() => navigate(link.path)}
              size="small"
              sx={{
                color: isActive(link.path) ? '#fff' : '#94a3b8',
                bgcolor: isActive(link.path) ? '#3b82f6' : 'transparent',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.75,
                fontSize: 13,
                '&:hover': {
                  bgcolor: isActive(link.path) ? '#2563eb' : '#334155'
                }
              }}>
              {link.label}
            </Button>
          ))}
        </Box>

        <Box flex={1} />

        {/* User info + menu */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box textAlign="right" sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1 }}>
              {user?.email}
            </Typography>
          </Box>

          <Tooltip title="Account settings">
            <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{
                bgcolor: '#3b82f6', width: 34, height: 34,
                fontSize: 14, fontWeight: 700
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2 } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <Box px={2} py={1.5}>
            <Typography variant="body2" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
            <Person fontSize="small" sx={{ mr: 1.5, color: '#2563eb' }} />
            My Profile
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => { logout(); navigate('/login'); setAnchorEl(null); }}
            sx={{ color: 'error.main' }}>
            <Logout fontSize="small" sx={{ mr: 1.5 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}