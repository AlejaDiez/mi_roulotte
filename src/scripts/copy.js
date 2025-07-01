document.addEventListener("copy", (event) => {
    event.preventDefault();
    event.clipboardData.setData(
        "text/plain",
        `${document.getSelection()}\n\nTexto copiado de ${window.location.href}`,
    );
});
