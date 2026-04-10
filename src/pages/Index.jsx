import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LayoutPublic from '../layout/LayoutPublic';
import PageAnimation from '../components/PageAnimation'; 
import NotFound from './NotFound';
import Login from './Login';
import Register from './Register';
import Fallas from './Fallas';
import Elevadores from './Elevadores';
import Clientes from './Clientes';
import Ordenes from './Orden';
import Dashboard from './Dashboard';
import Mantenimiento from './Mantenimiento';
import MantenimientoList from './MantenimientoList';
import ProtectedRoute from '../components/ProtectedRoute';
import Usuarios from './Usuarios';

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Login />,
        index: true,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        element: <ProtectedRoute />, 
        children: [
          {
            element: <PageAnimation />, 
            children: [
              {
                path: "/reporte-falla",
                element: <Fallas />,
              },
              {
                path: "/elevadores",
                element: <Elevadores />,
              },
              {
                path: "/clientes",
                element: <Clientes />,
              },
              {
                path: "/ordenes",
                element: <Ordenes />,
              },
              {
                path: "/dashboard",
                element: <Dashboard />,
              },
              {
                path: "/mantenimiento",
                element: <Mantenimiento />,
              },
              {
                path: "/historial-mantenimientos",
                element: <MantenimientoList />,
              },
              {
                path: "Usuarios",
                element: <Usuarios />,
              }
            ],
          },
        ],
      },
    ],
  },
]);