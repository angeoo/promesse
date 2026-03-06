type PasswordResetEmailParams = {
  to: string;
  resetUrl: string;
};

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

function getAdminFromEmail() {
  return process.env.ADMIN_FROM_EMAIL?.trim() || "";
}

export function isPasswordResetEmailConfigured() {
  return getResendApiKey().length > 0 && getAdminFromEmail().length > 0;
}

export async function sendPasswordResetEmail(params: PasswordResetEmailParams) {
  const apiKey = getResendApiKey();
  const from = getAdminFromEmail();

  if (!apiKey || !from) {
    throw new Error("Password reset email is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: "Réinitialisation du mot de passe admin",
      text: [
        "Vous avez demandé la réinitialisation du mot de passe admin.",
        "",
        `Ouvrez ce lien pour choisir un nouveau mot de passe : ${params.resetUrl}`,
        "",
        "Ce lien expire dans 60 minutes.",
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
      ].join("\n")
    })
  });

  if (!response.ok) {
    throw new Error("Unable to send password reset email.");
  }
}
