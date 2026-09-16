'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';

interface UserProfile {
  _id: string;
  nombre: string;
  correo: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setProfile(response.data);
      } catch (err) {
        setError('No se pudo cargar tu perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const initials = profile?.nombre
    ? profile.nombre
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  const fechaRegistro = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <AppLayout pageTitle="Perfil">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Card sx={{ maxWidth: 480, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 80,
                height: 80,
                fontSize: 28,
                mx: 'auto',
                mb: 2,
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {profile?.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {profile?.correo}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary">
                Miembro desde
              </Typography>
              <Typography variant="body1">{fechaRegistro}</Typography>
            </Box>
          </CardContent>
        </Card>
        </Box>
      )}
    </AppLayout>
  );
}