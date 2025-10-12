import { BASE_URL } from "../../constants/config";

export const registerUser = async (body) => {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, message: `${body.name} registered successfully` };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
