let pageName = localStorage.getItem("lastPage") ?? "./homePage.html";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      const url = e.target.getAttribute("href");
      localStorage.setItem("lastPage", url);
      changeContent(url);
    });
  });
  changeContent(pageName);
});

function changeContent(url) {
  $("#pageContent").load(url, function () {
    checkLoggedInStatus();
      if (url === "./login.html" && localStorage.getItem("userId")) {
        $("#pageContent").load("./loggedIn.html", function () {
          console.log("LoggedIn loaded successfully.");
          
        });
      } else if (url === "./blogs.html") {
        insideBlogChangeContent("./allPosts.html");
    }
  });
}

function insideBlogChangeContent(url) {
  $("#inside-blog-container").load(url, function () {
    if (pageName) {
      checkLoggedInStatus();
    } else {
      console.error("Failed to extract page name from URL.");
    }
  });
}

function isValidUserName(newUserName) {
  const regUserName = /^[a-zA-Z0-9]{6,15}$/;
  return regUserName.test(newUserName);
}

function isValidPassword(password) {
  const regex = new RegExp(
    "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
  );

  return regex.test(password);
}

function isValidEmail(email) {
  const regEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
  return regEmail.test(email);
}

function isValidForm(event) {
  const username = document.getElementById("register-username");
  const password = document.getElementById("register-password");
  const confirmPassword = document.getElementById("repeat-password");
  const email = document.getElementById("email");
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match");
  } else if (!isValidUserName(username.value)) {
    alert(
      "Your username must be 5-16 characters long and can only contain letters and numbers"
    );
  } else if (!isValidPassword(password.value)) {
    alert(
      "Your password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one digit"
    );
  } else if (!isValidEmail(email.value)) {
    alert("Invalid email address");
  } else {
    return true;
  }
}

function toggleRecoverPassword() {
  const recoverPasswordEmail = document.getElementById(
    "recover-password-email"
  );
  if (
    recoverPasswordEmail.style.display === "none" ||
    recoverPasswordEmail.style.display === ""
  ) {
    recoverPasswordEmail.style.display = "block";
  } else {
    recoverPasswordEmail.style.display = "none";
  }
}

function showTooltip(id) {
  const tooltip = document.getElementById(`tooltip-${id}`);
  tooltip.style.display = "block";
}

function hideTooltip(id) {
  const tooltip = document.getElementById(`tooltip-${id}`);
  tooltip.style.display = "none";
}
function showLoginButton() {
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("login-btn").style.display = "block";
}

function onRegisterHandle(event) {
  event.preventDefault(); 

  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const email = document.getElementById("email").value;

  if (!isValidForm(event)) {
    return;
  }
  fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      email,
    }),
  })
    .then((response) => {
      if (response.ok) {
        alert("Registration successful!");
        changeContent('./login.html');
      } else {
        return response.text().then((errorMessage) => {
          console.error("Registration failed:", errorMessage);
          alert(`Registration failed: ${errorMessage}`); 
        });
      }
    })
    .catch((error) => {
      console.error("Error during registration:", error);
      alert("Registration failed!"); 
    });
  changeContent("./homePage.html");
}

async function onLoginHandle(event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const user = await login(username, password);

  localStorage.setItem("userId", user.userId);
  localStorage.setItem("username", user.username);
  showUserLoggedIn(username);
  changeContent('./homePage.html');
}

function checkLoggedInStatus() {
  const userId = localStorage.getItem("username");

  if (userId) {
    showUserLoggedIn(userId);
  } else {
    showLoginButton();
  }
}

async function sendPassword(email) {
  try {
    const response = await fetch("http://localhost:3000/auth/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        alert("Password recovery email sent successfully.", "success");
      } else {
        console.error(`Password recovery failed. ${result.error}`, "error");
      }
    } else {
      const errorText = await response.text();
      console.error(`Handle non-200 HTTP responses: Password recovery failed. ${errorText}`, "error");
    }
  } catch (error) {
    console.error("Password recovery failed:", error);
  }
}

async function recoverPassword(event) {
  event.preventDefault();
  const email = document.getElementById("recover-email").value;
  sendPassword(email);
  document.getElementById("recover-email").value = "";
  toggleRecoverPassword();
}

