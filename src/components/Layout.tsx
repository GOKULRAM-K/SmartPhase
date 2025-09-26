// src/components/Layout.tsx
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        sx={{ borderBottom: "1px solid #e6e9ef" }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "primary.main",
              fontWeight: 700,
            }}
          >
            CLB — Change-Load_Balancer
          </Typography>

          <Box sx={{ ml: 3, display: { xs: "none", sm: "flex" }, gap: 2 }}>
            <Typography
              component={RouterLink}
              to="/"
              sx={{ textDecoration: "none", color: "text.primary" }}
            >
              Home
            </Typography>
            <Typography
              component={RouterLink}
              to="/nodes"
              sx={{ textDecoration: "none", color: "text.primary" }}
            >
              Nodes
            </Typography>
            <Typography
              component={RouterLink}
              to="/operations"
              sx={{ textDecoration: "none", color: "text.primary" }}
            >
              Operations
            </Typography>
            <Typography
              component={RouterLink}
              to="/insights"
              sx={{ textDecoration: "none", color: "text.primary" }}
            >
              Insights
            </Typography>
            <Typography
              component={RouterLink}
              to="/console"
              sx={{ textDecoration: "none", color: "text.primary" }}
            >
              Control Console
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          {/* 🔔 Removed Demo/Live switch and Notifications bell */}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
        {children}
      </Container>
    </>
  );
}
