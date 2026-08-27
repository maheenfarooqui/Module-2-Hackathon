import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
var supabase = createClient(supbaseUrl, supbaseKey);
const signUpBtn = document.getElementById("sinUp");
const logInBtn = document.getElementById("logIn");
const lgoinWithGoogle = document.getElementById("logInWithGoogle");

if (lgoinWithGoogle) {
  lgoinWithGoogle.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://127.0.0.1:5501/dashboard.html",
        },
      });
      if (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  });
}

if (signUpBtn) {
  signUpBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const userP = document.getElementById("userPass").value.trim();
    const userE = document.getElementById("userEmail").value.trim();
    const userN = document.getElementById("userName").value.trim();

    if (!userE || !userP) {
      Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please enter both your email and password!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userE,
        password: userP,
        options: {
          data: {
            full_name: userN,
            email: userE,
            role: "user",
          },
        },
      });

      if (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          text: error.message,
        });
        return;
      }

      console.log(data);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Account Created Successfully! Redirecting...",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "dashboard.html";
      });
    } catch (error) {
      console.log(error.message);
    }
  });
}

if (logInBtn) {
  logInBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const userP = document.getElementById("userP").value.trim();
    const userE = document.getElementById("userE").value.trim();

    if (!userE || !userP) {
      Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please enter both your email and password!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userE,
        password: userP,
      });

      if (error) {
        console.log(error);

        // Agar error invalid credentials ka hy (yaani account nahi hy ya password ghalat hy)
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          Swal.fire({
            icon: "error",
            title: "Account Not Found?",
            html: `Incorrect credentials or account doesn't exist.<br><br>
             Don't have an account? <a href="singUp.html" style="color: #22d3ee; font-weight: bold; text-decoration: none;">Create an Account</a>`,
            confirmButtonColor: "#22d3ee",
            confirmButtonText: "Try Again",
          });
        } else {
          // Kisi aur kism ke error ke liye normal alert
          Swal.fire({
            icon: "error",
            title: "LogIn Failed",
            text: error.message,
          });
        }
        return;
      }

      console.log(data);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "LogIn Successfully! Redirecting...",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "dashboard.html";
      });
    } catch (error) {
      console.log(error.message);
    }
  });
}

// const { data } = supabase.auth.onAuthStateChange((event, session) => {
//   console.log(event, session);

//   const currentPage = window.location.pathname;

//   if (event === "INITIAL_SESSION") {
//     if (!session && !currentPage.includes("singUp.html")) {
//       Swal.fire({
//         icon: "error",
//         title: "Account Not Found",
//         html: `<a href="singUp.html" style="color: #22d3ee; font-weight: bold; text-decoration: none;">Create an Account</a>`,
//         confirmButtonColor: "#22d3ee",
//         confirmButtonText: "Try Again",
//       }).then(() => {
//         // window.location.href = "singUp.html";
//       });
//     }
//   } else if (event === "SIGNED_IN") {
//     Swal.fire({
//       icon: "success",
//       title: "Success",
//       text: "LogIn Successfully! Redirecting...",
//       timer: 2000,
//       showConfirmButton: false,
//     }).then(() => {
//       // window.location.href = "dashboard.html";
//     });
//   }
// });

// animation

// for index file
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(TextPlugin, ScrollTrigger);

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from("#authHeader, #authLogo", {
    yPercent: -100,
    duration: 0.8,
  });
});

// =========================================================
// FORGOT PASSWORD LOGIC (FIXED URL)
// =========================================================
const forgotPassBtn = document.getElementById("forgotPasswordBtn");

if (forgotPassBtn) {
  forgotPassBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const { value: email } = await Swal.fire({
      title: "Reset Password",
      input: "email",
      inputLabel: "Enter your registered email address",
      inputPlaceholder: "example@mail.com",
      showCancelButton: true,
      confirmButtonText: "Send Link",
      confirmButtonColor: "#22d3ee",
      cancelButtonColor: "#64748b",
      inputValidator: (value) => {
        if (!value) return "Email is required!";
      },
    });

    if (email) {
      try {
        // Current window location ke hisab se dynamically absolute URL generate karein
        const redirectUrl = `${window.location.origin}/reset-password.html`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });

        if (error) {
          Swal.fire({
            icon: "error",
            title: "Invalid URL or Email Error",
            text: error.message,
            confirmButtonColor: "#22d3ee",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Link Sent!",
          text: "Password reset link has been sent to your email.",
          confirmButtonColor: "#22d3ee",
        });
      } catch (err) {
        console.error("Forgot Password Error:", err.message);
      }
    }
  });
}
