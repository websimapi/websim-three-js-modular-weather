import GUI from 'lil-gui';

export function createGUI(weatherEffect) {
    const gui = new GUI();

    gui.add(weatherEffect.params, 'enabled').name('Enable Weather').onChange(() => weatherEffect.updateParams());
    gui.add(weatherEffect.params, 'size', 0.01, 1, 0.01).name('Rain Size').onChange(() => weatherEffect.updateParams());
    gui.add(weatherEffect.params, 'speed', 0.1, 20, 0.1).name('Rain Speed').onChange(() => weatherEffect.updateParams());
    gui.add(weatherEffect.params, 'wind', -10, 10, 0.1).name('Wind Strength').onChange(() => weatherEffect.updateParams());
    gui.addColor(weatherEffect.params, 'color').name('Rain Color').onChange(() => weatherEffect.updateParams());
    
    return gui;
}

