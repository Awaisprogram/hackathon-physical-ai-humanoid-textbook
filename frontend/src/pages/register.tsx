import React from "react";
import { motion } from "framer-motion";
import RegisterForm from "../components/Auth/RegisterForm";
import "./PageTemplate.css";

const RegisterPage: React.FC = () => {
  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <RegisterForm />
      </motion.div>
    </div>
  );
};

export default RegisterPage;
