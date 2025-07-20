import React from "react";

const RouteLoading = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      padding: "2rem",
    }}>
      <div style={{
        border: "3px solid #f3f3f3",
        borderRadius: "50%",
        borderTop: "3px solid #be9656",
        width: "30px",
        height: "30px",
        animation: "spin 1s linear infinite",
        marginBottom: "0.5rem",
      }}></div>
      <p style={{ 
        color: "#666", 
        fontSize: "0.9rem",
        margin: "0"
      }}>
        Loading page...
      </p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RouteLoading; 