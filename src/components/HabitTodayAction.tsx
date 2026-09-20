'use client';
import { Box, Button, Typography, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import { HabitTracking } from '@/lib/habitTracking';

interface HabitTodayActionProps {
  tracking: HabitTracking;
  onToggle: () => void;
  loading?: boolean;
  canComplete: boolean;
  /** "hoy" o "esta semana", según la frecuencia del hábito. */
  periodLabel?: string;
  /** "días" o "semanas", para la etiqueta de la racha. */
  streakUnit?: string;
}

export default function HabitTodayAction({
  tracking,
  onToggle,
  loading,
  canComplete,
  periodLabel = 'hoy',
  streakUnit = 'días',
}: HabitTodayActionProps) {
  return (
    <Box
      sx={{
        mt: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
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

      {tracking.rachaActual > 0 && (
        <Tooltip title={`Mejor racha: ${tracking.mejorRacha} ${streakUnit}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <LocalFireDepartmentIcon fontSize="small" color="warning" />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {tracking.rachaActual}
            </Typography>
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}