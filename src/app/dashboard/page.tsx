'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import AppLayout from '@/components/AppLayout';
import { getHabits, Habit } from '@/lib/services/habits.service';
import { getPriorityInfo } from '@/lib/priority';

type SortOption = 'prioridad-desc' | 'prioridad-asc' | 'nombre';

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('prioridad-desc');

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await getHabits();
        setHabits(data);
      } catch (err) {
        setError('No se pudieron cargar tus hábitos');
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, []);

  const activeHabits = habits.filter((h) => h.activo);

  const sortedHabits = useMemo(() => {
    const copy = [...habits];
    switch (sortBy) {
      case 'prioridad-desc':
        return copy.sort((a, b) => b.prioridad - a.prioridad);
      case 'prioridad-asc':
        return copy.sort((a, b) => a.prioridad - b.prioridad);
      case 'nombre':
        return copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
      default:
        return copy;
    }
  }, [habits, sortBy]);

  const summaryCards = [
    { label: 'Hábitos activos', value: activeHabits.length },
    { label: 'Total de hábitos', value: habits.length },
    { label: 'Racha actual', value: '—' },
    { label: 'Mejor racha', value: '—' },
  ];

  return (
    <AppLayout pageTitle="Dashboard">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
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

          <Alert severity="info" sx={{ mb: 3 }}>
            Las gráficas de progreso, rachas y porcentaje de cumplimiento se
            habilitan cuando implementemos el seguimiento diario de hábitos
            (próxima entrega).
          </Alert>

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
                  <MenuItem value="prioridad-desc">
                    Prioridad (alta primero)
                  </MenuItem>
                  <MenuItem value="prioridad-asc">
                    Prioridad (baja primero)
                  </MenuItem>
                  <MenuItem value="nombre">Nombre (A-Z)</MenuItem>
                </TextField>
              </Box>

              {habits.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aún no tienes hábitos creados. Andá a la sección "Hábitos"
                  para crear el primero.
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
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {habit.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {habit.frecuencia}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {habit.categoria && (
                            <Chip label={habit.categoria} size="small" />
                          )}
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
        </Box>
      )}
    </AppLayout>
  );
}