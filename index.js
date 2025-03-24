document.getElementById('authForm').addEventListener('submit', function(event) {
    event.preventDefault(); // предотвращаем отправку формы

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Здесь обычно происходила бы проверка данных на сервере.

    if (username && password) {
        // Если данные корректны, перенаправляем на другой сайт.
        window.location.href = "http://127.0.0.1:5500/indexx.html"; // Замените на нужный вам URL
    } else {
        alert("Пожалуйста, заполните все поля.");
    }
});