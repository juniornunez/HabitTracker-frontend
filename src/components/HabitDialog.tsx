'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  createHabit,
  updateHabit,
  Habit,
  CreateHabitPayload,
} from '@/lib/services/habits.service';

interface HabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  habit?: Habit | null;
}

const initialForm: CreateHabitPayload = {
  nombre: '',
  descripcion: '',
  categoria: '',
  frecuencia: 'diario',
  prioridad: 1,
  fechaInicio: new Date().toISOString().slice(0, 10),
  fechaFin: '',
  activo: true,
};

export default function HabitDialog({
  open,
  onClose,
  onSaved,
  habit,
}: HabitDialogProps) {
  const [form, setForm] = useState<CreateHabitPayload>(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(habit);

  useEffect(() => {
    if (habit) {
      setForm({
        nombre: habit.nombre,
        descripcion: habit.descripcion || '',
        categoria: habit.categoria || '',
        frecuencia: habit.frecuencia,
        prioridad: habit.prioridad,
        fechaInicio: habit.fechaInicio?.slice(0, 10) || initialForm.fechaInicio,
        fechaFin: habit.fechaFin?.slice(0, 10) || '',
        activo: habit.activo,
      });
    } else {
      setForm(initialForm);
    }
    setError('');
  }, [habit, open]);

  const handleChange = (field: keyof CreateHabitPayload, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.nombre.trim()) {
      setError('El nombre del hábito es obligatorio');
      return;
    }

    const payload = {
      ...form,
      fechaFin: form.fechaFin || undefined,
      descripcion: form.descripcion || undefined,
      categoria: form.categoria || undefined,
    };

    setLoading(true);
    try {
      if (isEditing && habit) {
        await updateHabit(habit._id, payload);
      } else {
        await createHabit(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'No se pudo guardar el hábito',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEditing ? 'Editar hábito' : 'Crear hábito'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              label="Nombre del hábito"
              placeholder="Ej. Beber 2L de agua, Meditar, Estudiar..."
              fullWidth
              required
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Descripción"
              placeholder="Escribe detalles sobre este hábito, objetivos, o notas importantes..."
              fullWidth
              multiline
              rows={2}
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Categoría"
              placeholder="Ej. Salud, Bienestar, Educación"
              fullWidth
              value={form.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              label="Prioridad"
              fullWidth
              value={form.prioridad}
              onChange={(e) => handleChange('prioridad', Number(e.target.value))}
            >
              <MenuItem value={1}>Baja</MenuItem>
              <MenuItem value={2}>Media</MenuItem>
              <MenuItem value={3}>Alta</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              label="Frecuencia"
              fullWidth
              value={form.frecuencia}
              onChange={(e) => handleChange('frecuencia', e.target.value)}
            >
              <MenuItem value="diario">Diario</MenuItem>
              <MenuItem value="semanal">Semanal</MenuItem>
              <MenuItem value="personalizada">Personalizada</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Fecha de inicio"
              type="date"
              fullWidth
              value={form.fechaInicio}
              onChange={(e) => handleChange('fechaInicio', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Fecha de fin (opcional)"
              type="date"
              fullWidth
              value={form.fechaFin}
              onChange={(e) => handleChange('fechaFin', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar hábito'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}