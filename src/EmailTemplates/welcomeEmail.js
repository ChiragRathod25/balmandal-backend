const websiteurl = process.env.VITE_BASE_URL;

const welcomeEmail = (username = "") => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Welcome to APC Bal Mandal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* General Reset */
    body, html {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333;
    }
    
    /* Container */
    .container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    /* Main table */
    .main-table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      border-radius: 8px;
      overflow: hidden;
    }

    /* Header */
    .header {
      padding: 20px;
      text-align: center;
      background-color: white;
    }

    .logo {
      width: 100px;
      margin-bottom: 20px;
    }

    /* Content */
    .content {
      padding: 0 5px;
      text-align: center;
    }

    /* Button */
    .btn {
      display: inline-block;
      padding: 12px 16px;
      background-color: #C30E59;
      color: white !important;
      text-decoration: none !important;
      font-weight: bold;
      border-radius: 6px;
      margin-top: 15px;
      font-size: 14px;
      mso-padding-alt: 12px 16px;
      text-align: center;
      border: 0;
    }

    /* Remove default link styling */
    a {
      text-decoration: none !important;
    }

    a.btn {
      color: white !important;
    }

    /* Feature Sections */
    .features-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 12px;
      margin: 15px 0;
    }

    .feature-box {
      background: #ffffff;
      padding: 15px;
      border-radius: 6px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
      text-align: center;
    }

    .feature-box h3 {
      font-size: 16px;
      margin-bottom: 5px;
      color: #333;
    }

    .feature-box p {
      font-size: 14px;
      color: #555;
      margin-bottom: 15px;
    }

    /* Footer */
    .footer {
      padding: 15px;
      background: #eee;
      text-align: center;
      font-size: 14px;
      color: #777;
    }

    .social-icons {
      margin: 10px 0;
    }

    .social-icon {
      display: inline-block;
      margin: 0 5px;
      width: 24px;
      height: 24px;
    }

    .social-btn {
      display: inline-block;
      margin: 5px;
      color: inherit !important;
      text-decoration: none !important;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      body, html {
        background-color: #121212 !important;
        color: #ffffff !important;
      }
      .container {
        background-color: #1e1e1e !important;
      }
      .header, .content {
        background-color: #1e1e1e !important;
        color: white !important;
      }
      .feature-box {
        background-color: #2a2a2a !important;
        color: white !important;
        border: 1px solid #444 !important;
      }
      .feature-box h3 {
        color: #ccc !important;
      }
      .feature-box p {
        color: #aaa !important;
      }
      .footer {
        background-color: #1b1b1b !important;
        color: #aaa !important;
      }
      .btn {
        background-color: #F2AE66 !important;
        color: #121212 !important;
      }
    }

    /* Mobile Styles */
    @media screen and (max-width: 600px) {
      .features-table td {
        display: block;
        width: 100%;
        margin-bottom: 12px;
      }
      
      .container {
        width: 95% !important;
        margin: 10px auto !important;
      }
      
      .feature-box {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <table class="main-table" role="presentation">
      <tr>
        <td class="header">
          <!--img src="${websiteurl}/logo.png" alt="APC Bal Mandal Logo" class="logo" -->
          <h2>Welcome, ${username}! 🎉</h2>
          <p>We are excited to have you as a part of the <strong>APC Bal Mandal</strong> 🎉</p>
          <p>Let's get started! Explore your dashboard to manage profiles, achievements, and more.</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <table class="features-table" role="presentation">
            <tr>
              <td width="50%">
                <div class="feature-box">
                  <h3>📌 Balak Profile</h3>
                  <p>Manage and view Balak details to better understand and guide their journey.</p>
                  <!-- Button with inline styles for Gmail compatibility -->
                  <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                    <tr>
                      <td align="center" style="border-radius: 6px; background-color: #C30E59;" bgcolor="#C30E59">
                        <a href="${websiteurl}/profile" target="_blank" style="border: 1px solid #C30E59; border-radius: 6px; color: white; display: inline-block; font-size: 14px; font-weight: bold; padding: 12px 16px; text-decoration: none; text-transform: none; background-color: #C30E59;">View Profile</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
              <td width="50%">
                <div class="feature-box">
                  <h3>👨‍👩‍👧‍👦 Parental Info</h3>
                  <p>Keep track of parents' contact details for seamless communication and support.</p>
                  <!-- Button with inline styles for Gmail compatibility -->
                  <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                    <tr>
                      <td align="center" style="border-radius: 6px; background-color: #C30E59;" bgcolor="#C30E59">
                        <a href="${websiteurl}/parent" target="_blank" style="border: 1px solid #C30E59; border-radius: 6px; color: white; display: inline-block; font-size: 14px; font-weight: bold; padding: 12px 16px; text-decoration: none; text-transform: none; background-color: #C30E59;">View Parents</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%">
                <div class="feature-box">
                  <h3>🏆 Achievements</h3>
                  <p>Celebrate and showcase the skills, awards, and spiritual growth of Balak.</p>
                  <!-- Button with inline styles for Gmail compatibility -->
                  <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                    <tr>
                      <td align="center" style="border-radius: 6px; background-color: #C30E59;" bgcolor="#C30E59">
                        <a href="${websiteurl}/achievement" target="_blank" style="border: 1px solid #C30E59; border-radius: 6px; color: white; display: inline-block; font-size: 14px; font-weight: bold; padding: 12px 16px; text-decoration: none; text-transform: none; background-color: #C30E59;">View Achievements</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
              <td width="50%">
                <div class="feature-box">
                  <h3>🎭 Talents</h3>
                  <p>Recognize and showcase the unique skills and talents of Balak.</p>
                  <!-- Button with inline styles for Gmail compatibility -->
                  <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                    <tr>
                      <td align="center" style="border-radius: 6px; background-color: #C30E59;" bgcolor="#C30E59">
                        <a href="${websiteurl}/talent" target="_blank" style="border: 1px solid #C30E59; border-radius: 6px; color: white; display: inline-block; font-size: 14px; font-weight: bold; padding: 12px 16px; text-decoration: none; text-transform: none; background-color: #C30E59;">View Talents</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>Stay connected with us:</p>
          <div class="social-icons">
            <a href="${websiteurl}" style="text-decoration: none; color: inherit;"><img src="https://img.icons8.com/ios-filled/50/000000/facebook.png" alt="Facebook" class="social-icon"></a>
            <a href="${websiteurl}" style="text-decoration: none; color: inherit;"><img src="https://img.icons8.com/ios-filled/50/000000/instagram.png" alt="Instagram" class="social-icon"></a>
            <a href="${websiteurl}" style="text-decoration: none; color: inherit;"><img src="https://img.icons8.com/ios-filled/50/000000/twitter.png" alt="Twitter" class="social-icon"></a>
            <a href="${websiteurl}" class="social-btn whatsapp" style="text-decoration: none; color: inherit;">
              <img src="https://img.icons8.com/ios-filled/50/25D366/whatsapp.png" alt="WhatsApp" class="social-icon">
            </a>
            <a href="${websiteurl}" class="social-btn website" style="text-decoration: none; color: inherit;">
              <img src="https://img.icons8.com/ios-filled/50/0073e6/domain.png" alt="Website" class="social-icon">
            </a>
          </div>
          <p>&copy; 2025 APC Bal Mandal | All Rights Reserved</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
};

export default welcomeEmail;