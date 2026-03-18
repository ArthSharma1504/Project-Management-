import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Button, TextField, Avatar, Divider,
  Paper, Grid, IconButton, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip
} from '@mui/material';
import {
  ArrowBack, Send, Delete, MoveDown,
  Person, CalendarToday, Flag, Timer, BugReport
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { getTaskApi, deleteTaskApi, moveTaskApi, getAvailableTransitionsApi } from '../api/tasks';
import { getTaskCommentsApi, addCommentApi, deleteCommentApi } from '../api/comments';
import { useAuth } from '../context/AuthContext';

const priorityColors: Record<string, any> = {
  LOW: 'success', MEDIUM: 'warning', HIGH: 'error', CRITICAL: 'error'
};

export default function TaskDetailPage() {
  const { taskId, projectId } = useParams<{ taskId: string; projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [transitions, setTransitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moveDialog, setMoveDialog] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskId) loadAll();
  }, [taskId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [t, c, tr] = await Promise.all([
        getTaskApi(Number(taskId)),
        getTaskCommentsApi(Number(taskId)),
        getAvailableTransitionsApi(Number(taskId))
      ]);
      setTask(t);
      setComments(c);
      setTransitions(tr);
    } catch {
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const c = await addCommentApi(Number(taskId), newComment.trim());
      setComments(prev => [...prev, c]);
      setNewComment('');
    } catch {
      setError('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteCommentApi(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {
      setError('Failed to delete comment');
    }
  };

  const handleMoveTask = async () => {
    if (!selectedPhase) return;
    try {
      const updated = await moveTaskApi(Number(taskId), Number(selectedPhase));
      setTask(updated);
      setMoveDialog(false);
      setSelectedPhase('');
      const tr = await getAvailableTransitionsApi(Number(taskId));
      setTransitions(tr);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Cannot move task');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTaskApi(Number(taskId));
      navigate(`/projects/${projectId}/board`);
    } catch {
      setError('Failed to delete task');
    }
  };

  if (loading) return (
    <Box>
      <Navbar />
      <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>
    </Box>
  );

  if (!task) return (
    <Box>
      <Navbar />
      <Alert severity="error" sx={{ m: 3 }}>Task not found</Alert>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <Box maxWidth={1100} mx="auto" p={3}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
        )}

        {/* Header */}
        <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
          <IconButton onClick={() => navigate(`/projects/${projectId}/board`)} sx={{ mt: 0.5 }}>
            <ArrowBack />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700}>{task.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Task #{task.id} • Created {new Date(task.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" gap={1} flexShrink={0}>
            {transitions.length > 0 && (
              <Button variant="contained" startIcon={<MoveDown />}
                onClick={() => setMoveDialog(true)} size="small">
                Move Phase
              </Button>
            )}
            <Button variant="outlined" color="error" startIcon={<Delete />}
              onClick={handleDelete} size="small">
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Description */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Description</Typography>
              <Typography color={task.description ? 'text.primary' : 'text.secondary'}>
                {task.description || 'No description provided.'}
              </Typography>
            </Paper>

            {/* Comments */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Comments ({comments.length})
              </Typography>

              {/* Add comment */}
              <Box display="flex" gap={2} mb={3}>
                <Avatar sx={{ bgcolor: '#2563eb', width: 36, height: 36, fontSize: 14 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <TextField fullWidth multiline rows={2}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    size="small" />
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <Button variant="contained" size="small" endIcon={<Send />}
                      onClick={handleAddComment}
                      disabled={commentLoading || !newComment.trim()}>
                      Comment
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {comments.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  No comments yet. Be the first to comment!
                </Typography>
              ) : (
                comments.map(comment => (
                  <Box key={comment.id} display="flex" gap={2} mb={2.5}>
                    <Avatar sx={{ bgcolor: '#7c3aed', width: 36, height: 36, fontSize: 14 }}>
                      {comment.authorName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {comment.authorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                        {comment.authorId === user?.id && (
                          <Tooltip title="Delete comment">
                            <IconButton size="small" onClick={() => handleDeleteComment(comment.id)}
                              sx={{ ml: 'auto', color: 'error.main' }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: '#f8fafc' }}>
                        <Typography variant="body2">{comment.content}</Typography>
                      </Paper>
                    </Box>
                  </Box>
                ))
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Details</Typography>

              {[
                {
                  icon: <Flag fontSize="small" />, label: 'Priority',
                  value: <Chip label={task.priority} color={priorityColors[task.priority]} size="small" />
                },
                {
                  icon: <Timer fontSize="small" />, label: 'Current Phase',
                  value: <Chip label={task.currentPhaseName || 'N/A'} color="primary" size="small" />
                },
                {
                  icon: <Person fontSize="small" />, label: 'Assignee',
                  value: <Typography variant="body2">{task.assigneeName || 'Unassigned'}</Typography>
                },
                {
                  icon: <CalendarToday fontSize="small" />, label: 'Due Date',
                  value: <Typography variant="body2">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </Typography>
                },
                {
                  icon: <BugReport fontSize="small" />, label: 'Story Points',
                  value: <Typography variant="body2">{task.storyPoints ?? '—'}</Typography>
                },
              ].map(({ icon, label, value }) => (
                <Box key={label} display="flex" alignItems="flex-start" gap={1.5} mb={2}>
                  <Box color="text.secondary" mt={0.3}>{icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Box mt={0.25}>{value}</Box>
                  </Box>
                </Box>
              ))}

              {task.isTerminalPhase && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  ✓ Task completed
                </Alert>
              )}
            </Paper>

            {/* Quick navigate */}
            <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Project Navigation</Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button fullWidth variant="outlined" size="small"
                  onClick={() => navigate(`/projects/${projectId}/board`)}>
                  ← Back to Board
                </Button>
                <Button fullWidth variant="outlined" size="small"
                  onClick={() => navigate(`/projects/${projectId}/issues`)}>
                  View Issues
                </Button>
                <Button fullWidth variant="outlined" size="small"
                  onClick={() => navigate(`/projects/${projectId}/members`)}>
                  Team Members
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Move Phase Dialog */}
      <Dialog open={moveDialog} onClose={() => setMoveDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Move Task to Phase</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Current: <strong>{task.currentPhaseName}</strong>
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Select Target Phase</InputLabel>
            <Select value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value as string)}
              label="Select Target Phase">
              {transitions.map((t: any) => (
                <MenuItem key={t.phaseId} value={String(t.phaseId)}>
                  {t.phaseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setMoveDialog(false); setSelectedPhase(''); }}>Cancel</Button>
          <Button variant="contained" onClick={handleMoveTask} disabled={!selectedPhase}>
            Move Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}