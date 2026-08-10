# Fantasy Draft Assistant V3

Mock-draft-ready upgrade for a 12-team Yahoo half-PPR league.

New in V3:
- Deep 200+ player pool
- QB/RB/WR/TE/DST/K
- Separate MY PICK and TAKEN
- Search and positional filters
- Snake-draft next-pick math
- Draft history with undo
- Browser persistence
- ADP field
- Late-round DST/K suppression
- Roster-needs and positional-scarcity logic

Data note:
The upper tiers are anchored to current August 2026 consensus signals from FantasyPros/Yahoo/ESPN.
The deeper player pool and ADP values are intended for mock-draft testing and should be refreshed again immediately before the August 23 draft as injuries, depth charts, and Yahoo ADP change.

Deploy:
Replace index.html, styles.css, app.js, README.md and add players.js in the GitHub repository. Commit the changes and Cloudflare should redeploy automatically.
