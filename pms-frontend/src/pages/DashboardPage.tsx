import {
  Box, Typography, Card, CardContent, Grid, Avatar,
  Chip, Button, Divider, List, ListItem,
  ListItemText, ListItemAvatar, CircularProgress
} from '@mui/material'
import {
  FolderOutlined, TaskAltOutlined, BugReportOutlined,
  PersonOutlined, TrendingUpOutlined, AddOutlined
} from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getMyProjectsApi, type ProjectResponse } from '../api/projects'

// ─── STAT CARD ────────────────────────────────────────────────
const StatCard = ({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
      <Box sx={{
        width: 52, height: 52, borderRadius: 2,
        bgcolor: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </CardContent>
  </Card>
)

// ─── ACTIVITY ROW ────────────────────────────────────────────
const ActivityRow = ({ action, time }: { action: string; time: string }) => (
  <ListItem disableGutters divider>
    <ListItemAvatar>
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 14 }}>
        <TrendingUpOutlined fontSize="small" />
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={action}
      secondary={time}
      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
      secondaryTypographyProps={{ variant: 'caption' }}
    />
  </ListItem>
)

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  const initials = user?.name
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  useEffect(() => {
    getMyProjectsApi()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false))
  }, [])

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>

        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" color="text.primary">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Here's what's happening with your projects today.
          </Typography>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<FolderOutlined />}
              label="Active Projects"
              value={activeProjects}
              color="#2563EB"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<TaskAltOutlined />}
              label="My Tasks"
              value={0}
              color="#16A34A"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<BugReportOutlined />}
              label="Open Issues"
              value={0}
              color="#DC2626"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<TrendingUpOutlined />}
              label="Completed This Week"
              value={0}
              color="#7C3AED"
            />
          </Grid>
        </Grid>

        {/* Two-column layout */}
        <Grid container spacing={3}>

          {/* Projects Panel */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', mb: 2,
                }}>
                  <Typography variant="h6">My Projects</Typography>
                  <Button variant="contained" size="small"
                    startIcon={<AddOutlined />}
                    onClick={() => navigate('/projects')}>
                    New Project
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loadingProjects ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : projects.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <FolderOutlined sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2">No projects yet</Typography>
                    <Typography variant="caption">
                      Create your first project to get started
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {projects.slice(0, 5).map(project => (
                      <ListItem
                        key={project.id}
                        disableGutters
                        divider
                        sx={{ cursor: 'pointer', py: 1.5,
                          '&:hover': { bgcolor: 'action.hover' }, px: 1, borderRadius: 1 }}
                        onClick={() => navigate(`/projects/${project.id}/board`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{
                            bgcolor: 'primary.main', width: 38, height: 38, fontSize: 14,
                          }}>
                            <FolderOutlined fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {project.name}
                              </Typography>
                              <Chip
                                label={project.status}
                                size="small"
                                color={project.status === 'ACTIVE' ? 'success' : 'default'}
                              />
                            </Box>
                          }
                          secondary={`${project.sdlcModelName} · ${project.memberCount} member${project.memberCount !== 1 ? 's' : ''}`}
                        />
                      </ListItem>
                    ))}
                    {projects.length > 5 && (
                      <Box sx={{ pt: 1.5, textAlign: 'center' }}>
                        <Button size="small" onClick={() => navigate('/projects')}>
                          View all {projects.length} projects
                        </Button>
                      </Box>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 5 }}>

            {/* Profile Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>My Profile</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{
                    width: 52, height: 52, bgcolor: 'primary.main',
                    fontSize: 18, fontWeight: 700,
                  }}>
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                    <Chip
                      label={user?.systemRole}
                      size="small"
                      color={user?.systemRole === 'ADMIN' ? 'secondary' : 'primary'}
                      variant="outlined"
                      icon={<PersonOutlined />}
                      sx={{ mt: 0.5, fontSize: 11 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>Recent Activity</Typography>
                <Divider sx={{ mb: 1 }} />
                <List disablePadding>
                  <ActivityRow action="Account created successfully" time="Just now" />
                  {projects.slice(0, 3).map(p => (
                    <ActivityRow
                      key={p.id}
                      action={`Project "${p.name}" created`}
                      time={new Date(p.createdAt).toLocaleDateString()}
                    />
                  ))}
                </List>
              </CardContent>
            </Card>

          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}