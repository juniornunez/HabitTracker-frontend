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
  FormControlLabel,
  Switch,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  createHabit,
  updateHabit,
  Habit,
  CreateHabitPayload,
  CATEGORIAS,
} from '@/lib/services/habits.service';
import { habitSchema, getZodErrors } from '@/lib/validation';
import { DIAS_SEMANA, DIAS_SEMANA_LABELS, DiaSemana } from '@/lib/habitTracking';
import { getHondurasDateString } from '@/lib/date';

interface HabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  habit?: Habit | null;
}

const initialForm: CreateHabitPayload = {
  nombre: '',
  descripcion: '',
  categoria: undefined,
  frecuencia: 'diario',
  diasPersonalizados: [],
  prioridad: 1,
  fechaInicio: getHondurasDateString(),
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(habit);

  useEffect(() => {
    if (habit) {
      setForm({
        nombre: habit.nombre,
        descripcion: habit.descripcion || '',
        categoria: habit.categoria,
        frecuencia: habit.frecuencia,
        diasPersonalizados: habit.diasPersonalizados || [],
        prioridad: habit.prioridad,
        fechaInicio: habit.fechaInicio?.slice(0, 10) || initialForm.fechaInicio,
        fechaFin: habit.fechaFin?.slice(0, 10) || '',
        activo: habit.activo,
      });
    } else {
      setForm(initialForm);
    }
    setError('');
    setFieldErrors({});
  }, [habit, open]);

  const handleChange = (field: keyof CreateHabitPayload, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDia = (dia: DiaSemana) => {
    setForm((prev) => {
      const current = prev.diasPersonalizados || [];
      const exists = current.includes(dia);
      return {
        ...prev,
        diasPersonalizados: exists
          ? current.filter((d) => d !== dia)
          : [...current, dia],
      };
    });
  };

  const handleSubmit = async () => {
    setError('');

    const errors = getZodErrors(habitSchema, form);
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    if (form.fechaFin && form.fechaFin < form.fechaInicio) {
      setFieldErrors({ fechaFin: 'La fecha de fin no puede ser anterior a la de inicio' });
      return;
    }

    if (
      form.frecuencia === 'personalizada' &&
      (!form.diasPersonalizados || form.diasPersonalizados.length === 0)
    ) {
      setError('Elegí al menos un día de la semana para la frecuencia personalizada');
      return;
    }

    const payload = {
      ...form,
      fechaFin: form.fechaFin || undefined,
      descripcion: form.descripcion || undefined,
      categoria: form.categoria || undefined,
      diasPersonalizados:
        form.frecuencia === 'personalizada' ? form.diasPersonalizados : undefined,
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
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              error={Boolean(fieldErrors.nombre)}
              helperText={fieldErrors.nombre}
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
          <Grid size={{ xs: 6 }}>
            <TextField
              select
              label="Categoría"
              fullWidth
              value={form.categoria || ''}
              onChange={(e) => handleChange('categoria', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>Sin categoría</em>
              </MenuItem>
              {CATEGORIAS.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
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
          <Grid size={{ xs: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.activo)}
                  onChange={(e) => handleChange('activo', e.target.checked)}
                />
              }
              label={form.activo ? 'Activo' : 'Inactivo'}
            />
          </Grid>

          {form.frecuencia === 'personalizada' && (
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Días de la semana
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {DIAS_SEMANA.map((dia) => {
                  const selected = (form.diasPersonalizados || []).includes(dia);
                  return (
                    <Chip
                      key={dia}
                      label={DIAS_SEMANA_LABELS[dia]}
                      onClick={() => toggleDia(dia)}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 6 }}>
            <TextField
              label="Fecha de inicio"
              type="date"
              fullWidth
              value={form.fechaInicio}
              onChange={(e) => handleChange('fechaInicio', e.target.value)}
              error={Boolean(fieldErrors.fechaInicio)}
              helperText={fieldErrors.fechaInicio}
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
              error={Boolean(fieldErrors.fechaFin)}
              helperText={fieldErrors.fechaFin}
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