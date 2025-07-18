const forgotPasswordEmailTemplate = (appName, appLogoUrl, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${appName} - Password Reset</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5ed; font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
            <div style="
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                box-shadow: 
                    0 25px 50px rgba(0, 0, 0, 0.15),
                    0 0 0 1px rgba(255, 255, 255, 0.2);
                max-width: 500px;
                width: 100%;
                overflow: hidden;
                position: relative;
            ">
                <!-- Header with branding -->
                <div style="
                    background: linear-gradient(135deg, #FF6F61 0%, #8A2BE2 100%); /* Vibrant gradient from CodeMasti logo */
                    padding: 40px 30px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                ">
                    <!-- Background geometric shapes -->
                    <div style="
                        position: absolute;
                        top: -50px;
                        right: -50px;
                        width: 100px;
                        height: 100px;
                        background: rgba(255, 255, 255, 0.08);
                        border-radius: 50%;
                        transform: rotate(45deg);
                    "></div>
                    <div style="
                        position: absolute;
                        bottom: -30px;
                        left: -30px;
                        width: 60px;
                        height: 60px;
                        background: rgba(255, 255, 255, 0.08);
                        transform: rotate(45deg);
                    "></div>
                    
                    <!-- Logo -->
                    <div style="margin: 0 auto 20px;">
                        <img src="${appLogoUrl}" alt="${appName} Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto;">
                    </div>
                    
                    <h1 style="
                        color: white;
                        margin: 0;
                        font-size: 32px;
                        font-weight: 700;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                        letter-spacing: -0.5px;
                    ">${appName}</h1>
                    <p style="
                        color: rgba(255, 255, 255, 0.85);
                        margin: 8px 0 0;
                        font-size: 16px;
                        font-weight: 300;
                    ">Password Reset Request</p>
                </div>
                
                <!-- Main content -->
                <div style="padding: 40px 30px;">
                    <h2 style="
                        color: #2d3748;
                        margin: 0 0 20px;
                        font-size: 24px;
                        font-weight: 600;
                        text-align: center;
                    ">Your Password Reset Code</h2>
                    
                    <p style="
                        color: #4a5568;
                        font-size: 16px;
                        line-height: 1.6;
                        margin: 0 0 30px;
                        text-align: center;
                    ">
                        We received a request to reset your password for your ${appName} account.
                        Please use the following verification code to proceed:
                    </p>
                    
                    <!-- OTP Container -->
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="
                            background: linear-gradient(145deg, #fefefe, #f1f1f1);
                            border: 2px solid #e0e0e0;
                            border-radius: 16px;
                            padding: 25px 20px;
                            display: inline-block;
                            position: relative;
                            box-shadow: 
                                0 10px 20px rgba(0, 0, 0, 0.08),
                                inset 0 1px 0 rgba(255, 255, 255, 0.7),
                                inset 0 -1px 0 rgba(0, 0, 0, 0.05);
                            transform: perspective(1000px) rotateX(3deg);
                        ">
                            <div style="
                                background: linear-gradient(135deg, #FF6F61, #8A2BE2); /* Matching branding gradient */
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                                font-size: 36px;
                                font-weight: 800;
                                letter-spacing: 8px;
                                font-family: 'Poppins', sans-serif;
                                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
                                margin: 0;
                                line-height: 1;
                            ">${otp}</div>
                        </div>
                    </div>
                    
                    <!-- Warning message -->
                    <div style="
                        background: linear-gradient(135deg, #FFF0E6, #FFECDB);
                        border: 1px solid #FFBE9E;
                        border-radius: 12px;
                        padding: 16px;
                        margin: 25px 0;
                        position: relative;
                        box-shadow: 0 4px 10px rgba(255, 190, 158, 0.2);
                    ">
                        <div style="
                            position: absolute;
                            top: -6px;
                            left: 20px;
                            background: #FF8C6B;
                            color: white;
                            padding: 4px 12px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        ">Important</div>
                        <p style="
                            color: #A0522D;
                            font-size: 14px;
                            margin: 8px 0 0;
                            font-weight: 500;
                        ">
                            ⏰ This verification code is valid for <strong>5 minutes</strong>. Do not share it with anyone.
                        </p>
                    </div>
                    
                    <!-- Instructions -->
                    <div style="
                        background: linear-gradient(135deg, #EBE6FF, #E0D8ED);
                        border: 1px solid #9966CC;
                        border-radius: 12px;
                        padding: 20px;
                        margin: 20px 0;
                        box-shadow: 0 4px 10px rgba(153, 102, 204, 0.2);
                    ">
                        <h3 style="
                            color: #5F3C8C;
                            font-size: 16px;
                            margin: 0 0 12px;
                            font-weight: 600;
                        ">📋 Next Steps:</h3>
                        <ol style="
                            color: #6D4C9E;
                            font-size: 14px;
                            margin: 0;
                            padding-left: 20px;
                            line-height: 1.6;
                        ">
                            <li>Return to the password reset page</li>
                            <li>Enter the 6-digit code above</li>
                            <li>Set your new password</li>
                        </ol>
                    </div>
                    <p style="
                        color: #718096;
                        font-size: 14px;
                        margin: 25px 0 0;
                        text-align: center;
                    ">
                        If you did not request a password reset, please ignore this email.
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="
                    background: linear-gradient(135deg, #f7fafc, #edf2f7);
                    padding: 25px 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                ">
                    <p style="
                        color: #718096;
                        font-size: 13px;
                        margin: 0 0 10px;
                        line-height: 1.5;
                    ">
                        This is an automated email. Please do not reply.<br>The ${appName} Team
                    </p>
                    <div style="
                        background: linear-gradient(135deg, #FF6F61, #8A2BE2);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        font-size: 14px;
                        font-weight: 700;
                        margin: 0;
                    ">
                        © ${new Date().getFullYear()} ${appName}. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const RegisterEmailTemplate = (otp)=>{
    return`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${process.env.APP_NAME} Verification</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5ed; font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center;">
                <div style="
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    box-shadow: 
                        0 25px 50px rgba(0, 0, 0, 0.15),
                        0 0 0 1px rgba(255, 255, 255, 0.2);
                    max-width: 500px;
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                ">
                    <!-- Header with CodeMasti branding -->
                    <div style="
                        background: linear-gradient(135deg, #FF6F61 0%, #8A2BE2 100%); /* Vibrant gradient from CodeMasti logo */
                        padding: 40px 30px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    ">
                        <!-- Background geometric shapes (adjusted opacity) -->
                        <div style="
                            position: absolute;
                            top: -50px;
                            right: -50px;
                            width: 100px;
                            height: 100px;
                            background: rgba(255, 255, 255, 0.08); /* Softer white */
                            border-radius: 50%;
                            transform: rotate(45deg);
                        "></div>
                        <div style="
                            position: absolute;
                            bottom: -30px;
                            left: -30px;
                            width: 60px;
                            height: 60px;
                            background: rgba(255, 255, 255, 0.08); /* Softer white */
                            transform: rotate(45deg);
                        "></div>
                        
                        <!-- CodeMasti Logo -->
                        <div style="margin: 0 auto 20px;">
                            <img src="${process.env.APP_LOGO_URL}" alt="${process.env.APP_NAME} Logo" style="max-width: 120px; height: auto; display: block; margin: 0 auto;">
                        </div>
                        
                        <h1 style="
                            color: white;
                            margin: 0;
                            font-size: 32px;
                            font-weight: 700;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                            letter-spacing: -0.5px;
                        ">${process.env.APP_NAME}</h1>
                        <p style="
                            color: rgba(255, 255, 255, 0.85); /* Slightly darker white for contrast */
                            margin: 8px 0 0;
                            font-size: 16px;
                            font-weight: 300;
                        ">Verification Required</p>
                    </div>
                    
                    <!-- Main content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="
                            color: #2d3748;
                            margin: 0 0 20px;
                            font-size: 24px;
                            font-weight: 600;
                            text-align: center;
                        ">Verify Your Account</h2>
                        
                        <p style="
                            color: #4a5568;
                            font-size: 16px;
                            line-height: 1.6;
                            margin: 0 0 30px;
                            text-align: center;
                        ">
                            Welcome to ${process.env.APP_NAME}! Please use the verification code below to complete your registration:
                        </p>
                        
                        <!-- OTP Container with updated gradient -->
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="
                                background: linear-gradient(145deg, #fefefe, #f1f1f1); /* Softer white background */
                                border: 2px solid #e0e0e0; /* Softer border */
                                border-radius: 16px;
                                padding: 25px 20px;
                                display: inline-block;
                                position: relative;
                                box-shadow: 
                                    0 10px 20px rgba(0, 0, 0, 0.08), /* Lighter shadow */
                                    inset 0 1px 0 rgba(255, 255, 255, 0.7), /* Softer inner highlight */
                                    inset 0 -1px 0 rgba(0, 0, 0, 0.05); /* Softer inner shadow */
                                transform: perspective(1000px) rotateX(3deg); /* Less aggressive 3D */
                            ">
                                <div style="
                                    background: linear-gradient(135deg, #FF6F61, #8A2BE2); /* Matching CodeMasti logo gradient */
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                    font-size: 36px;
                                    font-weight: 800;
                                    letter-spacing: 8px;
                                    font-family: 'Poppins', sans-serif; /* Using Poppins for OTP */
                                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08); /* Softer text shadow */
                                    margin: 0;
                                    line-height: 1;
                                ">${otp}</div>
                            </div>
                        </div>
                        
                        <!-- Warning message (colors adjusted to complement CodeMasti palette) -->
                        <div style="
                            background: linear-gradient(135deg, #FFF0E6, #FFECDB); /* Soft orange-red gradient */
                            border: 1px solid #FFBE9E; /* Muted orange-red border */
                            border-radius: 12px;
                            padding: 16px;
                            margin: 25px 0;
                            position: relative;
                            box-shadow: 0 4px 10px rgba(255, 190, 158, 0.2); /* Lighter shadow */
                        ">
                            <div style="
                                position: absolute;
                                top: -6px;
                                left: 20px;
                                background: #FF8C6B; /* Direct orange-red for the tag */
                                color: white;
                                padding: 4px 12px;
                                border-radius: 12px;
                                font-size: 12px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            ">Important</div>
                            <p style="
                                color: #A0522D; /* Darker orange-brown text */
                                font-size: 14px;
                                margin: 8px 0 0;
                                font-weight: 500;
                            ">
                                ⏰ This verification code expires in <strong>5 minutes</strong>
                            </p>
                        </div>
                        
                        <!-- Instructions (colors adjusted to complement CodeMasti palette) -->
                        <div style="
                            background: linear-gradient(135deg, #EBE6FF, #E0D8ED); /* Soft lavender-purple gradient */
                            border: 1px solid #9966CC; /* Muted purple border */
                            border-radius: 12px;
                            padding: 20px;
                            margin: 20px 0;
                            box-shadow: 0 4px 10px rgba(153, 102, 204, 0.2); /* Lighter shadow */
                        ">
                            <h3 style="
                                color: #5F3C8C; /* Darker purple text */
                                font-size: 16px;
                                margin: 0 0 12px;
                                font-weight: 600;
                            ">📋 Next Steps:</h3>
                            <ol style="
                                color: #6D4C9E; /* Muted purple list text */
                                font-size: 14px;
                                margin: 0;
                                padding-left: 20px;
                                line-height: 1.6;
                            ">
                                <li>Return to the ${process.env.APP_NAME} verification page</li>
                                <li>Enter the 6-digit code above</li>
                                <li>Complete your account setup</li>
                            </ol>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="
                        background: linear-gradient(135deg, #f7fafc, #edf2f7);
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    ">
                        <p style="
                            color: #718096;
                            font-size: 13px;
                            margin: 0 0 10px;
                            line-height: 1.5;
                        ">
                            Didn't request this code? Please ignore this email or contact our support team.
                        </p>
                        <div style="
                            background: linear-gradient(135deg, #FF6F61, #8A2BE2); /* Matching CodeMasti logo gradient */
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            font-size: 14px;
                            font-weight: 700;
                            margin: 0;
                        ">
                            © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `
};



module.exports = { forgotPasswordEmailTemplate,RegisterEmailTemplate};