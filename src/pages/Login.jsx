import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import { Person, Lock, Eye, EyeSlash } from "react-bootstrap-icons";
import { motion } from "framer-motion";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
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

  const VAPID_KEY = "BF-TBxOz3GpCZW4iczgoDS8j05pcCEGAc80ThHOhzK_EdYKh4SAhMuG9ZMhWzjp0Um386lyfDOL-As6QfWwK6pg";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (token && rol) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const rutas = { admin: "/clientes", tecnico: "/mantenimiento" };
      navigate(rutas[rol] || "/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!usuario.trim() || !contrasena) {
      setError("Por favor, complete todos los campos");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://vertitrack-backend.onrender.com/api/auth/login",
        { usuario: usuario.trim(), contrasena },
      );

      const { token, rol, id_usuario, nombre } = response.data;
      console.log("✅ [1] Login exitoso. id_usuario:", id_usuario, "| rol:", rol);

      localStorage.setItem("token", token);
      localStorage.setItem("rol", rol);
      localStorage.setItem("id_usuario", id_usuario);
      if (nombre) localStorage.setItem("nombre_usuario", nombre);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("✅ [2] Token JWT seteado en axios headers");

      // --- LÓGICA DE NOTIFICACIONES PUSH ---
      try {
        console.log("🔔 [3] Verificando soporte de Notifications...");

        if (!("Notification" in window)) {
          console.warn("⚠️ [3] Este navegador NO soporta notificaciones");
        } else {
          console.log("🔔 [3] Notification API disponible. Permiso actual:", Notification.permission);

          const permission = await Notification.requestPermission();
          console.log("🔔 [4] Resultado del permiso:", permission);

          if (permission === "granted") {
            console.log("📱 [5] Solicitando FCM token a Firebase...");
            console.log("📱 [5] Objeto messaging:", messaging);
            console.log("📱 [5] VAPID KEY:", VAPID_KEY);

            const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            console.log("📱 [6] FCM Token obtenido:", fcmToken ? `${fcmToken.substring(0, 20)}...` : "NULL o vacío");

            if (fcmToken) {
              console.log("📡 [7] Enviando token al backend...");
              console.log("📡 [7] Payload:", { id_usuario, token_push: fcmToken.substring(0, 20) + "..." });
              console.log("📡 [7] Header Authorization presente:", !!axios.defaults.headers.common["Authorization"]);

              const putResponse = await axios.put(
                "https://vertitrack-backend.onrender.com/api/usuarios/actualizar-token",
                { id_usuario, token_push: fcmToken }
              );

              console.log("✅ [8] Respuesta del backend:", putResponse.status, putResponse.data);
            } else {
              console.warn("⚠️ [6] FCM Token es null/vacío. Posible problema con el Service Worker o VAPID KEY");
            }
          } else {
            console.warn("⚠️ [4] Permiso de notificaciones denegado o descartado:", permission);
          }
        }
      } catch (pushErr) {
        console.error("❌ [PUSH ERROR] Tipo:", pushErr?.name);
        console.error("❌ [PUSH ERROR] Mensaje:", pushErr?.message);
        console.error("❌ [PUSH ERROR] Stack:", pushErr?.stack);
        console.error("❌ [PUSH ERROR] Objeto completo:", pushErr);
      }
      // -------------------------------------

      const rutas = { admin: "/clientes", tecnico: "/mantenimiento" };
      navigate(rutas[rol] || "/");

    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.status === 401
          ? "Credenciales incorrectas"
          : "Error de conexión con el servidor",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-0 login-wrapper">
      <Row className="g-0 min-vh-100">
        <Col lg={7} className="d-none d-lg-block position-relative overflow-hidden">
          <div className="image-side h-100 d-flex align-items-end p-5">
            <div className="overlay-navy"></div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="position-relative z-index-10"
            >
              <div className="tracking-widest text-steel mb-2 uppercase">System Version 2026</div>
              <h1 className="display-1 brand-font-serif text-white mb-0">Vertitrack</h1>
              <div className="philosophy-line-steel">
                <p className="tracking-widest text-white-50 mb-0">ENGINEERED FOR EVERY LANDSCAPE</p>
              </div>
            </motion.div>
          </div>
        </Col>

        <Col lg={5} className="d-flex align-items-center justify-content-center bg-navy-dark">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="form-container p-4 p-xl-5 w-100"
            style={{ maxWidth: "420px" }}
          >
            <div className="text-start mb-5">
              <div className="ritual-logo-mark-navy"><span>V</span></div>
              <h2 className="text-white h4 brand-font-serif">Acceso al Sistema</h2>
              <p className="text-steel-muted x-small uppercase tracking-widest">Autenticación de Terminal</p>
            </div>

            {error && <Alert variant="danger" className="custom-alert-navy mb-4">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="ritual-form">
              <Form.Group className="mb-4">
                <Form.Label className="label-technical-navy">IDENTIFICACIÓN / USUARIO</Form.Label>
                <div className={`custom-input-group-navy ${focusedField === "usuario" ? "focused" : ""}`}>
                  <span className="input-icon"><Person size={18} /></span>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese su ID técnico"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    onFocus={() => setFocusedField("usuario")}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    className="input-transparent"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="label-technical-navy">CÓDIGO DE SEGURIDAD</Form.Label>
                <div className={`custom-input-group-navy ${focusedField === "password" ? "focused" : ""}`}>
                  <span className="input-icon"><Lock size={18} /></span>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    className="input-transparent"
                  />
                  <button
                    type="button"
                    className="password-toggle-navy"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
                <Form.Check
                  type="checkbox"
                  id="remember"
                  defaultChecked
                  label={<span className="x-small text-steel-muted uppercase">Mantener Conexión</span>}
                  className="custom-check-navy"
                />
                <a href="/register" className="x-small text-steel text-decoration-none hover-underline">SOLICITAR ACCESO</a>
              </div>

              <motion.button
                whileHover={{ backgroundColor: "var(--v-blue)", color: "#ffffff" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-v-outline w-100"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : "INICIAR SESIÓN"}
              </motion.button>
            </Form>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;