async function login(username, password) {
  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        alert("Login successful!");
        changeContent("homePage.html");
        return result.user;
      } else {
        console.error("Login failed:", result.error);
        alert(`Login failed. ${result.error}`);
      }
    } else {
      const errorText = await response.text();
      console.error("Login failed:", response.status, errorText);
      alert(`Login failed. ${errorText}`);
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert(`Login failed. ${result.error}`);
  }
}

function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.setItem("lastPage","./homePage.html");
  alert('user logged out successfully!');
  showLoginButton();
}

function onLoginButtonClick() {
  onLoginHandle();
}

function recoverPasswordByUsername(event) {
  event.preventDefault();

  const username = document.getElementById("recover-username").value;
  fetch("http://localhost:3000/auth/recover-password-username", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Password recovery email sent successfully.");
      } else {
        alert(
          "Password recovery failed. Please check your username and try again."
        );
      }
    })
    .catch((error) => {
      console.error("Error during password recovery:", error);
      alert("Password recovery failed. Please try again later.");
    });
}

function toggleRecoverPasswordByUsername() {
  const recoverPasswordUsernameForm = document.getElementById(
    "recover-password-username"
  );
  recoverPasswordUsernameForm.style.display =
    recoverPasswordUsernameForm.style.display === "none" ? "block" : "none";
}


$(document).ready(function () {
  $(document).off("click", "#navbar a, .content-link");

  //   $(document).on("click", "#navbar a, .content-link", function (e) {
  //     e.preventDefault();
  //     var url = $(this).attr("href");
  //     changeContent(url);
  //   });

  const path = window.location.pathname;

  if (path === "/index.html") {
    $("#loginForm").off("submit");

    $("#loginForm").on("submit", function (event) {
      event.preventDefault();
      const username = $("#login-username").val();
      const password = $("#login-password").val();
      login(username, password);
    });
  }
});

function showUserLoggedIn(username) {
  const loginButton = document.getElementById("main-login-button");
  const userInfo = document.getElementById("user-info");
  const logoutButton = document.getElementById("logout-button");

  if (loginButton && userInfo && logoutButton) {
    loginButton.style.display = "none";
    userInfo.style.display = "inline";
    logoutButton.style.display = "inline";
    userInfo.innerHTML = `Logged in as:</br> ${username}`;
  } else {
    console.error("One or more elements not found.");
  }
}
function showLoginButton() {
  const loginButton = document.getElementById("main-login-button");
  const userInfo = document.getElementById("user-info");
  const logoutButton = document.getElementById("logout-button");

  loginButton.style.display = "inline";
  userInfo.style.display = "none";
  logoutButton.style.display = "none";
}

function init() {
  fetch(`http://localhost:3000/page/${pageName}`)
    .then((data) => data.json())
    .then((response) => console.log(response));
}

function uploadPost() {
  const title = document.getElementById("title").value;
  const ingredients = document.getElementById("ingredients").value;
  const recipe = document.getElementById("recipe").value;
  const checkboxMarks = Array.from(
    document.querySelectorAll('input[name="checkboxMarks"]:checked')
  ).map((checkbox) => checkbox.value);
  const username = localStorage.getItem("username");
  const timestamp = new Date().toISOString();
  const postData = {
    username,
    title,
    ingredients,
    recipe,
    checkboxMarks,
    timestamp,
  };
  fetch("http://localhost:3000/blog/uploadPost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      alert("Post uploaded successfully!");
      checkLoggedInStatus();
      return response.json();
    })
    .then((data) => {
      console.log("Received Data:", JSON.stringify(data));
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

function updatePost() {
  const title = document.getElementById("title").value;
  const postId = document.getElementById("postId").value;
  const ingredients = document.getElementById("ingredients").value;
  const recipe = document.getElementById("recipe").value;
  const checkboxMarks = Array.from(
    document.querySelectorAll('input[name="checkboxMarks"]:checked')
  ).map((checkbox) => checkbox.value);
  const username = localStorage.getItem("username");
  const timestamp = new Date().toISOString();
  const postData = {
    title,
    ingredients,
    recipe,
    username,
    timestamp,
    checkboxMarks
  };
  fetch("http://localhost:3000/blog/posts/" + postId, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(postData),
})
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    if (data.error) {
      throw new Error(`Server error: ${data.error}`);
    } else {
      alert("Post updated successfully!");
    }
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
}

