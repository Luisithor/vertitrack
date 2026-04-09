import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { 
  Person, 
  Lock, 
  Eye, 
  EyeSlash, 
  Tools, 
  Building 
} from "react-bootstrap-icons";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../static/Login.css";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!usuario.trim()) {
      setError("El usuario es obligatorio");
      return;
    }

    if (!contrasena) {
      setError("La contraseña es obligatoria");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://vertitrack-backend.onrender.com/api/auth/login",
        { usuario: usuario.trim(), contrasena },
      );

      const { token, rol, id_usuario, nombre } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("rol", rol);
      localStorage.setItem("id_usuario", id_usuario);
      if (nombre) localStorage.setItem("nombre_usuario", nombre);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const rutas = {
        admin: "/clientes",
        tecnico: "/req-tecnicos",
      };

      navigate(rutas[rol] || "/");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Credenciales incorrectas");
      } else if (!err.response) {
        setError("Error de conexión con el servidor");
      } else {
        setError("Error interno. Intente más tarde");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-0 login-wrapper bg-carbon">
      <Row className="g-0 min-vh-100">
        <Col lg={6} className="d-none d-lg-block position-relative overflow-hidden">
          <div className="image-side h-100">
            <div className="overlay d-flex flex-column justify-content-center p-5">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="display-2 brand-font-serif text-ocre mb-2">Vertitrack</h1>
                <div className="philosophy-line mb-4">
                  <span className="text-white small tracking-widest">
                    ENGINEERED FOR EVERY LANDSCAPE
                  </span>
                </div>
                
                <div className="features-list mt-5">
                  <div className="feature-item d-flex align-items-center mb-3">
                    <Building className="text-ocre me-3" size={20} />
                    <span className="text-white-50">Centralización de equipos y ubicaciones</span>
                  </div>
                  <div className="feature-item d-flex align-items-center mb-3">
                    <Tools className="text-ocre me-3" size={20} />
                    <span className="text-white-50">Gestión de fallas y órdenes de trabajo</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </Col>

        <Col lg={6} className="d-flex align-items-center justify-content-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="form-container p-4 p-xl-5 w-100"
            style={{ maxWidth: "450px" }}
          >
            <div className="text-center mb-5">
              <div className="ritual-logo-mark mb-3 mx-auto">
                <span className="text-ocre fw-bold">V</span>
              </div>
              <h2 className="text-white brand-font-serif">Acceso al Sistema</h2>
              <p className="text-muted small">Gestión Operativa de Elevadores 2026 </p>
            </div>

            {error && (
              <Alert variant="danger" className="custom-alert mb-4" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="ritual-form">
              <Form.Group className="mb-4" controlId="usuario">
                <Form.Label className="text-ocre small fw-bold">ID DE USUARIO</Form.Label>
                <div className={`custom-input-group ${focusedField === "usuario" ? "focused" : ""}`}>
                  <span className="input-icon">
                    <Person size={20} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    onFocus={() => setFocusedField("usuario")}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    className="bg-transparent text-white"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="contrasena">
                <Form.Label className="text-ocre small fw-bold">CONTRASEÑA</Form.Label>
                <div className={`custom-input-group ${focusedField === "password" ? "focused" : ""}`}>
                  <span className="input-icon">
                    <Lock size={20} />
                  </span>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    className="bg-transparent text-white"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash /> : <Eye />}
                  </button>
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-5">
                <Form.Check
                  type="checkbox"
                  id="remember"
                  label={<small className="text-muted">Recordar sesión</small>}
                  className="custom-check"
                />
                <a href="/register" className="text-ocre small text-decoration-none">¿No tienes acceso? Registrate</a>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98, y: 2 }}
                type="submit"
                className="btn-ritual-primary w-100 py-3 fw-bold"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "INICIAR JORNADA"}
              </motion.button>

              <p className="text-center mt-5 small text-muted">
                Vertitrack Operaciones Técnicas © 2026 
              </p>
            </Form>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;