import * as React from "react";

interface VerificationEmailProps {
  userName?: string;
  verificationUrl: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  userName,
  verificationUrl,
}) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
    }}
  >
    <h1 style={{ color: "#333", fontSize: "24px", marginBottom: "20px" }}>
      Vérification de votre adresse email
    </h1>

    {userName && (
      <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5" }}>
        Bonjour {userName},
      </p>
    )}

    <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5" }}>
      Merci de vous être inscrit ! Pour continuer, veuillez vérifier votre
      adresse email en cliquant sur le bouton ci-dessous :
    </p>

    <div style={{ margin: "30px 0", textAlign: "center" }}>
      <a
        href={verificationUrl}
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "12px 30px",
          textDecoration: "none",
          borderRadius: "5px",
          display: "inline-block",
          fontSize: "16px",
        }}
      >
        Vérifier mon email
      </a>
    </div>

    <p style={{ color: "#999", fontSize: "14px", lineHeight: "1.5" }}>
      Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
    </p>

    <p style={{ color: "#999", fontSize: "14px", lineHeight: "1.5" }}>
      Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans
      votre navigateur :
      <br />
      <a href={verificationUrl} style={{ color: "#666", wordBreak: "break-all" }}>
        {verificationUrl}
      </a>
    </p>
  </div>
);
