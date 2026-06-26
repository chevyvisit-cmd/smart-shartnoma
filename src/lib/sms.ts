export async function sendSms(phone: string, code: string) {
  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;

  console.log("DEBUG SMS: Sending to", phone, "Code:", code);

  try {
    // 1. Get Token
    const tokenResponse = await fetch("https://notify.eskiz.uz/api/auth/login", {
      method: "POST",
      body: new URLSearchParams({ email: email ?? "", password: password ?? "" }),
    });
    const tokenData = await tokenResponse.json();
    console.log("DEBUG SMS: Auth Response", tokenData);
    
    if (!tokenData.data?.token) {
        throw new Error("Failed to get SMS token");
    }
    const token = tokenData.data.token;

    // 2. Send SMS
    const smsResponse = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: new URLSearchParams({
        mobile_phone: phone.replace(/\D/g, ""),
        message: `Smart-Shartnoma kodi: ${code}`,
        from: "4546",
      }),
    });
    const smsData = await smsResponse.json();
    console.log("DEBUG SMS: Send Response", smsData);
    
  } catch (error) {
    console.error("DEBUG SMS: Error", error);
    throw error;
  }
}
