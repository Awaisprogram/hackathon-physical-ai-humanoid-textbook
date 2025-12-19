import React from "react";
import { motion } from "framer-motion";
import Login from "../components/Auth/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Login />
    </motion.div>
  );
};

export default LoginPage;
