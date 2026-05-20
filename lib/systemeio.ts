export async function sendeEmailAnSystemeio(email: string, name: string, profil: string): Promise<boolean> {
  const webhookUrl = process.env.NEXT_PUBLIC_SYSTEMEIO_WEBHOOK;
  if (!webhookUrl) return false;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        first_name: name,
        fields: { profil, quelle: "viki-screening" },
      }),
    });
    return true;
  } catch {
    return false;
  }
}
