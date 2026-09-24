'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEventsOutlined';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import ChecklistIcon from '@mui/icons-material/ChecklistOutlined';
import StarIcon from '@mui/icons-material/StarOutlined';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { getStatistics, Statistics } from '@/lib/services/statistics.service';

interface UserProfile {
  _id: string;
  nombre: string;
  correo: string;
  createdAt: string;
}

interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: (stats: Statistics) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'primer-habito',
    label: 'Primeros pasos',
    description: 'Creaste tu primer hábito',
    icon: <StarIcon />,
    isUnlocked: (s) => s.totalHabitos >= 1,
  },
  {
    id: 'racha-3',
    label: 'Racha de 3',
    description: 'Alcanzaste una racha de 3',
    icon: <LocalFireDepartmentIcon />,
    isUnlocked: (s) => s.mejorRachaGlobal >= 3,
  },
  {
    id: 'racha-7',
    label: 'Racha de 7',
    description: 'Una semana completa de constancia',
    icon: <LocalFireDepartmentIcon />,
    isUnlocked: (s) => s.mejorRachaGlobal >= 7,
  },
  {
    id: 'racha-30',
    label: 'Racha de 30',
    description: 'Un mes entero sin fallar',
    icon: <LocalFireDepartmentIcon />,
    isUnlocked: (s) => s.mejorRachaGlobal >= 30,
  },
  {
    id: 'organizado',
    label: 'Organizado',
    description: 'Tenés 3 o más hábitos activos a la vez',
    icon: <ChecklistIcon />,
    isUnlocked: (s) => s.habitosActivos >= 3,
  },
  {
    id: 'cumplidor',
    label: 'Cumplidor',
    description: '80% de cumplimiento en los últimos 30 días',
    icon: <EmojiEventsIcon />,
    isUnlocked: (s) => s.tendenciaCumplimiento.completado >= 80,
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/users/me'),
          getStatistics(),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes);
      } catch (err) {
        setError('No se pudo cargar tu perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const initials = profile?.nombre
    ? profile.nombre
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  const fechaRegistro = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const unlockedCount = stats
    ? ACHIEVEMENTS.filter((a) => a.isUnlocked(stats)).length
    : 0;

  return (
    <AppLayout pageTitle="Perfil">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Card sx={{ maxWidth: 480, width: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 80,
                    height: 80,
                    fontSize: 28,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {initials}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {profile?.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {profile?.correo}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary">
                    Miembro desde
                  </Typography>
                  <Typography variant="body1">{fechaRegistro}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card sx={{ maxWidth: 700, mx: 'auto' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Logros
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {unlockedCount} de {ACHIEVEMENTS.length} desbloqueados
              </Typography>

              <Grid container spacing={2}>
                {ACHIEVEMENTS.map((achievement) => {
                  const unlocked = stats ? achievement.isUnlocked(stats) : false;
                  return (
                    <Grid key={achievement.id} size={{ xs: 6, sm: 4 }}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: unlocked ? 'warning.main' : 'divider',
                          bgcolor: unlocked ? 'rgba(255, 152, 0, 0.08)' : 'action.hover',
                          opacity: unlocked ? 1 : 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            color: unlocked ? 'warning.main' : 'text.disabled',
                            mb: 0.5,
                          }}
                        >
                          {achievement.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {achievement.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </AppLayout>
  );
}