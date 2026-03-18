import React from 'react';
import {
  Box, Typography, Paper, Avatar, Chip, Divider, Card, CardContent
} from '@mui/material';
import { Person, Email, Shield, Tag } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <Box maxWidth={700} mx="auto" p={3}>
        <Typography variant="h5" fontWeight={700} mb={3}>My Profile</Typography>

        {/* Profile card */}
        <Paper sx={{ p: 4, borderRadius: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={3} mb={3}>
            <Avatar sx={{
              width: 80, height: 80, bgcolor: '#2563eb',
              fontSize: 32, fontWeight: 700
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>{user?.name}</Typography>
              <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
              <Chip
                label={user?.systemRole || 'USER'}
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box display="flex" flexDirection="column" gap={1.5}>
            {[
              { icon: <Person sx={{ color: '#2563eb' }} />, label: 'Full Name', value: user?.name },
              { icon: <Email sx={{ color: '#7c3aed' }} />, label: 'Email Address', value: user?.email },
              { icon: <Shield sx={{ color: '#059669' }} />, label: 'System Role', value: user?.systemRole || 'USER' },
              { icon: <Tag sx={{ color: '#d97706' }} />, label: 'User ID', value: `#${user?.id}` },
            ].map(({ icon, label, value }) => (
              <Box key={label} display="flex" alignItems="center" gap={2} p={1.5}
                sx={{ bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                <Box>{icon}</Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {label}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>{value}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Permissions */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Your Permissions</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {[
              { label: 'Create and manage projects', allowed: true },
              { label: 'Create and assign tasks', allowed: true },
              { label: 'Move tasks through SDLC phases', allowed: true },
              { label: 'Add team members to projects', allowed: true },
              { label: 'Report and track issues', allowed: true },
              { label: 'Comment on tasks', allowed: true },
              { label: 'View audit activity log', allowed: true },
              { label: 'System administration', allowed: user?.systemRole === 'ADMIN' },
            ].map(({ label, allowed }) => (
              <Box key={label} display="flex" alignItems="center" gap={1.5} py={0.5}>
                <Box sx={{
                  width: 20, height: 20, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  bgcolor: allowed ? '#dcfce7' : '#f1f5f9',
                  color: allowed ? '#16a34a' : '#94a3b8',
                  fontSize: 12, fontWeight: 700, flexShrink: 0
                }}>
                  {allowed ? '✓' : '✗'}
                </Box>
                <Typography variant="body2" color={allowed ? 'text.primary' : 'text.secondary'}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* About the system */}
        <Paper sx={{ p: 3, borderRadius: 2, mt: 3, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>
            About Enterprise PMS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enterprise Project Management System supports Agile, Scrum, Waterfall, Kanban, V-Model,
            and Spiral SDLC methodologies. Track tasks through custom phases, manage team roles,
            report issues, comment on tasks, and maintain a complete immutable audit trail of all actions.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}