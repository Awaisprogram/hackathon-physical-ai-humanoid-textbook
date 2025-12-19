import React from "react";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  mobile?: boolean;
};

export default function NavbarUser({ mobile }: Props) {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  // User not logged in → show Login / Register
  if (!user) {
    return (
      <div
        className={mobile ? "menu__list-item" : "navbar__item"}
        style={{ display: "flex", gap: "10px", alignItems: "center" }}
      >
        <Link
          to="/login"
          className={mobile ? "menu__link" : "navbar__link"}
        >
          Login
        </Link>

        {!mobile && (
          <Link
            to="/register"
            className="navbar__link"
          >
            Register
          </Link>
        )}
      </div>
    );
  }

  // User logged in → show Profile + Logout
  return (
    <>
      {/* Desktop Navbar */}
      {!mobile && (
        <div className="navbar__item dropdown dropdown--hoverable">
          <a
            href="#"
            className="navbar__link"
            onClick={(e) => e.preventDefault()}
          >
            <FaUserCircle
              size={20}
              style={{ marginRight: "8px", transform: "translateY(3px)" }}
            />
            {user.name || "Profile"}
          </a>

          <ul className="dropdown__menu">
            <li>
            <Link className="menu__link" to="/dashboard">
              Dashboard
            </Link>
            </li>
            <li>
              <Link
                className="dropdown__link"
                to="docs/chapter-1/lesson1-1-ros2-fundamentals"
              >
                Book
              </Link>
            </li>
            <li>
              <div
                className="dropdown__link"
                onClick={handleLogout}
                style={{
                  cursor: "pointer",
                  color: "var(--ifm-color-danger)",
                  fontWeight: 600,
                }}
              >
                Logout
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Mobile Menu */}
      {mobile && (
        <>
          <li className="menu__list-item">
            <Link className="menu__link" to="/dashboard">
              Dashboard
            </Link>
          </li>

          <li className="menu__list-item">
            <Link className="menu__link" to="docs/chapter-1/lesson1-1-ros2-fundamentals">
              Book
            </Link>
          </li>

          <li className="menu__list-item">
            <div
              className="menu__link"
              onClick={handleLogout}
              style={{
                color: "var(--ifm-color-danger)",
                fontWeight: 600,
              }}
            >
              Logout
            </div>
          </li>
        </>
      )}
    </>
  );
}
