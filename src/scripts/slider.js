const updateProgress = (slider) => {
    const value = slider.value;
    const min = slider.min || 0;
    const max = slider.max || 100;
    const percent = ((value - min) / (max - min)) * 100;

    slider.style.setProperty("--progress", `${percent}%`);
};
const sliders = document.querySelectorAll('input[type="range"].slider');

for (const slider of sliders) {
    slider.addEventListener("input", () => updateProgress(slider));
    updateProgress(slider);
}
