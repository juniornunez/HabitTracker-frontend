'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Link as MuiLink,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import NextLink from 'next/link';
import { registerUser } from '@/lib/services/auth.service';
import { registerSchema, getZodErrors } from '@/lib/validation';

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = getZodErrors(registerSchema, {
      nombre,
      correo,
      contraseña,
      confirmarContraseña,
    });
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const data = await registerUser({ nombre, correo, contraseña });
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'No se pudo crear la cuenta',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        px: 2,
        py: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, p: 2 }}>
        <CardContent>
          <Typography
            variant="h5"
            align="center"
            color="primary"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Habit Tracker
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 3 }}>
            Crear cuenta
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Nombre completo"
              fullWidth
              margin="normal"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              error={Boolean(fieldErrors.nombre)}
              helperText={fieldErrors.nombre}
            />
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              margin="normal"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              error={Boolean(fieldErrors.correo)}
              helperText={fieldErrors.correo}
            />
            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              error={Boolean(fieldErrors.contraseña)}
              helperText={fieldErrors.contraseña || 'Mínimo 8 caracteres'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirmar contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={confirmarContraseña}
              onChange={(e) => setConfirmarContraseña(e.target.value)}
              error={Boolean(fieldErrors.confirmarContraseña)}
              helperText={fieldErrors.confirmarContraseña}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>

            <Divider sx={{ my: 2 }}>o</Divider>

            <Typography variant="body2" align="center">
              ¿Ya tienes cuenta?{' '}
              <MuiLink component={NextLink as any} href="/login" fontWeight={600}>
                Inicia sesión
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}