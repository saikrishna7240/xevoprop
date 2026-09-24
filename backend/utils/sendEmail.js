const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:
    process.env.BREVO_SMTP_HOST ||
    "smtp-relay.brevo.com",

  port: Number(
    process.env.BREVO_SMTP_PORT || 587
  ),

  secure: false,

  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});


const sendAuthOTP = async ({
  email,
  name,
  otp,
  purpose,
}) => {

  const isRegistration =
    purpose === "register";

  const subject = isRegistration
    ? "Verify your Xevoprop account"
    : "Your Xevoprop login verification code";


  const heading = isRegistration
    ? "Verify your Xevoprop account"
    : "Verify your login";


  const description = isRegistration
    ? "Use the verification code below to complete your Xevoprop account registration."
    : "Use the verification code below to continue signing in to your Xevoprop account.";


  const mailOptions = {
    from: `"${process.env.BREVO_FROM_NAME || "Xevoprop"}" <${process.env.BREVO_FROM_EMAIL}>`,

    to: email,

    subject,

    text: `
Hello ${name || "there"},

${heading}

Your verification code is:

${otp}

This code will expire in 5 minutes.

If you did not request this code, please ignore this email.

Regards,
Xevoprop
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${heading}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f7fa;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      max-width:560px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #e2e8ef;
    "
  >

    <div
      style="
        padding:24px 28px;
        background:#061b32;
        color:#ffffff;
      "
    >
      <h2
        style="
          margin:0;
          font-size:20px;
        "
      >
        XEVOPROP
      </h2>

      <p
        style="
          margin:6px 0 0;
          color:#b8c8d9;
          font-size:12px;
        "
      >
        Real estate, made more certain.
      </p>
    </div>


    <div style="padding:32px 28px;">

      <h2
        style="
          margin:0 0 10px;
          color:#10243b;
          font-size:21px;
        "
      >
        ${heading}
      </h2>

      <p
        style="
          margin:0 0 24px;
          color:#526173;
          font-size:14px;
          line-height:1.6;
        "
      >
        Hello ${name || "there"},
        ${description}
      </p>


      <div
        style="
          padding:18px;
          text-align:center;
          background:#f3f7ff;
          border:1px solid #dbe7f5;
        "
      >

        <div
          style="
            color:#7c8797;
            font-size:10px;
            font-weight:bold;
            letter-spacing:0.12em;
            margin-bottom:8px;
          "
        >
          VERIFICATION CODE
        </div>

        <div
          style="
            color:#0d4779;
            font-size:32px;
            font-weight:700;
            letter-spacing:8px;
          "
        >
          ${otp}
        </div>

      </div>


      <p
        style="
          margin:22px 0 0;
          color:#7c8797;
          font-size:12px;
          line-height:1.6;
        "
      >
        This code expires in
        <strong>5 minutes</strong>.
      </p>

    </div>

  </div>

</body>
</html>
`,
  };

  return transporter.sendMail(
    mailOptions
  );
};


module.exports = {
  sendAuthOTP,
};