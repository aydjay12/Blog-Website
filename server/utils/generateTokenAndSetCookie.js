import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, rememberMe) => {
  const tokenExpiration = rememberMe ? "7d" : "1d"; // 7 days vs 1 hour

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: tokenExpiration,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 7 days vs 1 hour
  });

  return token;
};
