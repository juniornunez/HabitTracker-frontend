'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Typography,
  IconButton,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AppLayout from '@/components/AppLayout';
import HabitDialog from '@/components/HabitDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import HabitTodayAction from '@/components/HabitTodayAction';
import { getHabits, deleteHabit, Habit } from '@/lib/services/habits.service';
import {
  getHistory,
  getStreak,
  markCompleteToday,
  unmarkCompleteToday,
} from '@/lib/services/records.service';
import { getPriorityInfo } from '@/lib/priority';
import { classifyHabits, canCompleteToday, DIAS_SEMANA_LABELS, HabitTracking } from '@/lib/habitTracking';
import { getHondurasDateString, getWeekStartString, getCurrentHondurasWeekStart } from '@/lib/date';

type StatusFilter = 'todos' | 'activos' | 'inactivos';
type SortOption = 'prioridad-desc' | 'prioridad-asc' | 'nombre';

// Formatea un string de fecha "YYYY-MM-DD" (o un ISO completo) directamente
// como DD/MM/YYYY, sin pasar por new Date(), para evitar que la conversión
// de zona horaria del navegador corra la fecha un día hacia atrás.
function formatDateOnly(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [trackingMap, setTrackingMap] = useState<Record<string, HabitTracking>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('prioridad-desc');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadTracking = useCallback(async (habitList: Habit[]) => {
    const today = getHondurasDateString();
    const currentWeekStart = getCurrentHondurasWeekStart();
    const entries = await Promise.all(
      habitList.map(async (habit) => {
        try {
          const [history, streak] = await Promise.all([
            getHistory(habit._id),
            getStreak(habit._id),
          ]);
          const completedRecords = history.filter((r) => r.completado);

          const completadoHoy =
            habit.frecuencia === 'semanal'
              ? completedRecords.some(
                  (r) => getWeekStartString(r.fecha) === currentWeekStart,
                )
              : completedRecords.some((r) => r.fecha.slice(0, 10) === today);

          const ultimoCumplimiento = completedRecords.length
            ? completedRecords
                .map((r) => r.fecha)
                .sort()
                .reverse()[0]
            : null;

          const tracking: HabitTracking = {
            completadoHoy,
            ultimoCumplimiento,
            rachaActual: streak.rachaActual,
            mejorRacha: streak.mejorRacha,
          };
          return [habit._id, tracking] as const;
        } catch {
          return [
            habit._id,
            {
              completadoHoy: false,
              ultimoCumplimiento: null,
              rachaActual: 0,
              mejorRacha: 0,
            },
          ] as const;
        }
      }),
    );
    setTrackingMap(Object.fromEntries(entries));
  }, []);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHabits();
      setHabits(data);
      await loadTracking(data);
    } catch (err) {
      setError('No se pudieron cargar tus hábitos');
    } finally {
      setLoading(false);
    }
  }, [loadTracking]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleToggleToday = async (habit: Habit) => {
    const tracking = trackingMap[habit._id];
    if (!tracking) return;

    setTogglingId(habit._id);
    try {
      if (tracking.completadoHoy) {
        await unmarkCompleteToday(habit._id);
      } else {
        await markCompleteToday(habit._id);
      }
      await loadTracking(habits);
    } catch {
      setSnackbar({ open: true, message: 'No se pudo actualizar el hábito', severity: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  const filteredHabits = useMemo(() => {
    const filtered = habits.filter((habit) => {
      const matchesSearch = habit.nombre
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'activos' && habit.activo) ||
        (statusFilter === 'inactivos' && !habit.activo);
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'prioridad-desc':
        return sorted.sort((a, b) => b.prioridad - a.prioridad);
      case 'prioridad-asc':
        return sorted.sort((a, b) => a.prioridad - b.prioridad);
      case 'nombre':
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
      default:
        return sorted;
    }
  }, [habits, search, statusFilter, sortBy]);

  // Las secciones de seguimiento (diarios / vencen hoy / otros) solo tienen
  // sentido para hábitos activos, sin importar qué chip de estado esté elegido.
  const trackableHabits = useMemo(
    () => filteredHabits.filter((h) => h.activo),
    [filteredHabits],
  );

  const { diarios, semanales, personalizados } = useMemo(
    () => classifyHabits(trackableHabits),
    [trackableHabits],
  );

  const handleOpenCreate = () => {
    setSelectedHabit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setSelectedHabit(habit);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    loadHabits();
    setSnackbar({
      open: true,
      message: selectedHabit ? 'Hábito actualizado' : 'Hábito creado correctamente',
      severity: 'success',
    });
  };

  const handleAskDelete = (habit: Habit) => {
    setHabitToDelete(habit);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!habitToDelete) return;
    setDeleting(true);
    try {
      await deleteHabit(habitToDelete._id);
      setSnackbar({ open: true, message: 'Hábito eliminado', severity: 'success' });
      loadHabits();
    } catch (err) {
      setSnackbar({ open: true, message: 'No se pudo eliminar el hábito', severity: 'error' });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setHabitToDelete(null);
    }
  };

  const statusChips: { label: string; value: StatusFilter }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' },
  ];

  const renderHabitCard = (habit: Habit) => {
    const priority = getPriorityInfo(habit.prioridad);
    const tracking = trackingMap[habit._id];

    return (
      <Card
        key={habit._id}
        sx={{
          borderLeft: '4px solid',
          borderLeftColor: `${priority.color}.main`,
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {habit.nombre}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                {habit.categoria && <Chip label={habit.categoria} size="small" />}
                <Chip
                  label={`Prioridad: ${priority.label}`}
                  size="small"
                  color={priority.color}
                />
                <Typography variant="caption" color="text.secondary">
                  {habit.frecuencia}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Desde {formatDateOnly(habit.fechaInicio)}
                {habit.fechaFin && ` hasta ${formatDateOnly(habit.fechaFin)}`}
              </Typography>
              {habit.frecuencia === 'personalizada' && habit.diasPersonalizados && (
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                  {habit.diasPersonalizados.map((dia) => (
                    <Chip
                      key={dia}
                      label={DIAS_SEMANA_LABELS[dia as keyof typeof DIAS_SEMANA_LABELS]}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton onClick={() => handleOpenEdit(habit)} color="primary" size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => handleAskDelete(habit)} color="error" size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {tracking && (
            <HabitTodayAction
              tracking={tracking}
              onToggle={() => handleToggleToday(habit)}
              loading={togglingId === habit._id}
              canComplete={canCompleteToday(habit)}
              periodLabel={habit.frecuencia === 'semanal' ? 'esta semana' : 'hoy'}
              streakUnit={habit.frecuencia === 'semanal' ? 'semanas' : 'días'}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSection = (title: string, list: Habit[], emptyText?: string) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        {title}{' '}
        <Typography component="span" variant="body2" color="text.secondary">
          ({list.length})
        </Typography>
      </Typography>
      {list.length === 0 ? (
        emptyText && (
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        )
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {list.map(renderHabitCard)}
        </Box>
      )}
    </Box>
  );

  return (
    <AppLayout pageTitle="Mis hábitos">
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar hábito..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Crear hábito
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {statusChips.map((chip) => (
          <Chip
            key={chip.value}
            label={chip.label}
            color={statusFilter === chip.value ? 'primary' : 'default'}
            onClick={() => setStatusFilter(chip.value)}
          />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : habits.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body1" color="text.secondary">
              Aún no tienes hábitos. Creá el primero con el botón de arriba.
            </Typography>
          </CardContent>
        </Card>
      ) : statusFilter === 'inactivos' ? (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Hábitos inactivos{' '}
            <Typography component="span" variant="body2" color="text.secondary">
              ({filteredHabits.length})
            </Typography>
          </Typography>
          {filteredHabits.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No tenés hábitos inactivos.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredHabits.map((habit) => {
                const priority = getPriorityInfo(habit.prioridad);
                return (
                  <Card
                    key={habit._id}
                    sx={{ borderLeft: '4px solid', borderLeftColor: 'action.disabled' }}
                  >
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {habit.nombre}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                          {habit.categoria && <Chip label={habit.categoria} size="small" />}
                          <Chip label="Inactivo" size="small" variant="outlined" />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton onClick={() => handleOpenEdit(habit)} color="primary" size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleAskDelete(habit)} color="error" size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          {renderSection(
            'Hábitos diarios',
            diarios,
            'No tenés hábitos diarios que coincidan con tu búsqueda.',
          )}
          {renderSection('Hábitos semanales', semanales)}
          {renderSection('Hábitos personalizados', personalizados)}
        </Box>
      )}

      <HabitDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
        habit={selectedHabit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar hábito"
        message={`¿Seguro que querés eliminar "${habitToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}