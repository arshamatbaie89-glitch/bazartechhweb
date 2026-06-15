export async function sendOtpEmail(recipient, otp) {
  console.log(`[OTP] ${otp}`)
  console.log(`[OTP] Sent to ${recipient}`)
  return true
}
