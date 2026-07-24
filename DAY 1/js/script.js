/* ===========================================
   Portfolio JavaScript
   =========================================== */

   document.addEventListener("DOMContentLoaded", () => {

    /* ===========================================
       Sticky Header
    =========================================== */

    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.classList.add("sticky");

        } else {

            header.classList.remove("sticky");

        }

    });

    /* ===========================================
       Active Navigation
    =========================================== */

    const navLinks = document.querySelectorAll("nav a");

    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 120;

            const height = section.offsetHeight;

            if (scrollY >= top && scrollY < top + height) {

                current = section.id;

            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {

                link.classList.add("active");

            }

        });

    });

    /* ===========================================
       Smooth Scroll
    =========================================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth"

            });

        });

    });

    /* ===========================================
       Back To Top
    =========================================== */

    const backTop = document.querySelector(".back-to-top");

    if (backTop) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 500) {

                backTop.classList.add("show");

            } else {

                backTop.classList.remove("show");

            }

        });

    }

    /* ===========================================
       Download Resume
    =========================================== */

    const resumeBtn = document.querySelector("#downloadResume");

    if (resumeBtn) {

        resumeBtn.addEventListener("click", (e) => {

            e.preventDefault();

            const link = document.createElement("a");

            link.href = "resume.pdf";

            link.download = "Shubhdeep_Resume.pdf";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

        });

    }

    /* ===========================================
       Contact Form
    =========================================== */

    const form = document.getElementById("contactForm");

    if (form) {

        form.addEventListener("submit", function (e) {

            e.preventDefault();

            const name = document.getElementById("name").value.trim();

            const email = document.getElementById("email").value.trim();

            const subject = document.getElementById("subject").value.trim();

            const message = document.getElementById("message").value.trim();

            if (!name || !email || !subject || !message) {

                alert("Please fill all fields.");

                return;

            }

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {

                alert("Please enter a valid email.");

                return;

            }

            const button = form.querySelector("button");

            button.disabled = true;

            button.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

            setTimeout(() => {

                alert("Message sent successfully!");

                form.reset();

                button.disabled = false;

                button.innerHTML =
                    '<i class="fa-solid fa-paper-plane"></i> Send Message';

            }, 1500);

        });

    }

    /* ===========================================
       Reveal Animation
    =========================================== */

    const reveals = document.querySelectorAll(

        ".skill-card,.project-card,.education-card,.timeline-item,.contact-card"

    );

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                }

            });

        },

        {

            threshold: .15

        }

    );

    reveals.forEach(item => {

        item.classList.add("hidden");

        observer.observe(item);

    });

    /* ===========================================
       Footer Year
    =========================================== */

    const year = document.querySelector("#year");

    if (year) {

        year.textContent = new Date().getFullYear();

    }

});