import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Avatar, Chip, Button, TextField,
  MenuItem, Select, FormControl, InputLabel, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent
} from '@mui/material';
import { PersonAdd, Delete, Group, AdminPanelSettings, Engineering, Visibility } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { getProjectApi, getMembersApi, addMemberApi, removeMemberApi } from '../api/projects';

const roleIcon: Record<string, React.ReactNode> = {
  TEAM_LEAD: <AdminPanelSettings sx={{ fontSize: 16, color: '#2563eb' }} />,
  DEVELOPER: <Engineering sx={{ fontSize: 16, color: '#7c3aed' }} />,
  VIEWER: <Visibility sx={{ fontSize: 16, color: '#64748b' }} />,
};
const roleColor: Record<string, any> = {
  TEAM_LEAD: 'primary', DEVELOPER: 'secondary', VIEWER: 'default'
};
const avatarColors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

export default function MembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [members, setMembers] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ userId: '', role: 'DEVELOPER' });

  useEffect(() => { if (projectId) loadAll(); }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([
        getProjectApi(Number(projectId)),
        getMembersApi(Number(projectId))
      ]);
      setProject(p);
      setMembers(m);
    } catch {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!form.userId) return;
    try {
      await addMemberApi(Number(projectId), { userId: Number(form.userId), role: form.role });
      await loadAll();
      setAddDialog(false);
      setForm({ userId: '', role: 'DEVELOPER' });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to add member. Check the user ID.');
    }
  };

  const handleRemove = async (userId: number) => {
    try {
      await removeMemberApi(Number(projectId), userId);
      setMembers(prev => prev.filter(m => m.userId !== userId));
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to remove member');
    }
  };

  const roleCounts = {
    TEAM_LEAD: members.filter(m => m.projectRole === 'TEAM_LEAD').length,
    DEVELOPER: members.filter(m => m.projectRole === 'DEVELOPER').length,
    VIEWER: members.filter(m => m.projectRole === 'VIEWER').length,
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <Box maxWidth={1000} mx="auto" p={3}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={700} display="flex" alignItems="center" gap={1}>
              <Group /> Team Members
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project?.name} — Manage who has access
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setAddDialog(true)}>
            Add Member
          </Button>
        </Box>

        {/* Role summary cards */}
        <Box display="flex" gap={2} mb={3}>
          {[
            { role: 'TEAM_LEAD', label: 'Team Leads', color: '#2563eb', bg: '#eff6ff' },
            { role: 'DEVELOPER', label: 'Developers', color: '#7c3aed', bg: '#f5f3ff' },
            { role: 'VIEWER', label: 'Viewers', color: '#64748b', bg: '#f8fafc' },
          ].map(({ role, label, color, bg }) => (
            <Card key={role} sx={{ flex: 1, borderRadius: 2, bgcolor: bg, border: `1px solid ${color}22` }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Box mb={0.5}>{roleIcon[role]}</Box>
                <Typography variant="h4" fontWeight={800} color={color}>
                  {roleCounts[role as keyof typeof roleCounts]}
                </Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Members table */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                  <TableCell><strong>Member</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Joined</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No members found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : members.map((member, idx) => (
                  <TableRow key={member.userId} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{
                          bgcolor: avatarColors[idx % avatarColors.length],
                          width: 36, height: 36, fontSize: 14, fontWeight: 700
                        }}>
                          {member.userName?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>{member.userName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{member.userEmail}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={roleIcon[member.projectRole] as any}
                        label={member.projectRole?.replace('_', ' ')}
                        color={roleColor[member.projectRole]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {member.projectRole !== 'TEAM_LEAD' && (
                        <Tooltip title="Remove from project">
                          <IconButton size="small" color="error"
                            onClick={() => handleRemove(member.userId)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Role descriptions */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>Role Permissions</Typography>
          <Box display="flex" gap={3} flexWrap="wrap">
            {[
              { role: 'TEAM_LEAD', color: '#2563eb', perms: ['Create & delete tasks', 'Move tasks between phases', 'Add/remove members', 'Delete project', 'Report issues'] },
              { role: 'DEVELOPER', color: '#7c3aed', perms: ['Create tasks', 'Move own tasks', 'Comment on tasks', 'Report issues', 'View all tasks'] },
              { role: 'VIEWER', color: '#64748b', perms: ['View all tasks', 'View team members', 'View issues', 'Read-only access'] },
            ].map(({ role, color, perms }) => (
              <Box key={role} flex="1" minWidth={200}>
                <Typography variant="body2" fontWeight={700} color={color} mb={1}>
                  {role.replace('_', ' ')}
                </Typography>
                {perms.map(p => (
                  <Typography key={p} variant="caption" display="flex" alignItems="center" gap={0.5} mb={0.5}>
                    <span style={{ color: '#10b981' }}>✓</span> {p}
                  </Typography>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Add Member Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="User ID *" type="number"
            value={form.userId}
            onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}
            sx={{ mb: 2 }} size="small"
            helperText="Enter the numeric user ID of the person to add" />
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              label="Role">
              <MenuItem value="TEAM_LEAD">Team Lead — Full access</MenuItem>
              <MenuItem value="DEVELOPER">Developer — Can create & move tasks</MenuItem>
              <MenuItem value="VIEWER">Viewer — Read only</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMember} disabled={!form.userId}>
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}