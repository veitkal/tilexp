// From example in Book of Shaders
// https://thebookofshaders.com/11/


#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_xscale; 
uniform float u_yscale;
uniform float u_xspeed; 
uniform float u_yspeed;

uniform float u_smooth;
uniform float u_threshold;

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 smoothed = f*f*(3.0-2.0*f);
    vec2 stepped = step(st, smoothed);

    vec2 u = mix(stepped, smoothed, u_smooth);
    /* vec2 u = f*f*(3.0-2.0*f); */
    
     /* u = smoothstep(0.,1.,f); */
     /* vec2 stepped = step(st, u); */

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
   vec2 vUV = vTexCoord; 
  vUV.y = 1.0 - vUV.y; 


  /* vec4 color = vec4(1.0, 0.0, 1.2, 1.0); */
  
  /* gl_FragColor = vec4(color); */

      vec2 st = gl_FragCoord.xy/u_resolution.xy;
      st.s+= u_time * (u_xspeed * 0.01);
      st.t+= u_time * (u_yspeed * 0.01);

      // Scale the coordinate system to see
    // some noise in action
    vec2 pos = vec2(st.s * u_xscale, st.t * u_yscale);

    // Use the noise function
    float n = noise(pos);
    float threshed = step(0.5, n);
    float clr = mix(n, threshed, u_threshold);

    gl_FragColor = vec4(vec3(clr), 1.0);
}
