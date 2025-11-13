import * as React from "react";

interface ResetPasswordEmailProps {
  userName?: string;
  resetUrl: string;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  userName,
  resetUrl,
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
      Réinitialisation de votre mot de passe
    </h1>

    {userName && (
      <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5" }}>
        Bonjour {userName},
      </p>
    )}

    <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5" }}>
      Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le
      bouton ci-dessous pour créer un nouveau mot de passe :
    </p>

    <div style={{ margin: "30px 0", textAlign: "center" }}>
      <a
        href={resetUrl}
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
        Réinitialiser mon mot de passe
      </a>
    </div>

    <p style={{ color: "#999", fontSize: "14px", lineHeight: "1.5" }}>
      Si vous n&apos;avez pas demandé cette réinitialisation, vous pouvez ignorer cet
      email. Votre mot de passe restera inchangé.
    </p>

    <p style={{ color: "#999", fontSize: "14px", lineHeight: "1.5" }}>
      Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans
      votre navigateur :
      <br />
      <a href={resetUrl} style={{ color: "#666", wordBreak: "break-all" }}>
        {resetUrl}
      </a>
    </p>

    <p style={{ color: "#999", fontSize: "14px", lineHeight: "1.5", marginTop: "30px" }}>
      Ce lien expirera dans 1 heure pour des raisons de sécurité.
    </p>
  </div>
);
