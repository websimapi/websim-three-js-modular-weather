import GUI from 'lil-gui';

export function createGUI(weather) {
    const gui = new GUI();

    gui.add(weather.params, 'enabled').name('Enable Weather').onChange(() => weather.updateParams());
    gui.add(weather.params, 'size', 0.01, 1, 0.01).name('Rain Size').onChange(() => weather.updateParams());
    gui.add(weather.params, 'speed', 0.1, 20, 0.1).name('Rain Speed').onChange(() => weather.updateParams());
    gui.add(weather.params, 'wind', -10, 10, 0.1).name('Wind Strength').onChange(() => weather.updateParams());
    gui.addColor(weather.params, 'color').name('Rain Color').onChange(() => weather.updateParams());
    
    return gui;
}