import {
  Box, Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, CircularProgress, Alert,
  IconButton, Tooltip, CardActionArea, Divider,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Select, FormControl, InputLabel
} from '@mui/material'
import {
  AddOutlined, FolderOutlined, PeopleOutlined,
  DeleteOutlined, ArrowForwardOutlined, PersonAddOutlined
} from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  getMyProjectsApi, createProjectApi, getSdlcModelsApi,
  getMembersApi, addMemberApi, removeMemberApi, deleteProjectApi,
  type ProjectResponse, type ProjectMember, type SdlcModel
} from '../api/projects'
import { useAuth } from '../context/AuthContext'

// ─── STATUS CHIP ────────────────────────────────────────────
const StatusChip = ({ status }: { status: string }) => {
  const map: Record<string, 'success' | 'warning' | 'default'> = {
    ACTIVE: 'success', COMPLETED: 'default', ON_HOLD: 'warning',
  }
  return <Chip label={status} color={map[status] ?? 'default'} size="small" />
}

// ─── ROLE COLOR ─────────────────────────────────────────────
const roleColor = (role: string) => {
  const map: Record<string, 'error' | 'primary' | 'warning' | 'default'> = {
    TEAM_LEAD: 'error', DEVELOPER: 'primary', QA: 'warning', VIEWER: 'default',
  }
  return map[role] ?? 'default'
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // ── State ──
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [sdlcModels, setSdlcModels] = useState<SdlcModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create project dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newSdlcId, setNewSdlcId] = useState<number | ''>('')

  // Members dialog
  const [membersOpen, setMembersOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [addUserId, setAddUserId] = useState('')
  const [addRole, setAddRole] = useState('DEVELOPER')
  const [addError, setAddError] = useState('')

  // ── Load data ──
  useEffect(() => {
    Promise.all([getMyProjectsApi(), getSdlcModelsApi()])
      .then(([projs, models]) => {
        setProjects(projs)
        setSdlcModels(models)
      })
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  // ── Create project ──
  const handleCreate = async () => {
    if (!newName.trim() || !newSdlcId) return
    setCreating(true)
    setCreateError('')
    try {
      const created = await createProjectApi({
        name: newName, description: newDesc, sdlcModelId: Number(newSdlcId),
      })
      setProjects(prev => [created, ...prev])
      setCreateOpen(false)
      setNewName(''); setNewDesc(''); setNewSdlcId('')
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  // ── Open members dialog ──
  const openMembers = async (project: ProjectResponse) => {
    setSelectedProject(project)
    setMembersOpen(true)
    setMembersLoading(true)
    try {
      const m = await getMembersApi(project.id)
      setMembers(m)
    } catch {
      setMembers([])
    } finally {
      setMembersLoading(false)
    }
  }

  // ── Add member ──
  const handleAddMember = async () => {
    if (!selectedProject || !addUserId) return
    setAddError('')
    try {
      await addMemberApi(selectedProject.id, Number(addUserId), addRole)
      const updated = await getMembersApi(selectedProject.id)
      setMembers(updated)
      setAddUserId('')
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to add member')
    }
  }

  // ── Remove member ──
  const handleRemoveMember = async (targetUserId: number) => {
    if (!selectedProject) return
    try {
      await removeMemberApi(selectedProject.id, targetUserId)
      setMembers(prev => prev.filter(m => m.userId !== targetUserId))
    } catch { }
  }

  // ── Delete project ──
  const handleDelete = async (projectId: number) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await deleteProjectApi(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch { }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4">Projects</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Manage your projects and team members
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />}
            onClick={() => setCreateOpen(true)}>
            New Project
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Project Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            <FolderOutlined sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
            <Typography variant="h6">No projects yet</Typography>
            <Typography variant="body2" mb={3}>Create your first project to get started</Typography>
            <Button variant="contained" startIcon={<AddOutlined />}
              onClick={() => setCreateOpen(true)}>
              Create Project
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map(project => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea onClick={() => navigate(`/projects/${project.id}/board`)}
                    sx={{ flexGrow: 1 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <StatusChip status={project.status} />
                        <Chip label={project.sdlcModelName} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="h6" mt={1.5} mb={0.5} noWrap>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary"
                        sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description || 'No description'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>

                  <Divider />

                  {/* Card actions */}
                  <Box sx={{ display: 'flex', px: 1, py: 0.5, gap: 0.5 }}>
                    <Tooltip title="Open Board">
                      <IconButton size="small" color="primary"
                        onClick={() => navigate(`/projects/${project.id}/board`)}>
                        <ArrowForwardOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Members">
                      <IconButton size="small"
                        onClick={() => openMembers(project)}>
                        <PeopleOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {project.createdById === user?.userId && (
                      <Tooltip title="Delete Project">
                        <IconButton size="small" color="error"
                          onClick={() => handleDelete(project.id)}
                          sx={{ ml: 'auto' }}>
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ── Create Project Dialog ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}
        maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
          <TextField label="Project Name" value={newName}
            onChange={e => setNewName(e.target.value)} sx={{ mb: 2 }} autoFocus />
          <TextField label="Description (optional)" value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            multiline rows={3} sx={{ mb: 2 }} />
          <TextField select label="SDLC Model" value={newSdlcId}
            onChange={e => setNewSdlcId(Number(e.target.value))}>
            {sdlcModels.map(m => (
              <MenuItem key={m.id} value={m.id}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.phases?.length ?? 0} phases
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={creating || !newName.trim() || !newSdlcId}>
            {creating ? <CircularProgress size={20} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Members Dialog ── */}
      <Dialog open={membersOpen} onClose={() => setMembersOpen(false)}
        maxWidth="sm" fullWidth>
        <DialogTitle>
          Members — {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}

          {/* Add member row */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
            <TextField label="User ID" value={addUserId} size="small"
              onChange={e => setAddUserId(e.target.value)}
              sx={{ flex: 1 }} type="number" />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Role</InputLabel>
              <Select value={addRole} label="Role"
                onChange={e => setAddRole(e.target.value)}>
                {['TEAM_LEAD', 'DEVELOPER', 'QA', 'VIEWER'].map(r => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" size="small" startIcon={<PersonAddOutlined />}
              onClick={handleAddMember} disabled={!addUserId}
              sx={{ height: 40, mt: 0 }}>
              Add
            </Button>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {membersLoading ? (
            <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
          ) : (
            <List disablePadding>
              {members.map(m => (
                <ListItem key={m.userId} disableGutters
                  secondaryAction={
                    m.userId !== user?.userId && (
                      <Tooltip title="Remove">
                        <IconButton size="small" color="error"
                          onClick={() => handleRemoveMember(m.userId)}>
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main',
                      fontSize: 13, fontWeight: 700 }}>
                      {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                        <Chip label={m.role} size="small"
                          color={roleColor(m.role)} variant="outlined" />
                      </Box>
                    }
                    secondary={m.email}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMembersOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}