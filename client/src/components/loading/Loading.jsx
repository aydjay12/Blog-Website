import React from "react";

const Loading = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
    }}>
      <div style={{
        border: "3px solid #f3f3f3",
        borderRadius: "50%",
        borderTop: "3px solid #be9656",
        width: "40px",
        height: "40px",
        animation: "spin 1s linear infinite",
        marginBottom: "0.2rem",
      }}></div>
      <p>Loading...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;