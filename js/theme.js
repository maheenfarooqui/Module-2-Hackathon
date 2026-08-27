document.addEventListener("DOMContentLoaded", () => {

  const themeToggle = document.createElement("button");

  themeToggle.type = "button";
  themeToggle.id = "theme-toggle";
  themeToggle.className = "theme-toggle";

  const themeIcon = document.createElement("i");
  themeIcon.className = "fa-solid fa-sun";

  themeToggle.appendChild(themeIcon);
  document.body.appendChild(themeToggle);


  function updateThemeButton(isLightMode) {

    if (isLightMode) {
      themeIcon.className = "fa-solid fa-moon";
      themeToggle.setAttribute(
        "aria-label",
        "Switch to dark mode"
      );
      themeToggle.setAttribute(
        "title",
        "Switch to dark mode"
      );

    } else {
      themeIcon.className = "fa-solid fa-sun";
      themeToggle.setAttribute(
        "aria-label",
        "Switch to light mode"
      );
      themeToggle.setAttribute(
        "title",
        "Switch to light mode"
      );
    }
  }


  // Saved theme check
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    updateThemeButton(true);
  } else {
    document.body.classList.remove("light-mode");
    updateThemeButton(false);
  }


  // Toggle
  themeToggle.addEventListener("click", () => {

    const isLightMode =
      document.body.classList.toggle("light-mode");

    localStorage.setItem(
      "theme",
      isLightMode ? "light" : "dark"
    );

    updateThemeButton(isLightMode);
  });

});