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
import { loginUser } from '@/lib/services/auth.service';
import { loginSchema, getZodErrors } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = getZodErrors(loginSchema, { correo, contraseña });
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const data = await loginUser({ correo, contraseña });
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Correo o contraseña incorrectos',
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
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400, p: 2 }}>
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
            Iniciar sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
              helperText={fieldErrors.contraseña}
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

            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <MuiLink component={NextLink as any} href="#" variant="body2">
                ¿Olvidaste tu contraseña?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>

            <Divider sx={{ my: 2 }}>o</Divider>

            <Typography variant="body2" align="center">
              ¿No tienes cuenta?{' '}
              <MuiLink component={NextLink as any} href="/register" fontWeight={600}>
                Regístrate
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}