import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Chip, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Alert,
  CircularProgress, IconButton, Tooltip, Avatar
} from '@mui/material';
import { Add, Delete, BugReport } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axios';
import { getProjectApi } from '../api/projects';

const severityColor: Record<string, any> = {
  LOW: 'success', MEDIUM: 'warning', HIGH: 'error', CRITICAL: 'error'
};

export default function IssuesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [issues, setIssues] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', severity: 'MEDIUM' });

  useEffect(() => { if (projectId) loadAll(); }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const p = await getProjectApi(Number(projectId));
      setProject(p);

      const res = await axiosInstance.get(`/api/projects/${projectId}/issues`);
      const raw = res.data?.data ?? res.data ?? [];
      setIssues(Array.isArray(raw) ? raw : []);
    } catch {
      setError('Failed to load issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const res = await axiosInstance.post(`/api/projects/${projectId}/issues`, form);
      const newIssue = res.data?.data ?? res.data;
      setIssues(prev => [newIssue, ...prev]);
      setCreateDialog(false);
      setForm({ title: '', description: '', severity: 'MEDIUM' });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create issue');
    }
  };

  const handleStatusChange = async (issueId: number, status: string) => {
    try {
      const res = await axiosInstance.patch(`/api/issues/${issueId}/status`, { status });
      const updated = res.data?.data ?? res.data;
      setIssues(prev => prev.map(i => i.id === issueId ? updated : i));
    } catch {
      setError('Failed to update status');
    }
  };

  const handleDelete = async (issueId: number) => {
    try {
      await axiosInstance.delete(`/api/issues/${issueId}`);
      setIssues(prev => prev.filter(i => i.id !== issueId));
    } catch {
      setError('Failed to delete issue');
    }
  };

  const safeIssues = Array.isArray(issues) ? issues : [];

  const stats = {
    open: safeIssues.filter(i => i.status === 'OPEN').length,
    inProgress: safeIssues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: safeIssues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length,
    critical: safeIssues.filter(i => i.severity === 'CRITICAL').length,
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <Box maxWidth={1200} mx="auto" p={3}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={700} display="flex" alignItems="center" gap={1}>
              <BugReport sx={{ color: '#ef4444' }} />
              Issues Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project?.name} — Track bugs, blockers, and problems
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialog(true)}>
            Report Issue
          </Button>
        </Box>

        {/* Stats */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          {[
            { label: 'Open', value: stats.open, color: '#ef4444', bg: '#fef2f2' },
            { label: 'In Progress', value: stats.inProgress, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Resolved', value: stats.resolved, color: '#10b981', bg: '#f0fdf4' },
            { label: 'Critical', value: stats.critical, color: '#7c3aed', bg: '#f5f3ff' },
          ].map(s => (
            <Paper key={s.label} sx={{
              px: 3, py: 2, borderRadius: 2, flex: '1 1 140px',
              borderLeft: `4px solid ${s.color}`, bgcolor: s.bg
            }}>
              <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </Paper>
          ))}
        </Box>

        {/* Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                  <TableCell><strong>#</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Severity</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Reported By</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <BugReport sx={{ fontSize: 48, color: '#94a3b8', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography color="text.secondary">No issues reported. Great work! 🎉</Typography>
                    </TableCell>
                  </TableRow>
                ) : safeIssues.map(issue => (
                  <TableRow key={issue.id} hover>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>#{issue.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{issue.title}</Typography>
                      {issue.description && (
                        <Typography variant="caption" color="text.secondary"
                          sx={{ display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={issue.severity} color={severityColor[issue.severity] ?? 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                          value={issue.status ?? 'OPEN'}
                          onChange={e => handleStatusChange(issue.id, e.target.value as string)}
                          sx={{ fontSize: 12 }}>
                          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                            <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                              {s.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: '#2563eb' }}>
                          {(issue.reportedByName ?? issue.reporterName ?? '?')[0]}
                        </Avatar>
                        <Typography variant="body2">
                          {issue.reportedByName ?? issue.reporterName ?? 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete issue">
                        <IconButton size="small" color="error" onClick={() => handleDelete(issue.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report New Issue</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Issue Title *" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            sx={{ mb: 2 }} size="small" autoFocus />
          <TextField fullWidth label="Description" multiline rows={3}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            sx={{ mb: 2 }} size="small" />
          <FormControl fullWidth size="small">
            <InputLabel>Severity</InputLabel>
            <Select value={form.severity}
              onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
              label="Severity">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.title.trim()}>
            Submit Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}