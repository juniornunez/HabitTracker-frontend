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
}

export default function HabitTodayAction({
  tracking,
  onToggle,
  loading,
  canComplete,
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
          {tracking.completadoHoy ? 'Completado hoy' : 'Marcar como completado'}
        </Button>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Hoy no corresponde este hábito
        </Typography>
      )}

      {tracking.rachaActual > 0 && (
        <Tooltip title={`Mejor racha: ${tracking.mejorRacha} días`}>
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