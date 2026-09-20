'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AppLayout from '@/components/AppLayout';
import { getStatistics, Statistics } from '@/lib/services/statistics.service';

const PIE_COLORS = ['#4CAF50', '#E0E0E0'];

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatistics();
        setStats(data);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AppLayout pageTitle="Estadísticas">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !stats) {
    return (
      <AppLayout pageTitle="Estadísticas">
        <Alert severity="error">{error || 'No hay datos disponibles'}</Alert>
      </AppLayout>
    );
  }

  const summaryCards = [
    { label: 'Total de hábitos', value: stats.totalHabitos },
    { label: 'Hábitos activos', value: stats.habitosActivos },
    { label: 'Hábitos finalizados', value: stats.habitosFinalizados },
    { label: 'Días consecutivos', value: stats.diasConsecutivos },
  ];

  const pieData = [
    { name: 'Completado', value: stats.tendenciaCumplimiento.completado },
    { name: 'Pendiente', value: stats.tendenciaCumplimiento.pendiente },
  ];

  return (
    <AppLayout pageTitle="Estadísticas">
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

      {/* Progreso mensual */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Progreso mensual
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Cantidad de hábitos completados por mes (últimos 6 meses)
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.progresoMensual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                name="Completados"
                stroke="#4FA8E8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Tendencia de cumplimiento */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Tendencia de cumplimiento
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Últimos 30 días, todos los hábitos
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    label={(entry) => `${entry.value}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cumplimiento por categoría */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Cumplimiento por categoría
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Últimos 30 días
              </Typography>
              {stats.cumplimientoPorCategoria.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Todavía no tenés hábitos con categoría asignada.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.cumplimientoPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Bar dataKey="porcentaje" name="% Cumplimiento" fill="#2E7CB8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rachas por hábito */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Rachas por hábito
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Racha actual comparada con tu mejor racha histórica
          </Typography>
          {stats.rachasPorHabito.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Todavía no tenés hábitos para mostrar.
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.rachasPorHabito}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rachaActual" name="Racha actual" fill="#FF9800" radius={[6, 6, 0, 0]} />
                <Bar dataKey="mejorRacha" name="Mejor racha" fill="#4FA8E8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Detalle por hábito */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Detalle por hábito
          </Typography>
          {stats.detallePorHabito.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Todavía no tenés hábitos para mostrar.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell align="right">% Cumplimiento</TableCell>
                  <TableCell align="right">Racha actual</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.detallePorHabito.map((row) => (
                  <TableRow key={row.nombre}>
                    <TableCell>{row.nombre}</TableCell>
                    <TableCell>
                      <Chip label={row.categoria} size="small" />
                    </TableCell>
                    <TableCell align="right">{row.porcentajeCumplimiento}%</TableCell>
                    <TableCell align="right">{row.rachaActual} días</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}