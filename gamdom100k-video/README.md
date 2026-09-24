# LAUNCH CODE: STEVE (#gamdom100k)

34 s, 1080×1920, 30 fps comedy promo. Animation only, built with Remotion.

## Beats
| Time | Scene | File |
|---|---|---|
| 0:00 | "Enter the launch code." PASSWORD123 → ACCESS DENIED → facepalms | `src/scenes/S1Password.tsx` |
| 0:04 | S‑T‑E‑V‑E slams, chair launches through the ceiling | `S2Steve.tsx` |
| 0:09 | CODE ACCEPTED → ⚠ RULES UPDATED: also tag @gamdom_beekay → "Nooo!" | `S3Rules.tsx` |
| 0:13 | Crash-line lift-off; plane pilot drops coffee; chair drifts by; alien with CASH OUT sign gets the coffee | `S4Flight.tsx` |
| 0:20 | technician.exe not responding; auntie: "Will you PRESS IT!"; CLOSE CALL freeze; line crashes | `S5Cashout.tsx` |
| 0:26 | Rocket lands on #1, flag planted. "Gamdom… to number one." | `S6Podium.tsx` |
| 0:29 | End card: SIGN UP WITH CODE STEVE · gamdom.com · 18+ · Play responsibly. "Code STEVE." | `S7EndCard.tsx` |
| 0:31 | Dripping alien: "…what was the code?" Room: "STEEEVE!" → logo sting | `S8Stinger.tsx` |

## Audio slots (drop files in, re-render; missing files are skipped)
| File | Line |
|---|---|
| `public/vo/commander-launch.mp3` | "Enter the launch code." |
| `public/vo/tech-steve.mp3` | "S! T! E! V! E!" |
| `public/vo/nooo-1..4.mp3` | "Nooo!" ×4 voices, layered |
| `public/vo/auntie.mp3` (or .m4a/.wav) | "Will you PRESS IT!" (your recording) |
| `public/vo/commander-number-one.mp3` | "Gamdom… to number one." |
| `public/vo/commander-code.mp3` | "Code STEVE." |
| `public/vo/alien.mp3` | "…what was the code?" (pitched up in the edit) |
| `public/vo/steve-1..6.mp3` (or .m4a) | "STEEEVE!" takes, staggered over a crowd cheer |
| `public/music/track.mp3` | Music bed (Pixabay), mixed low |
| `public/brand/logo.svg` / `.png` | Optional official logo; otherwise the traced mark is used |

Sound effects in `public/sfx/` are synthesised by `npm run sfx` (no samples, no licensing).

## Commands
```bash
npm install
npm run studio    # preview
npm run voices    # ElevenLabs: checks plan licence first; add --go to generate
npm run render    # out/launch-code-steve.mp4
```
The ElevenLabs key is read from `ELEVENLABS_API_KEY` or `~/.config/gamdom100k/elevenlabs.env`, never from this folder.
