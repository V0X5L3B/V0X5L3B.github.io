# Vendored libraries (self-hosted; the site's CSP only allows scripts from this site)

| Library | Version | Source | License |
|---|---|---|---|
| GSAP (gsap, ScrollTrigger, SplitText) | 3.15.0 | https://github.com/greensock/GSAP (`dist/`, unmodified) | GreenSock Standard "no charge" license, https://gsap.com/standard-license (notices kept in each file) |
| Lenis | 1.3.27 | https://github.com/darkroomengineering/lenis (`packages/core/src`, compiled to browser ES modules with `tsc`; the only source change is the version string replacing a JSON import) | MIT (`lenis/LICENSE`) |

React Bits (https://github.com/DavidHDev/react-bits) is React-only and the site has no build step, so it is not included; a few of its effects are re-created in plain JS in `assets/js/fx.js`.
