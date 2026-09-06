'use client';
import { Box, Typography } from '@mui/material';

export default function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Typography component="h1" variant="h4" color="primary">
        Habit Tracker
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Frontend funcionando con Material UI
      </Typography>
    </Box>
  );
}