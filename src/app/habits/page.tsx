'use client';
import { useEffect, useMemo, useState } from 'react';
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
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AppLayout from '@/components/AppLayout';
import HabitDialog from '@/components/HabitDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getHabits, deleteHabit, Habit } from '@/lib/services/habits.service';
import { getPriorityInfo } from '@/lib/priority';

type StatusFilter = 'todos' | 'activos' | 'inactivos';
type SortOption = 'prioridad-desc' | 'prioridad-asc' | 'nombre';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('prioridad-desc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuHabit, setMenuHabit] = useState<Habit | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadHabits = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHabits();
      setHabits(data);
    } catch (err) {
      setError('No se pudieron cargar tus hábitos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

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

  const handleOpenCreate = () => {
    setSelectedHabit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setSelectedHabit(habit);
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSaved = () => {
    loadHabits();
    setSnackbar({
      open: true,
      message: selectedHabit ? 'Hábito actualizado' : 'Hábito creado correctamente',
      severity: 'success',
    });
  };

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, habit: Habit) => {
    setMenuAnchor(e.currentTarget);
    setMenuHabit(habit);
  };

  const handleAskDelete = () => {
    setConfirmOpen(true);
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (!menuHabit) return;
    setDeleting(true);
    try {
      await deleteHabit(menuHabit._id);
      setSnackbar({ open: true, message: 'Hábito eliminado', severity: 'success' });
      loadHabits();
    } catch (err) {
      setSnackbar({ open: true, message: 'No se pudo eliminar el hábito', severity: 'error' });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setMenuHabit(null);
    }
  };

  const statusChips: { label: string; value: StatusFilter }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activos', value: 'activos' },
    { label: 'Inactivos', value: 'inactivos' },
  ];

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
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
      ) : filteredHabits.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body1" color="text.secondary">
              {habits.length === 0
                ? 'Aún no tienes hábitos. Creá el primero con el botón de arriba.'
                : 'No hay hábitos que coincidan con tu búsqueda o filtro.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredHabits.map((habit) => {
            const priority = getPriorityInfo(habit.prioridad);
            return (
              <Card
                key={habit._id}
                sx={{
                  borderLeft: '4px solid',
                  borderLeftColor: `${priority.color}.main`,
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:last-child': { pb: 2 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {habit.nombre}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        {habit.categoria && (
                          <Chip label={habit.categoria} size="small" />
                        )}
                        <Chip
                          label={`Prioridad: ${priority.label}`}
                          size="small"
                          color={priority.color}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {habit.frecuencia}
                        </Typography>
                        {!habit.activo && (
                          <Chip label="Inactivo" size="small" color="default" variant="outlined" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Desde {new Date(habit.fechaInicio).toLocaleDateString('es-HN')}
                        {habit.fechaFin && ` hasta ${new Date(habit.fechaFin).toLocaleDateString('es-HN')}`}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={(e) => handleOpenMenu(e, habit)}>
                    <MoreVertIcon />
                  </IconButton>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuHabit && handleOpenEdit(menuHabit)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleAskDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      <HabitDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
        habit={selectedHabit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar hábito"
        message={`¿Seguro que querés eliminar "${menuHabit?.nombre}"? Esta acción no se puede deshacer.`}
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