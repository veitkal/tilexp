

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;
uniform sampler2D texture_src;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
   vec2 vUV = vTexCoord; 
  vUV.y = 1.0 - vUV.y; 
  vec4 color;

  vec4 feedback_color=texture2D(texture, vUV+0.5);

  color = texture2D(texture_src, vUV);
      color=mix(color,feedback_color,0.5);

   gl_FragColor = vec4(color);
}
