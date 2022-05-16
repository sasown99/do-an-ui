import React from "react";
import "../assets/css/header.scss";

export default function Header() {
  return (
    <div className="header">
      <nav>
        <ul className="nav nav-header">
          <li>
            <a href="/#">About us</a>
          </li>
          <li>
            <a href="/#">More Demos</a>
          </li>
          <li>
            <a href="/#">Contact</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
