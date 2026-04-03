# Style Check Skill
Use `STYLE_SPEC.md` as the authoritative reference for all style rules.

Review all HTML files in `source files/` against STYLE_SPEC.md for:
1. Color theme — no blue/default themes; only the green palette defined in STYLE_SPEC.md §1
2. Footer — fixed, bottom 0, GoaT hyperlink, exact CSS from STYLE_SPEC.md §3
3. Font sizes — visualization files use `2.0vw` page title, `Arial, sans-serif`; see STYLE_SPEC.md §2
4. Chart notes — `.chartNote` immediately follows chart, no extra top margin; see STYLE_SPEC.md §4
5. Required `<head>` tags — config.js, utils.js, services.js present; see STYLE_SPEC.md §6

Report each inconsistency as: file name → rule violated → current value → expected value.
