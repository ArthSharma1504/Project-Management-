import {
  Box, Typography, Card, CardContent, Chip, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Divider,
  Alert, Select, FormControl, InputLabel, Avatar
} from '@mui/material'
import {
  AddOutlined, ArrowBackOutlined, DragIndicatorOutlined,
  PersonOutlined, CalendarTodayOutlined, ArrowForwardOutlined,
  CloseOutlined, CheckCircleOutlined, Group, BugReport,
  OpenInNew
} from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  getProjectTasksApi, createTaskApi, moveTaskApi,
  getAvailableTransitionsApi, deleteTaskApi,
  type TaskResponse, type AvailableTransition
} from '../api/tasks'
import { getProjectApi, getMembersApi, getSdlcModelsApi, type ProjectMember } from '../api/projects'

// ─── PRIORITY CONFIG ─────────────────────────────────────────
const priorityConfig: Record<string, { color: 'error' | 'warning' | 'info' | 'default'; label: string }> = {
  CRITICAL: { color: 'error', label: 'Critical' },
  HIGH:     { color: 'warning', label: 'High' },
  MEDIUM:   { color: 'info', label: 'Medium' },
  LOW:      { color: 'default', label: 'Low' },
}

// ─── TASK CARD ────────────────────────────────────────────────
const TaskCard = ({
  task, onMove, onSelect,
}: {
  task: TaskResponse
  onMove: (task: TaskResponse) => void
  onSelect: (task: TaskResponse) => void
}) => {
  const p = priorityConfig[task.priority] ?? { color: 'default', label: task.priority }

  return (
    <Card sx={{
      mb: 1.5, cursor: 'pointer',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
      transition: 'all 0.15s',
    }}
      onClick={() => onSelect(task)}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip label={p.label} color={p.color} size="small" />
          {task.isTerminalPhase && (
            <CheckCircleOutlined fontSize="small" color="success" />
          )}
        </Box>

        <Typography variant="body2" fontWeight={600} sx={{
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1,
        }}>
          {task.title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {task.assignedToName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'secondary.main' }}>
                {task.assignedToName[0]}
              </Avatar>
              <Typography variant="caption" color="text.secondary" noWrap>
                {task.assignedToName.split(' ')[0]}
              </Typography>
            </Box>
          ) : (
            <Typography variant="caption" color="text.disabled">Unassigned</Typography>
          )}

          {task.storyPoints && (
            <Chip label={`${task.storyPoints}pt`} size="small" variant="outlined"
              sx={{ fontSize: 10, height: 18 }} />
          )}
        </Box>

        {!task.isTerminalPhase && (
          <Button size="small" variant="outlined" fullWidth
            startIcon={<ArrowForwardOutlined />}
            onClick={e => { e.stopPropagation(); onMove(task) }}
            sx={{ mt: 1.5, fontSize: 11 }}>
            Move Phase
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function TaskBoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const pid = Number(projectId)

  // ── State ──
  const [projectName, setProjectName] = useState('')
  const [sdlcModelName, setSdlcModelName] = useState('')
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [phases, setPhases] = useState<{ id: number; name: string; isTerminal: boolean }[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create task dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState('MEDIUM')
  const [newAssignee, setNewAssignee] = useState<number | ''>('')
  const [newPoints, setNewPoints] = useState<number | ''>('')

  // Move task dialog
  const [moveOpen, setMoveOpen] = useState(false)
  const [movingTask, setMovingTask] = useState<TaskResponse | null>(null)
  const [transitions, setTransitions] = useState<AvailableTransition[]>([])
  const [moveLoading, setMoveLoading] = useState(false)

  // Task detail dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null)

  // ── Load data ──
  useEffect(() => {
    const load = async () => {
      try {
        const [project, taskList, memberList] = await Promise.all([
          getProjectApi(pid),
          getProjectTasksApi(pid),
          getMembersApi(pid),
        ])
        setProjectName(project.name)
        setTasks(taskList)
        setMembers(memberList)

        const sdlcModels = await getSdlcModelsApi()
        const model = sdlcModels.find(m => m.id === project.sdlcModelId)
        if (model) {
          setSdlcModelName(model.name)
          setPhases([...model.phases].sort((a, b) => a.displayOrder - b.displayOrder))
        }
      } catch {
        setError('Failed to load board')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pid])

  // ── Create task ──
  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      const created = await createTaskApi(pid, {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        assignedToId: newAssignee ? Number(newAssignee) : null,
        storyPoints: newPoints ? Number(newPoints) : null,
      })
      setTasks(prev => [...prev, created])
      setCreateOpen(false)
      setNewTitle(''); setNewDesc(''); setNewPriority('MEDIUM')
      setNewAssignee(''); setNewPoints('')
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  // ── Open move dialog ──
  const openMove = async (task: TaskResponse) => {
    setMovingTask(task)
    setMoveOpen(true)
    setMoveLoading(true)
    try {
      const t = await getAvailableTransitionsApi(task.id)
      setTransitions(t)
    } catch {
      setTransitions([])
    } finally {
      setMoveLoading(false)
    }
  }

  // ── Execute move ──
  const handleMove = async (targetPhaseId: number) => {
    if (!movingTask) return
    try {
      const updated = await moveTaskApi(movingTask.id, targetPhaseId)
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
      setMoveOpen(false)
      setMovingTask(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to move task')
    }
  }

  // ── Delete task ──
  const handleDelete = async (taskId: number) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTaskApi(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setDetailOpen(false)
    } catch { }
  }

  // Group tasks by phase
  const tasksByPhase = (phaseId: number) =>
    tasks.filter(t => t.currentPhaseId === phaseId)

  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Box sx={{ px: 3, py: 3 }}>

        {/* ── HEADER ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/projects')} sx={{ mt: 0.5 }}>
            <ArrowBackOutlined />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={700}>{projectName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {phases.length} phases
              </Typography>
              {sdlcModelName && (
                <Chip label={sdlcModelName} size="small" color="primary" variant="outlined" />
              )}
            </Box>
          </Box>

          {/* ── NAVIGATION BUTTONS ── */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Group />}
              onClick={() => navigate(`/projects/${projectId}/members`)}
              sx={{ borderColor: '#2563eb', color: '#2563eb', '&:hover': { bgcolor: '#eff6ff' } }}
            >
              Team Members
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BugReport />}
              onClick={() => navigate(`/projects/${projectId}/issues`)}
              sx={{ borderColor: '#ef4444', color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
            >
              Issues
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddOutlined />}
              onClick={() => setCreateOpen(true)}
            >
              Add Task
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {/* ── KANBAN BOARD ── */}
        <Box sx={{
          display: 'flex', gap: 2,
          overflowX: 'auto', pb: 2,
          alignItems: 'flex-start',
        }}>
          {phases.map(phase => {
            const phaseTasks = tasksByPhase(phase.id)
            return (
              <Box key={phase.id} sx={{
                minWidth: 280, maxWidth: 280,
                bgcolor: phase.isTerminal ? '#F0FDF4' : 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: phase.isTerminal ? 'success.light' : 'divider',
                flexShrink: 0,
              }}>
                {/* Column header */}
                <Box sx={{
                  px: 2, py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: phase.isTerminal ? 'success.light' : 'divider',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {phase.isTerminal && (
                      <CheckCircleOutlined fontSize="small" color="success" />
                    )}
                    <Typography variant="subtitle2" fontWeight={700}>
                      {phase.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={phaseTasks.length}
                    size="small"
                    sx={{ minWidth: 28, height: 20, fontSize: 11 }}
                  />
                </Box>

                {/* Tasks */}
                <Box sx={{ p: 1.5, minHeight: 80 }}>
                  {phaseTasks.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center', color: 'text.disabled' }}>
                      <DragIndicatorOutlined sx={{ opacity: 0.3 }} />
                      <Typography variant="caption" display="block">Empty</Typography>
                    </Box>
                  ) : (
                    phaseTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onMove={openMove}
                        onSelect={t => { setSelectedTask(t); setDetailOpen(true) }}
                      />
                    ))
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* ── CREATE TASK DIALOG ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
          <TextField fullWidth label="Title *" value={newTitle}
            onChange={e => setNewTitle(e.target.value)} sx={{ mb: 2 }} autoFocus />
          <TextField fullWidth label="Description (optional)" value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            multiline rows={3} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField select fullWidth label="Priority" value={newPriority}
              onChange={e => setNewPriority(e.target.value)}>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Story Points" type="number" value={newPoints}
              onChange={e => setNewPoints(e.target.value ? Number(e.target.value) : '')}
              inputProps={{ min: 1, max: 100 }} />
          </Box>
          <TextField select fullWidth label="Assign To (optional)" value={newAssignee}
            onChange={e => setNewAssignee(e.target.value ? Number(e.target.value) : '')}>
            <MenuItem value="">Unassigned</MenuItem>
            {members.map(m => (
              <MenuItem key={m.userId} value={m.userId}>
                {m.name} ({m.role})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={creating || !newTitle.trim()}>
            {creating ? <CircularProgress size={20} color="inherit" /> : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MOVE TASK DIALOG ── */}
      <Dialog open={moveOpen} onClose={() => setMoveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Move Task to Phase</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={1}>
            <b>{movingTask?.title}</b>
          </Typography>
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Current: <b>{movingTask?.currentPhaseName}</b>
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {moveLoading ? (
            <Box sx={{ py: 2, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : transitions.length === 0 ? (
            <Alert severity="info">No available transitions from this phase</Alert>
          ) : (
            transitions.map(t => (
              <Button key={t.phaseId} fullWidth variant="outlined"
                onClick={() => handleMove(t.phaseId)}
                sx={{ mb: 1, justifyContent: 'space-between' }}
                endIcon={t.requiresApproval
                  ? <Chip label="Needs Approval" size="small" color="warning" />
                  : <ArrowForwardOutlined />}>
                → {t.phaseName}
              </Button>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMoveOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* ── TASK DETAIL DIALOG ── */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        {selectedTask && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ pr: 2 }}>
                <Typography variant="h6">{selectedTask.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={priorityConfig[selectedTask.priority]?.label ?? selectedTask.priority}
                    color={priorityConfig[selectedTask.priority]?.color ?? 'default'}
                    size="small"
                  />
                  <Chip label={selectedTask.currentPhaseName} size="small" variant="outlined" />
                  {selectedTask.isTerminalPhase && (
                    <Chip label="Completed" color="success" size="small" />
                  )}
                </Box>
              </Box>
              <IconButton onClick={() => setDetailOpen(false)} size="small">
                <CloseOutlined />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              {selectedTask.description && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" mb={2}>{selectedTask.description}</Typography>
                  <Divider sx={{ mb: 2 }} />
                </>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonOutlined fontSize="small" color="action" />
                  <Typography variant="body2">
                    <b>Assigned to:</b> {selectedTask.assignedToName ?? 'Unassigned'}
                  </Typography>
                </Box>
                {selectedTask.dueDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayOutlined fontSize="small" color="action" />
                    <Typography variant="body2">
                      <b>Due:</b> {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                {selectedTask.storyPoints && (
                  <Typography variant="body2">
                    <b>Story Points:</b> {selectedTask.storyPoints}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(selectedTask.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Open full detail page link */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<OpenInNew />}
                sx={{ mt: 3 }}
                onClick={() => {
                  setDetailOpen(false)
                  navigate(`/projects/${projectId}/tasks/${selectedTask.id}`)
                }}
              >
                Open Full Detail (Comments & More)
              </Button>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
              <Button color="error" onClick={() => handleDelete(selectedTask.id)}>
                Delete Task
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => setDetailOpen(false)}>Close</Button>
                {!selectedTask.isTerminalPhase && (
                  <Button variant="contained" startIcon={<ArrowForwardOutlined />}
                    onClick={() => { setDetailOpen(false); openMove(selectedTask) }}>
                    Move Phase
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}