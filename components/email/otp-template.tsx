interface EmailTemplateProps {
    otp: string
  }
  
  export function EmailTemplate({ otp }: EmailTemplateProps) {
    return (
      <div>
        <h1>Your Login OTP</h1>
        <p>Use the following OTP to complete your login:</p>
        <div style={{ 
          padding: '20px',
          background: '#f3f4f6',
          borderRadius: '4px',
          fontSize: '24px',
          textAlign: 'center',
          letterSpacing: '0.5em',
          fontWeight: 'bold'
        }}>
          {otp}
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
      </div>
    )
  }
  
  