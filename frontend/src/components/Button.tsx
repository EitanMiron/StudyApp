// src/components/Button.tsx
import React from "react";

interface Props {
  border: string;
  color: string;
  children?: React.ReactNode;
  height: string;
  onClick: () => void;
  radius: string;
  width: string;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;  // Optional additional styles
}

const Button: React.FC<Props> = ({ 
    border,
    color,
    children,
    height,
    onClick, 
    radius,
    width,
    type = "button",
    style = {}
  }) => { 
  return (
    <button 
    type={type}  
    onClick={onClick}
      style={{
         backgroundColor: color,
         border,
         borderRadius: radius,
         height,
         width,
         color: "white",
         fontWeight: "bold",
         cursor: "pointer",
         transition: "all 0.3s ease",
         ...style  // Spread any additional styles
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.opacity = "0.8";
        e.currentTarget.style.transform = "scale(1.02)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}

export default Button;
