// 用来测试 glsl-canvas 功能
precision mediump float;

uniform vec2 u_resolution;

void main() {
    float depth = gl_FragCoord.z;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    gl_FragColor = vec4(0.0, 0.0, gl_FragCoord.z , 1.0);
}