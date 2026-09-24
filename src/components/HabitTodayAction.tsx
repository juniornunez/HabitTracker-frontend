'use client';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { HabitTracking } from '@/lib/habitTracking';

interface HabitTodayActionProps {
  tracking: HabitTracking;
  onToggle: () => void;
  loading?: boolean;
  canComplete: boolean;
  /** "hoy" o "esta semana", según la frecuencia del hábito. */
  periodLabel?: string;
}

export default function HabitTodayAction({
  tracking,
  onToggle,
  loading,
  canComplete,
  periodLabel = 'hoy',
}: HabitTodayActionProps) {
  return (
    <Box sx={{ mt: 1.5 }}>
      {canComplete ? (
        <Button
          size="small"
          variant={tracking.completadoHoy ? 'contained' : 'outlined'}
          color="success"
          startIcon={
            tracking.completadoHoy ? (
              <CheckCircleIcon />
            ) : (
              <RadioButtonUncheckedIcon />
            )
          }
          onClick={onToggle}
          disabled={loading}
        >
          {tracking.completadoHoy
            ? `Completado ${periodLabel}`
            : 'Marcar como completado'}
        </Button>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Hoy no corresponde este hábito
        </Typography>
      )}
    </Box>
  );
}