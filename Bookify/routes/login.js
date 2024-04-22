document.addEventListener("DOMContentLoaded", function () {
    const wrapper = document.querySelector('.wrapper');
    const registerLink = document.querySelector('.register-link');
    const loginLink = document.querySelector('.login-link');
    const signup = document.getElementById('btn');

    function click() {
        wrapper.classList.add('active');
    }

    registerLink.onclick = click;

    function click2() {
        wrapper.classList.remove('active');
    }
    loginLink.onclick = click2;
});