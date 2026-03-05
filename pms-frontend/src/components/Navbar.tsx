import {
  AppBar, Toolbar, Typography, Box, Avatar, Tooltip,
  IconButton, Button
} from '@mui/material'
import {
  FolderOutlined, LogoutOutlined, NotificationsOutlined,
  DashboardOutlined
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const initials = user?.name
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  const handleLogout = () => { logout(); navigate('/login') }

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlined fontSize="small" /> },
    { label: 'Projects', path: '/projects', icon: <FolderOutlined fontSize="small" /> },
  ]

  return (
    <AppBar position="sticky" elevation={0} sx={{
      bgcolor: 'white',
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}>
      <Toolbar sx={{ gap: 1 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: 1.5,
            bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FolderOutlined sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" color="primary.main" fontWeight={700}>PMS</Typography>
        </Box>

        {/* Nav links */}
        <Box sx={{ display: 'flex', gap: 0.5, ml: 3, mr: 'auto' }}>
          {navLinks.map(link => (
            <Button
              key={link.path}
              startIcon={link.icon}
              onClick={() => navigate(link.path)}
              sx={{
                color: location.pathname === link.path
                  ? 'primary.main' : 'text.secondary',
                bgcolor: location.pathname === link.path
                  ? 'primary.50' : 'transparent',
                fontWeight: location.pathname === link.path ? 700 : 500,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        <Tooltip title="Notifications">
          <IconButton size="small"><NotificationsOutlined /></IconButton>
        </Tooltip>

        <Tooltip title={user?.email ?? ''}>
          <Avatar sx={{
            width: 34, height: 34, bgcolor: 'primary.main',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', ml: 0.5,
          }}>
            {initials}
          </Avatar>
        </Tooltip>

        <Tooltip title="Logout">
          <IconButton size="small" onClick={handleLogout}>
            <LogoutOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}