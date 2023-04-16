#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D texture;
uniform sampler2D dispTexture;

uniform float noise;
uniform float maximum;

uniform bool showDisplacement;
 

vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3333333333333333) * direction;
  color += texture2D(image, uv) * 0.29411764705882354;
  color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
  color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
  return color;
}

void main() {
   vec2 vUV = vTexCoord; 
  /* vUV.x = 1.0 - vUV.x; */ 
  vUV.y = 1.0 - vUV.y; 

   vec2 offset = vec2(noise * 0.7, 0.0);
   offset = vec2(0);
   vec4 disp = texture2D(dispTexture, vUV);


  
   vec2 uvDisp = sin((vUV.st ) + (disp.st * 0.1));
 

  float displace_k  = disp.g * maximum;
  vec2 uv_displaced = vec2(vUV.x + displace_k,
                           vUV.y + displace_k);


  vec4 color;
   /* color = texture2D(texture, vUV); */
  if(showDisplacement) {
    color = texture2D(dispTexture, vUV);
  } else {
    color = texture2D(texture, uv_displaced);
  }
   /* color = texture2D(texture, uvDisp); */
    /* color = vec4(1.0, 0.0, 0.0, 1.0); */

   gl_FragColor = vec4(color);
}
