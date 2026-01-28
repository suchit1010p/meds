import validator from "validator";

const disposableDomains = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "yopmail.com",
  "trashmail.com",
];


const validateRegister = (req, res, next) => {
  const { name, email, phone, password } = req.body || {};

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  const emailDomain = email.split("@")[1];
  if (disposableDomains.includes(emailDomain)) {
    return res.status(400).json({
      success: false,
      message: "Disposable email addresses are not allowed",
    });
  }

  if (!validator.isMobilePhone(phone, "en-IN")) {
    return res.status(400).json({
      success: false,
      message: "Invalid Indian phone number",
    });
  }

  if (!validator.isStrongPassword(password, { minLength: 6 })) {
    return res.status(400).json({
      success: false,
      message: "Password is too weak",
    });
  }

  next();
};

export default validateRegister;
