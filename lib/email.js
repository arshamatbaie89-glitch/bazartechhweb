export async function sendOtpEmail(recipient, otp) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OTP] ${otp}`)
    console.log(`[OTP] Sent to ${recipient}`)
  }
  return true
}
