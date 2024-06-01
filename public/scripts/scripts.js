document.addEventListener("DOMContentLoaded", function () {
  // parallax
  const parallaxElements = document.querySelectorAll(".parallax > *");
  function handleScroll() {
    const scrollTop = window.scrollY;
    parallaxElements.forEach((element) => {
      const translateY = parseFloat(
        getComputedStyle(element).getPropertyValue("--translate-y")
      );
      const translateX = parseFloat(
        getComputedStyle(element).getPropertyValue("--translate-x")
      );
      const scaleFactor = parseFloat(
        getComputedStyle(element).getPropertyValue("--scale-factor")
      );
      if (!isNaN(translateY)) {
        function animate() {
          const transformValue = `translateY(calc(${translateY}px * ${scrollTop})) scale(calc(1 + ${
            scrollTop * scaleFactor
          })) translateX(calc(${translateX}px * ${scrollTop}))`;
          element.style.transform = transformValue;
          requestAnimationFrame(animate);
        }
        animate();
      }
    });
  }
  window.addEventListener("scroll", handleScroll);

  // blog
  const blogLinks = document.querySelectorAll("#blogs .container nav ul li a");
  blogLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      blogLinks.forEach((link_) => {
        link_.parentElement.classList.remove("active");
      });
      link.parentElement.classList.add("active");
      var tag = link.getAttribute("tag");
      let blog = document.querySelector(`.${tag}`);
      blog.classList.add("active");
      if (tag == "tech") {
        document.querySelector(".design").classList.remove("active");
        document.querySelector(".games").classList.remove("active");
        if (!document.querySelector(".games").classList.contains("left"))
          document.querySelector(".games").classList.add("right");
      } else if (tag == "games") {
        document.querySelector(".games").classList.remove("right");
        document.querySelector(".games").classList.remove("left");
        document.querySelector(".tech").classList.remove("active");
        document.querySelector(".design").classList.remove("active");
      } else if (tag == "design") {
        document.querySelector(".tech").classList.remove("active");
        document.querySelector(".games").classList.remove("active");
        if (!document.querySelector(".games").classList.contains("right"))
          document.querySelector(".games").classList.add("left");
      }
    });
  });

  // login
  const sign_up = document.querySelector("#login-msg ul li a");
  const sign_in = document.querySelector("#register-msg ul li a");
  const log_form = document.querySelector("#login-form");
  const reg_form = document.querySelector("#register-form");
  const log_msg = document.querySelector("#login-msg");
  const reg_msg = document.querySelector("#register-msg");
  sign_up.addEventListener("click", function (event) {
    event.preventDefault();
    log_form.classList.remove("active");
    reg_form.classList.add("active");
    log_msg.classList.remove("active");
    reg_msg.classList.add("active");
  });
  sign_in.addEventListener("click", function (event) {
    event.preventDefault();
    reg_form.classList.remove("active");
    log_form.classList.add("active");
    reg_msg.classList.remove("active");
    log_msg.classList.add("active");
  });

  // navbar
  let navLinks = document.querySelectorAll("#navbar a");
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll("section").forEach((sec) => {
    navObserver.observe(sec);
  });

  // animation
  const animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log(entry.target);
          entry.target.classList.add("animate");
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll("section").forEach((sec) => {
    animationObserver.observe(sec);
  });
  
  // Error Handelling
  const x = document.querySelector("#login #error .bx-x");
  x.addEventListener("click", () => {
    x.parentNode.style.opacity = 0
    document.querySelector("#login .backdrop").style.opacity = 0
    setTimeout(()=>{
      document.querySelector("#login .backdrop").style.display = "none";
    }, 1000); 
  });
});
