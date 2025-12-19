import React from "react";
import { motion } from "framer-motion";
import RegisterForm from "../components/Auth/RegisterForm";

const RegisterPage: React.FC = () => {
  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <RegisterForm />
      </motion.div>
  );
};

export default RegisterPage;
