import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Outlet } from "react-router-dom";

const PageAnimation = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname} // CLAVE: Esto obliga a re-animar al cambiar de ruta
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet /> {/* Aquí es donde se renderizarán tus páginas (Elevadores, Fallas, etc.) */}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageAnimation;