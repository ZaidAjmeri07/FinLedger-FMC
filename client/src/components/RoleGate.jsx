import React from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Conditionally renders children if the authenticated user has the required role.
 */
const RoleGate = ({ role = "admin", children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    return fallback;
  }

  return <>{children}</>;
};

export default RoleGate;
