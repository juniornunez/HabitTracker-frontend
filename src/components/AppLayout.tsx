'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import ChecklistIcon from '@mui/icons-material/ChecklistOutlined';
import BarChartIcon from '@mui/icons-material/BarChartOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';

const DRAWER_WIDTH = 240;
const CONTENT_MAX_WIDTH = 1100;

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Hábitos', href: '/habits', icon: <ChecklistIcon /> },
  { label: 'Estadísticas', href: '/statistics', icon: <BarChartIcon /> },
  { label: 'Perfil', href: '/profile', icon: <PersonIcon /> },
];

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('Usuario');
  const [userEmail, setUserEmail] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserName(parsed.nombre || 'Usuario');
      setUserEmail(parsed.correo || '');
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const drawerContent = (
    <>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
          [ Habit Tracker ]
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ flexGrow: 1, mt: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              component={NextLink as any}
              href={item.href}
              selected={isActive}
              onClick={() => setMobileOpen(false)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                color: '#fff',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          {initials}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" noWrap sx={{ color: '#fff' }}>
            {userName}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}
          >
            {userEmail}
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Drawer temporal (mobile): overlay, se abre con el botón hamburguesa */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'secondary.main',
            color: '#fff',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer permanente (desktop) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'secondary.main',
            color: '#fff',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {pageTitle}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {initials}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  component={NextLink as any}
                  href="/profile"
                  onClick={() => setAnchorEl(null)}
                >
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  Mi perfil
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto' }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}