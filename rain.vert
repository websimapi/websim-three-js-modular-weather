uniform float uTime;
uniform float uSize;
uniform float uSpeed;
uniform float uWind;
uniform float uHeight;

attribute float aRandom;

void main() {
    vec3 pos = position;

    // Animate rain falling
    pos.y -= mod(uTime * uSpeed * (0.5 + aRandom * 0.5), uHeight);

    // Apply wind
    pos.x += uTime * uWind * (0.5 + aRandom * 0.5);

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    
    // Make particles smaller further away
    gl_PointSize = uSize * 300.0;
    gl_PointSize *= (1.0 / -viewPosition.z);
}