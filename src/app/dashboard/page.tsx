'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AppLayout from '@/components/AppLayout';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import { getHabits, Habit } from '@/lib/services/habits.service';
import { getStatistics, Statistics } from '@/lib/services/statistics.service';
import { getPriorityInfo } from '@/lib/priority';

type SortOption = 'prioridad-desc' | 'prioridad-asc' | 'nombre';

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('prioridad-desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitsData, statsData] = await Promise.all([
          getHabits(),
          getStatistics(),
        ]);
        setHabits(habitsData);
        setStats(statsData);
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedHabits = [...habits].sort((a, b) => {
    switch (sortBy) {
      case 'prioridad-desc':
        return b.prioridad - a.prioridad;
      case 'prioridad-asc':
        return a.prioridad - b.prioridad;
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      default:
        return 0;
    }
  });

  const rachaPorHabitoId = new Map(
    (stats?.rachasPorHabito || []).map((r) => [r.habitId, r.rachaActual]),
  );

  if (loading) {
    return (
      <AppLayout pageTitle="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !stats) {
    return (
      <AppLayout pageTitle="Dashboard">
        <Alert severity="error">{error || 'No hay datos disponibles'}</Alert>
      </AppLayout>
    );
  }

  const summaryCards = [
    { label: 'Hábitos activos', value: stats.habitosActivos },
    { label: 'Completados hoy', value: stats.completadosHoy },
    { label: 'Racha actual', value: stats.diasConsecutivos },
    { label: 'Mejor racha', value: stats.mejorRachaGlobal },
  ];

  return (
    <AppLayout pageTitle="Dashboard">
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Porcentaje de cumplimiento (últimos 30 días)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {stats.tendenciaCumplimiento.completado}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={stats.tendenciaCumplimiento.completado}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Progreso semanal
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.progresoSemanal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Completados" fill="#4FA8E8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Progreso mensual
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.progresoMensual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Completados"
                    stroke="#2E7CB8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Tus hábitos
            </Typography>
            <TextField
              select
              size="small"
              label="Ordenar por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="prioridad-desc">Prioridad (alta primero)</MenuItem>
              <MenuItem value="prioridad-asc">Prioridad (baja primero)</MenuItem>
              <MenuItem value="nombre">Nombre (A-Z)</MenuItem>
            </TextField>
          </Box>

          {habits.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aún no tienes hábitos creados. Andá a la sección "Hábitos" para
              crear el primero.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {sortedHabits.map((habit) => {
                const priority = getPriorityInfo(habit.prioridad);
                return (
                  <Box
                    key={habit._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderLeft: '4px solid',
                      borderLeftColor: `${priority.color}.main`,
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {habit.nombre}
                        </Typography>
                        {(rachaPorHabitoId.get(habit._id) || 0) > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                            <LocalFireDepartmentIcon fontSize="small" color="warning" />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {rachaPorHabitoId.get(habit._id)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {habit.frecuencia}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {habit.categoria && <Chip label={habit.categoria} size="small" />}
                      <Chip
                        label={`Prioridad: ${priority.label}`}
                        size="small"
                        color={priority.color}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}