const sliders = document.body.querySelectorAll<HTMLInputElement>(
    'input[type="range"].slider'
);

for (const slider of sliders) {
    const emitValueEvent = () => {
        slider.dispatchEvent(
            new CustomEvent("value", {
                detail: slider.value,
                bubbles: false,
                cancelable: false
            })
        );
    };

    slider.addEventListener("input", emitValueEvent);
    slider.addEventListener("value", (event: Event) => {
        const { detail } = event as CustomEvent;

        const value = Number(detail) || 0;
        const min = Number(slider.min) || 0;
        const max = Number(slider.max) || 100;

        slider.value = String(value);
        slider.style.setProperty(
            "--progress",
            `${((value - min) / (max - min)) * 100}%`
        );
    });
    emitValueEvent();
}
