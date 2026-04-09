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
  Envelope, 
  Telephone, 
  Lock, 
  ArrowLeft,
  PersonBadge,
  Calendar3
} from "react-bootstrap-icons";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../static/Login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "", 
    usuario: "",
    correo: "",
    telefono: "",
    contrasena: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("https://vertitrack-backend.onrender.com/api/usuarios/crear", formData);
      navigate("/"); 
    } catch (err) {
      setError(err.response?.data?.error || "Error al dar de alta en el sistema");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-0 login-wrapper bg-carbon">
      <Row className="g-0 min-vh-100">
        <Col lg={5} className="d-none d-lg-block position-relative overflow-hidden">
          <div className="image-side h-100">
            <div className="overlay d-flex flex-column justify-content-center p-5">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="display-3 brand-font-serif text-ocre mb-2">Gremio Vertitrack</h1>
                <div className="philosophy-line mb-4">
                  <span className="text-white small tracking-widest uppercase">
                    Engineered for every landscape [cite: 1]
                  </span>
                </div>
                <p className="text-white-50 mt-4">
                  "La tecnología como respeto digital e inclusión operativa."
                </p>
              </motion.div>
            </div>
          </div>
        </Col>

        <Col lg={7} className="d-flex align-items-center justify-content-center py-5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="form-container p-4 p-xl-5 w-100"
            style={{ maxWidth: "750px" }}
          >
            <div className="mb-4">
              <Button 
                variant="link" 
                onClick={() => navigate("/")} 
                className="text-ocre p-0 mb-3 d-flex align-items-center text-decoration-none"
              >
                <ArrowLeft className="me-2" /> VOLVER AL ACCESO
              </Button>
              <h2 className="text-white brand-font-serif">Alta de Personal</h2>
              <p className="text-muted small">Registro en la base de datos operativa 2026 [cite: 2]</p>
            </div>

            {error && <Alert variant="danger" className="custom-alert mb-4">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="ritual-form">
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-ocre small fw-bold">NOMBRE</Form.Label>
                    <div className={`custom-input-group ${focusedField === "nombre" ? "focused" : ""}`}>
                      <Form.Control
                        name="nombre"
                        required
                        onChange={handleChange}
                        onFocus={() => setFocusedField("nombre")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent text-white"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-ocre small fw-bold">APELLIDO PATERNO</Form.Label>
                    <div className={`custom-input-group ${focusedField === "paterno" ? "focused" : ""}`}>
                      <Form.Control
                        name="apellido_paterno"
                        required
                        onChange={handleChange}
                        onFocus={() => setFocusedField("paterno")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent text-white"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-ocre small fw-bold">APELLIDO MATERNO</Form.Label>
                    <div className={`custom-input-group ${focusedField === "materno" ? "focused" : ""}`}>
                      <Form.Control
                        name="apellido_materno"
                        onChange={handleChange}
                        onFocus={() => setFocusedField("materno")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent text-white"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-ocre small fw-bold">FECHA NACIMIENTO</Form.Label>
                    <div className={`custom-input-group ${focusedField === "fecha" ? "focused" : ""}`}>
                      <span className="input-icon"><Calendar3 /></span>
                      <Form.Control
                        type="date"
                        name="fecha_nacimiento"
                        required
                        onChange={handleChange}
                        onFocus={() => setFocusedField("fecha")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent text-white"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-ocre small fw-bold">CORREO ELECTRÓNICO</Form.Label>
                    <div className={`custom-input-group ${focusedField === "correo" ? "focused" : ""}`}>
                      <span className="input-icon"><Envelope /></span>
                      <Form.Control
                        type="email"
                        name="correo"
                        onChange={handleChange}
                        onFocus={() => setFocusedField("correo")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent text-white"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-ocre small fw-bold">TELÉFONO</Form.Label>
                    <div className={`custom-input-group ${focusedField === "tel" ? "focused" : ""}`}>
                      <span className="input-icon"><Telephone /></span>
                      <Form.Control
                        type="number"
                        name="telefono"
                        onChange={handleChange}
                        onFocus={() => setFocusedField("tel")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent text-white"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-ocre small fw-bold">USUARIO</Form.Label>
                    <div className={`custom-input-group ${focusedField === "user" ? "focused" : ""}`}>
                      <span className="input-icon"><PersonBadge /></span>
                      <Form.Control
                        name="usuario"
                        required
                        onChange={handleChange}
                        onFocus={() => setFocusedField("user")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent text-white"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-ocre small fw-bold">CONTRASEÑA</Form.Label>
                    <div className={`custom-input-group ${focusedField === "pass" ? "focused" : ""}`}>
                      <span className="input-icon"><Lock /></span>
                      <Form.Control
                        type="password"
                        name="contrasena"
                        required
                        onChange={handleChange}
                        onFocus={() => setFocusedField("pass")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent text-white"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98, y: 2 }}
                type="submit"
                className="btn-ritual-primary w-100 py-3 fw-bold mt-2"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "DAR DE ALTA EN VERTITRACK"}
              </motion.button>

              <p className="text-center mt-4 small text-muted">
                Este registro permitirá centralizar la información técnica y administrativa del personal operativo[cite: 11, 77].
              </p>
            </Form>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;