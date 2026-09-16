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
} from '@mui/material';
import AppLayout from '@/components/AppLayout';
import { getHabits, Habit } from '@/lib/services/habits.service';

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            habilitan cuando implementemos el seguimiento diario de habitos (Eso es del tercer avance)
          </Alert>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Tus hábitos
              </Typography>

              {habits.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aún no tienes hábitos creados. Andá a la sección "Hábitos"
                  para crear el primero.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {habits.map((habit) => (
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
                      {habit.categoria && (
                        <Chip label={habit.categoria} size="small" />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </AppLayout>
  );
}