#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 uLightPos;
uniform vec3 uCameraPos;

varying highp vec3 vNormal;
varying highp vec2 vTextureCoord;

vec4 pack (float depth) {
    // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
    const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
    const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);

    // fract() 计算参数的小数部分
    vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值

    // 例如 depth = 0.2121
    // depth * bitShift = (0.2121 , 0.2121 * 256 , 0.2121 * 256 * 256 ,0.2121 * 256 * 256 * 256 )
    // 然后取小数部分 = rgbaDepth

    // rgbaDepth.gbaa * bitMask = (1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0) * ()


    rgbaDepth -= rgbaDepth.gbaa * bitMask; // Cut off the value which do not fit in 8 bits
    return rgbaDepth;
}

void main(){
   // gl_FragCoord:片元的坐标

  //gl_FragColor = vec4( 1.0, 0.0, 0.0, gl_FragCoord.z);
  gl_FragColor = pack(gl_FragCoord.z);
}